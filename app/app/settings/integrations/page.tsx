// app/app/settings/integrations/page.tsx
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Key, ShieldCheck, Server } from "lucide-react";

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  // Only HR or Admins should be able to access integration settings!
  if (!dbUser || dbUser.role === "EMPLOYEE") redirect("/app/dashboard");

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">Connect Harmony OP with your company's existing tools.</p>
      </header>

      <div className="grid gap-6">
        {/* Microsoft Entra ID Integration Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50/50 border-b border-slate-100 p-6 flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
              <Server className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Microsoft Entra ID (Active Directory)</h2>
              <p className="text-sm text-slate-600 mt-1">
                Automatically sync new hires, assign them to Microsoft Groups, and trigger onboarding workflows the moment an IT Admin creates their account.
              </p>
            </div>
          </div>
          
          <CardContent className="p-6">
            <form className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6 flex gap-3 items-start">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <strong>Secure Connection:</strong> Your API keys are encrypted at rest. We only request permission to read user directories and manage specific groups.
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-400" /> Tenant ID
                </label>
                <input 
                  type="text" 
                  name="tenantId"
                  placeholder="e.g., 8a7b3c2d-1e2f-..." 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500">Found in Azure Portal &gt; Microsoft Entra ID &gt; Overview</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-400" /> Client ID (Application ID)
                </label>
                <input 
                  type="text" 
                  name="clientId"
                  placeholder="e.g., f1g2h3i4-..." 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-400" /> Client Secret
                </label>
                <input 
                  type="password" 
                  name="clientSecret"
                  placeholder="••••••••••••••••" 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500">Generated under Certificates & secrets in your App Registration</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="button" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}