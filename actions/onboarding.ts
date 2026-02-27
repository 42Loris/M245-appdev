// actions/onboarding.ts
"use server";

import { db } from "@/db";
import { users, onboardingWorkflows, workflowTasks } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// 1. Strict Payload Validation
const TriggerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  roleTitle: z.string().min(2, "Role is required"),
  department: z.string().min(2, "Department is required"),
  startDate: z.string().min(1, "Start date is required"),
});

export async function triggerOnboardingAction(prevState: any, formData: FormData) {
  // 2. Auth & Tenant Context
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const hrUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  
  if (!hrUser) return { error: "Tenant connection not found" };

  // 3. Defensively parse FormData (convert nulls to empty strings)
  const payload = {
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    roleTitle: formData.get("roleTitle")?.toString() || "",
    department: formData.get("department")?.toString() || "",
    startDate: formData.get("startDate")?.toString() || "",
  };

  const parsed = TriggerSchema.safeParse(payload);
  
  // FIX: Safely access the Zod issues array with optional chaining
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Please fill out all fields correctly." };
  }

  const { name, email, roleTitle, department, startDate } = parsed.data;

  try {
    // 4. Atomic Database Transaction
    await db.transaction(async (tx) => {
      // Create the New Hire Profile
      const [newHire] = await tx.insert(users).values({
        orgId: hrUser.orgId,
        email,
        name,
        role: "EMPLOYEE",
        department,
      }).returning();

      // Initiate the Workflow
      const [workflow] = await tx.insert(onboardingWorkflows).values({
        orgId: hrUser.orgId,
        newHireId: newHire.id,
        roleTitle,
        department,
        startDate: new Date(startDate),
        progressRatio: 0,
      }).returning();

      // Automatically assign standard IT & HR tasks
      await tx.insert(workflowTasks).values([
        { workflowId: workflow.id, title: "Create AD & Email Account", taskType: "IT_ACCESS", status: "PENDING" },
        { workflowId: workflow.id, title: "Order Laptop & Peripherals", taskType: "HARDWARE", status: "PENDING" },
        { workflowId: workflow.id, title: "Setup Payroll", taskType: "HR_ADMIN", status: "PENDING" },
      ]);
    });

    // 5. Instantly update the UI
    revalidatePath("/app/dashboard");
    return { success: true, timestamp: Date.now() }; 

  } catch (error) {
    console.error(error);
    return { error: "Database transaction failed." };
  }
}