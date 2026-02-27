"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { organizations, users, onboardingWorkflows, workflowTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function seedDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Check if user already exists in our public users table
  const existingUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (existingUser) return { success: true, message: "Already seeded" };

  // 1. Create Organization (Tenant)
  const [org] = await db.insert(organizations).values({
    name: "Muster AG",
  }).returning();

  // 2. Link Auth User to Tenant
  const [dbUser] = await db.insert(users).values({
    orgId: org.id,
    authId: user.id,
    email: user.email!,
    name: "Admin User",
    role: "HR",
    department: "Human Resources",
  }).returning();

  // 3. Create 3 Mock Workflows (matching our mockup)
  const [w1, w2, w3] = await db.insert(onboardingWorkflows).values([
    { orgId: org.id, newHireId: dbUser.id, roleTitle: "Software Engineer", department: "Engineering", startDate: new Date("2025-10-01"), progressRatio: 75 },
    { orgId: org.id, newHireId: dbUser.id, roleTitle: "IT Operations", department: "IT", startDate: new Date("2025-10-15"), progressRatio: 40 },
    { orgId: org.id, newHireId: dbUser.id, roleTitle: "Marketing Manager", department: "Marketing", startDate: new Date("2025-11-01"), progressRatio: 10 },
  ]).returning();

  // 4. Create Tasks for the workflows to power the Badges
  await db.insert(workflowTasks).values([
    { workflowId: w1.id, title: "AD Account", taskType: "IT_ACCESS", status: "DONE" },
    { workflowId: w1.id, title: "Laptop", taskType: "HARDWARE", status: "DONE" },
    { workflowId: w2.id, title: "AD Account", taskType: "IT_ACCESS", status: "IN_PROGRESS" },
    { workflowId: w2.id, title: "Laptop", taskType: "HARDWARE", status: "PENDING" },
    { workflowId: w3.id, title: "AD Account", taskType: "IT_ACCESS", status: "BLOCKED" },
    { workflowId: w3.id, title: "Laptop", taskType: "HARDWARE", status: "PENDING" },
  ]);

revalidatePath("/app/dashboard");
    // Return nothing (void) to satisfy Next.js 15 form action typings
  } catch (error) {
    console.error("Seed error:", error);
    // Return nothing (void)
  }