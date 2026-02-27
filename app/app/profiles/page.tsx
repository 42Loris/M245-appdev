// app/app/profiles/page.tsx
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { users, onboardingProfiles } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import CreateProfileButton from "@/components/profiles/CreateProfileButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ProfilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!dbUser) redirect("/app/dashboard");

  // Fetch all profiles for this organization
  const profiles = await db.query.onboardingProfiles.findMany({
    where: eq(onboardingProfiles.orgId, dbUser.orgId),
    orderBy: [desc(onboardingProfiles.createdAt)],
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role Profiles</h1>
          <p className="text-sm text-slate-500">Standardize onboarding workflows by department and role.</p>
        </div>
        <CreateProfileButton />
      </header>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-medium">Role Title</TableHead>
              <TableHead className="font-medium">Department</TableHead>
              <TableHead className="font-medium text-right">Created On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                  No role profiles configured yet. Click "Add Role Profile" to create one.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium text-slate-900">{profile.roleTitle}</TableCell>
                  <TableCell className="text-slate-600">{profile.department}</TableCell>
                  <TableCell className="text-slate-600 text-right">
                    {format(new Date(profile.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}