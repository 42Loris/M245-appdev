// actions/profile-tasks.ts
"use server";

import { db } from "@/db";
import { profileTasks } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addProfileTaskAction(formData: FormData) {
  const profileId = formData.get("profileId") as string;
  const title = formData.get("title") as string;
  const taskType = formData.get("taskType") as string;

  if (!profileId || !title || !taskType) {
    return { error: "Missing required fields" };
  }

  try {
    await db.insert(profileTasks).values({
      profileId,
      title,
      taskType,
    });

    revalidatePath(`/app/profiles/${profileId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add task:", error);
    return { error: "Could not add task." };
  }
}