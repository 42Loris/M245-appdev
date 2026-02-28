// actions/integrations.ts
"use server";

import { db } from "@/db";
import { organizationIntegrations, users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type IntegrationFormState = {
  error: string | null;
  success: boolean;
  timestamp: number;
};

export async function saveMicrosoftIntegrationAction(
  prevState: IntegrationFormState,
  formData: FormData
): Promise<IntegrationFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized", success: false, timestamp: 0 };
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  
  if (!dbUser || dbUser.role === "EMPLOYEE") {
    return { error: "Unauthorized access", success: false, timestamp: 0 };
  }

  const tenantId = formData.get("tenantId")?.toString();
  const clientId = formData.get("clientId")?.toString();
  const clientSecret = formData.get("clientSecret")?.toString();

  if (!tenantId || !clientId || !clientSecret) {
    return { error: "All fields are required to connect Microsoft Entra.", success: false, timestamp: 0 };
  }

  try {
    // Check if this organization already has a Microsoft integration saved
    const existing = await db.query.organizationIntegrations.findFirst({
      where: and(
        eq(organizationIntegrations.orgId, dbUser.orgId),
        eq(organizationIntegrations.provider, "MICROSOFT_ENTRA")
      ),
    });

    if (existing) {
      // Update existing credentials
      await db.update(organizationIntegrations)
        .set({ 
          tenantId, 
          clientId, 
          clientSecret, 
          updatedAt: new Date() 
        })
        .where(eq(organizationIntegrations.id, existing.id));
    } else {
      // Create new credentials record
      await db.insert(organizationIntegrations).values({
        orgId: dbUser.orgId,
        provider: "MICROSOFT_ENTRA",
        tenantId,
        clientId,
        clientSecret,
      });
    }

    revalidatePath("/app/settings/integrations");
    return { error: null, success: true, timestamp: Date.now() };
  } catch (error) {
    console.error("Failed to save integration:", error);
    return { error: "Database error. Could not save integration.", success: false, timestamp: 0 };
  }
}