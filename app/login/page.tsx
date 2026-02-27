// app/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signInWithMicrosoftAction } from "@/actions/auth";

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

        {/* === MICROSOFT SSO BUTTON === */}
        <form action={signInWithMicrosoftAction} className="mb-6">
          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Sign in with Microsoft
          </button>
        </form>

        <div className="relative mb-6 flex items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Oder mit E-Mail
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        {/* ============================ */}

        <LoginForm />
      </div>
    </div>
  );
}