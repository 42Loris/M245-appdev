// app/api/sync/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { 
  organizationIntegrations, 
  roleProfiles, 
  users, 
  onboardingWorkflows, 
  workflowTasks,
  profileTasks
} from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get the HR User's Organization
    const dbUser = await db.query.users.findFirst({ where: eq(users.authId, user.id) });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Fetch the Microsoft Keys we saved earlier
    const integration = await db.query.organizationIntegrations.findFirst({
      where: and(
        eq(organizationIntegrations.orgId, dbUser.orgId),
        eq(organizationIntegrations.provider, "MICROSOFT_ENTRA")
      ),
    });

    if (!integration || !integration.tenantId || !integration.clientId || !integration.clientSecret) {
      return NextResponse.json({ error: "Microsoft Integration not configured" }, { status: 400 });
    }

    // 3. Trade the keys for a Microsoft Graph Access Token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${integration.tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: integration.clientId,
        scope: "https://graph.microsoft.com/.default",
        client_secret: integration.clientSecret,
        grant_type: "client_credentials",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to authenticate with Microsoft", details: tokenData }, { status: 401 });
    }

    const accessToken = tokenData.access_token;

    // 4. Find all Role Profiles that have an Entra Group ID mapped
    const profiles = await db.query.roleProfiles.findMany({
      where: eq(roleProfiles.orgId, dbUser.orgId),
      with: { defaultTasks: true },
    });

    const mappedProfiles = profiles.filter(p => p.entraGroupId !== null);
    let newHiresProcessed = 0;

    // 5. Loop through each mapped group and ask Microsoft: "Who is in this group?"
    for (const profile of mappedProfiles) {
      const groupRes = await fetch(`https://graph.microsoft.com/v1.0/groups/${profile.entraGroupId}/members`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!groupRes.ok) continue; // Skip if group not found or error
      const groupData = await groupRes.json();
      const members = groupData.value; // Array of Microsoft Users

      for (const member of members) {
        // Check if this person is already in our database
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, member.mail || member.userPrincipalName)
        });

        if (!existingUser) {
          // A NEW HIRE HAS APPEARED! Let's generate their entire onboarding process.
          
          // A. Create the User in Harmony OP
          const [newUser] = await db.insert(users).values({
            orgId: dbUser.orgId,
            email: member.mail || member.userPrincipalName,
            name: member.displayName,
            role: "EMPLOYEE",
            department: profile.department,
          }).returning();

          // B. Create their Onboarding Workflow
          const [newWorkflow] = await db.insert(onboardingWorkflows).values({
            orgId: dbUser.orgId,
            newHireId: newUser.id,
            profileId: profile.id,
            roleTitle: profile.name,
            department: profile.department,
            startDate: new Date(), 
          }).returning();

          // C. Generate all their default tasks instantly
          if (profile.defaultTasks.length > 0) {
            const tasksToInsert = profile.defaultTasks.map(task => ({
              workflowId: newWorkflow.id,
              title: task.title,
              taskType: task.taskType as "IT_ACCESS" | "HARDWARE" | "TRAINING" | "HR_ADMIN",
              status: "PENDING" as const,
            }));
            await db.insert(workflowTasks).values(tasksToInsert);
          }

          newHiresProcessed++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete. ${newHiresProcessed} new hires processed.` 
    });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}