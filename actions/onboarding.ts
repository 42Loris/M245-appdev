// actions/onboarding.ts
"use server";

import { db } from "@/db";
import { users, onboardingWorkflows, workflowTasks, onboardingProfiles } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// 1. Updated Schema to expect a profileId
const TriggerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  profileId: z.string().min(1, "Please select a role profile"),
  startDate: z.string().min(1, "Start date is required"),
});

export async function triggerOnboardingAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const hrUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!hrUser) return { error: "Tenant connection not found" };

  const payload = {
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    profileId: formData.get("profileId")?.toString() || "",
    startDate: formData.get("startDate")?.toString() || "",
  };

  const parsed = TriggerSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Please fill out all fields correctly." };
  }

  const { name, email, profileId, startDate } = parsed.data;

  try {
    // Fetch the selected profile to get the standard role and department
    const profile = await db.query.onboardingProfiles.findFirst({
      where: eq(onboardingProfiles.id, profileId)
    });

    if (!profile) return { error: "Selected profile not found." };

    await db.transaction(async (tx) => {
      // Create the New Hire Profile
      const [newHire] = await tx.insert(users).values({
        orgId: hrUser.orgId,
        email,
        name,
        role: "EMPLOYEE",
        department: profile.department, // Auto-mapped from profile
      }).returning();

      // Initiate the Workflow
      const [workflow] = await tx.insert(onboardingWorkflows).values({
        orgId: hrUser.orgId,
        newHireId: newHire.id,
        profileId: profile.id, // Link it to the profile
        roleTitle: profile.roleTitle, // Auto-mapped from profile
        department: profile.department, // Auto-mapped from profile
        startDate: new Date(startDate),
        progressRatio: 0,
      }).returning();

      // For now, auto-assign standard tasks. (We can make this dynamic per-profile later!)
      await tx.insert(workflowTasks).values([
        { workflowId: workflow.id, title: "Create AD & Email Account", taskType: "IT_ACCESS", status: "PENDING" },
        { workflowId: workflow.id, title: "Order Laptop & Peripherals", taskType: "HARDWARE", status: "PENDING" },
        { workflowId: workflow.id, title: "Setup Payroll", taskType: "HR_ADMIN", status: "PENDING" },
      ]);
    });

    revalidatePath("/app/dashboard");
    return { success: true, timestamp: Date.now() }; 

  } catch (error) {
    console.error(error);
    return { error: "Database transaction failed." };
  }
}