// app/app/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user from Postgres to get their Role and Name
  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
    with: {
      organization: true, // Assuming you want to display the Org Name
    }
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Pass the dynamic data to our Client Component */}
      <Sidebar 
        userRole={dbUser.role} 
        userName={dbUser.name} 
        orgName={dbUser.organization?.name || "Harmony OP"} 
      />
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}