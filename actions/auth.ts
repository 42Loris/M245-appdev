// actions/auth.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = LoginSchema.safeParse({ email, password });
  
  // FIX: Access Zod's 'issues' array safely to satisfy strict TypeScript
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message || "Invalid credentials" };
  }

  // MUST await createClient now
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/app/dashboard");
}

// === NEW SIGN OUT ACTION ===
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithMicrosoftAction() {
  const supabase = await createClient();
  
  // WICHTIG: Ersetze http://localhost:3000 später durch deine Vercel-URL, 
  // wenn du es live testest (oder nutze eine Umgebungsvariable)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'email profile', // Wir fragen nach Email und Profilbild
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("OAuth Error:", error.message);
    redirect("/login?error=microsoft_auth_failed");
  }

  if (data.url) {
    redirect(data.url); // Schickt den Nutzer zur Microsoft-Seite
  }
}