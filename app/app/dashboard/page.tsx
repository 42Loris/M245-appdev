// app/app/dashboard/page.tsx
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { users, onboardingWorkflows, onboardingProfiles } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ActiveWorkflowsTable from "@/components/dashboard/ActiveWorkflowsTable";
import { StatCard } from "@/components/ui/StatCard";
import { UserPlus, Clock, CheckCircle2 } from "lucide-react";
import TriggerOnboardingButton from "@/components/dashboard/TriggerOnboardingButton";
import { seedDashboardData } from "@/actions/seed";
import { Button } from "@/components/ui/button";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Welcome to Harmony OP</h2>
        <p className="text-slate-600 mb-6">Your tenant is not initialized yet.</p>
        <form action={seedDashboardData}>
          <Button type="submit" size="lg">Initialize Tenant & Generate Mock Data</Button>
        </form>
      </div>
    );
  }

  // ==== EMPLOYEE VIEW ROUTING ====
  if (dbUser.role === "EMPLOYEE") {
    // Fetch specifically this employee's workflow
    const myWorkflow = await db.query.onboardingWorkflows.findFirst({
      where: eq(onboardingWorkflows.newHireId, dbUser.id),
      with: { tasks: true },
      orderBy: [desc(onboardingWorkflows.createdAt)],
    });

    return <EmployeeDashboard workflow={myWorkflow} userName={dbUser.name} />;
  }

  // ==== HR/ADMIN VIEW ROUTING (Existing Logic) ====
  const activeWorkflows = await db.query.onboardingWorkflows.findMany({
    where: eq(onboardingWorkflows.orgId, dbUser.orgId),
    with: {
      newHire: true,
      tasks: true,
    },
    orderBy: [desc(onboardingWorkflows.createdAt)],
  });

  const profiles = await db.query.onboardingProfiles.findMany({
    where: eq(onboardingProfiles.orgId, dbUser.orgId),
  });

  const totalOnboardings = activeWorkflows.length;
  const pendingITTasks = activeWorkflows.flatMap((w: any) => w.tasks || []).filter((t: any) => t.taskType === "IT_ACCESS" && t.status !== "DONE").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active onboardings and system tasks.</p>
        </div>
        <TriggerOnboardingButton profiles={profiles} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Active Onboardings" value={totalOnboardings} icon={<UserPlus className="h-4 w-4 text-blue-600" />} trend="+2 this week" />
        <StatCard title="Pending IT Tasks" value={pendingITTasks} icon={<Clock className="h-4 w-4 text-amber-600" />} trend="Needs attention" />
        <StatCard title="Completed (30d)" value={12} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} trend="98% SLA met" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Active Workflows</h2>
        </div>
        <div className="p-6">
          <ActiveWorkflowsTable data={activeWorkflows} />
        </div>
      </div>
    </div>
  );
}