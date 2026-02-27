// app/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function LoginPage() {
  // MUST await createClient now
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Harmony OP</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage your KMU onboarding workflows.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}