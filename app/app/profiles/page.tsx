// app/app/profiles/page.tsx
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Shield, Network } from "lucide-react";

export default async function ProfilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!dbUser || dbUser.role === "EMPLOYEE") redirect("/app/dashboard");

  // Dummy data for now - later we will fetch this from a `roleProfiles` table
  const profiles = [
    {
      id: "1",
      name: "Software Engineer",
      department: "Engineering",
      taskCount: 12,
      entraGroupMapped: false,
    },
    {
      id: "2",
      name: "Sales Representative",
      department: "Sales",
      taskCount: 8,
      entraGroupMapped: true,
      entraGroupName: "SG-Sales-Global"
    },
    {
      id: "3",
      name: "HR Manager",
      department: "Human Resources",
      taskCount: 15,
      entraGroupMapped: false,
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role Profiles</h1>
          <p className="text-sm text-slate-500">Manage onboarding templates and Microsoft Entra group mappings.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Profile
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <Card key={profile.id} className="relative overflow-hidden hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                  {profile.department}
                </Badge>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {profile.taskCount} Tasks
                </span>
              </div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Standard equipment and access provisioning template.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-slate-50 border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className={`h-4 w-4 ${profile.entraGroupMapped ? "text-blue-500" : "text-slate-400"}`} />
                  <span className="text-xs font-medium text-slate-700">Entra ID Mapping</span>
                </div>
                
                {profile.entraGroupMapped ? (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                    {profile.entraGroupName}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 border-slate-200 border-dashed">
                    Unmapped
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}