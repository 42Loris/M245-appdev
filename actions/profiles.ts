// actions/profiles.ts
"use server";

import { db } from "@/db";
import { roleProfiles, users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

const ProfileSchema = z.object({
  name: z.string().min(2, "Profile name is required"),
  department: z.string().min(2, "Department is required"),
});

export async function createProfileAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const hrUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  
  if (!hrUser) return { error: "Tenant not found" };

  const payload = {
    name: formData.get("name")?.toString() || "",
    department: formData.get("department")?.toString() || "",
  };

  const parsed = ProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Invalid input" };
  }

  try {
    // Insert into the new Microsoft-ready table!
    await db.insert(roleProfiles).values({
      orgId: hrUser.orgId,
      name: parsed.data.name,
      department: parsed.data.department,
    });

    revalidatePath("/app/profiles");
    return { success: true, timestamp: Date.now() };
  } catch (error) {
    console.error("Failed to create profile:", error);
    return { error: "Database error. Could not create profile." };
  }
}