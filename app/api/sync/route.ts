// app/api/sync/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { 
  organizationIntegrations, 
  roleProfiles, 
  users, 
  onboardingWorkflows, 
  workflowTasks
} from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    // Check if this request is coming from our automated Vercel Cron Job
    const authHeader = req.headers.get("authorization");
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    let integrationsToSync = [];

    if (isCronJob) {
      // 🤖 CRON MODE: Find ALL companies in the database that have Microsoft connected
      integrationsToSync = await db.query.organizationIntegrations.findMany({
        where: eq(organizationIntegrations.provider, "MICROSOFT_ENTRA"),
      });
    } else {
      // 🧑‍💻 MANUAL MODE: Check the logged-in user and only sync their company
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const dbUser = await db.query.users.findFirst({ where: eq(users.authId, user.id) });
      if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const integration = await db.query.organizationIntegrations.findFirst({
        where: and(
          eq(organizationIntegrations.orgId, dbUser.orgId),
          eq(organizationIntegrations.provider, "MICROSOFT_ENTRA")
        ),
      });

      if (!integration) {
        return NextResponse.json({ error: "Microsoft Integration not configured" }, { status: 400 });
      }
      integrationsToSync = [integration];
    }

    let totalNewHiresProcessed = 0;

    // Loop through the integrations (either just 1, or all of them if Cron)
    for (const integration of integrationsToSync) {
      if (!integration.tenantId || !integration.clientId || !integration.clientSecret) continue;

      // Trade keys for Microsoft Access Token
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
      if (!tokenData.access_token) continue; 
      const accessToken = tokenData.access_token;

      // Find Role Profiles mapped to Entra ID for this specific organization
      const profiles = await db.query.roleProfiles.findMany({
        where: eq(roleProfiles.orgId, integration.orgId),
        with: { defaultTasks: true },
      });

      const mappedProfiles = profiles.filter(p => p.entraGroupId !== null);

      for (const profile of mappedProfiles) {
        const groupRes = await fetch(`https://graph.microsoft.com/v1.0/groups/${profile.entraGroupId}/members`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!groupRes.ok) continue;
        const groupData = await groupRes.json();
        const members = groupData.value;

        for (const member of members) {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, member.mail || member.userPrincipalName)
          });

          if (!existingUser) {
            // Create User
            const [newUser] = await db.insert(users).values({
              orgId: integration.orgId,
              email: member.mail || member.userPrincipalName,
              name: member.displayName || "Unknown User",
              role: "EMPLOYEE",
              department: profile.department,
            }).returning();

            // Create Workflow
            const [newWorkflow] = await db.insert(onboardingWorkflows).values({
              orgId: integration.orgId,
              newHireId: newUser.id,
              profileId: profile.id,
              roleTitle: profile.name,
              department: profile.department,
              startDate: new Date(), 
            }).returning();

            // Create Tasks
            if (profile.defaultTasks.length > 0) {
              const tasksToInsert = profile.defaultTasks.map(task => ({
                workflowId: newWorkflow.id,
                title: task.title,
                taskType: task.taskType as "IT_ACCESS" | "HARDWARE" | "TRAINING" | "HR_ADMIN",
                status: "PENDING" as const,
              }));
              await db.insert(workflowTasks).values(tasksToInsert);
            }
            totalNewHiresProcessed++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete. ${totalNewHiresProcessed} new hires processed.` 
    });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}