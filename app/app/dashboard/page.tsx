import { db } from "@/db";
import TriggerOnboardingButton from "@/components/dashboard/TriggerOnboardingButton";
import { eq } from "drizzle-orm";
import { users, onboardingWorkflows } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ActiveWorkflowsTable from "@/components/dashboard/ActiveWorkflowsTable";
import { StatCard } from "@/components/ui/StatCard";
import { seedDashboardData } from "@/actions/seed";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the user's tenant connection
  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  // If this is a brand new auth user with no tenant data, show the initializer
  if (!dbUser) {
    return (
      <div className="flex-1 p-8 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Harmony OP</h2>
        <p className="text-slate-600 mb-6">Your tenant is not initialized yet.</p>
        <form action={seedDashboardData}>
          <Button type="submit" size="lg">Initialize Tenant & Generate Mock Data</Button>
        </form>
      </div>
    );
  }

  // Direct Server-Side Fetching for the Tenant
  const activeWorkflows = await db.query.onboardingWorkflows.findMany({
    where: eq(onboardingWorkflows.orgId, dbUser.orgId),
    with: {
      newHire: true,
      tasks: true,
    },
    orderBy: (workflows, { desc }) => [desc(workflows.createdAt)],
  });

  const totalOnboardings = activeWorkflows.length;
  const pendingITTasks = activeWorkflows.flatMap(w => w.tasks).filter(t => t.taskType === "IT_ACCESS" && t.status !== "DONE").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview for {dbUser.department}</p>
        </div>
        {/* Replace the old static Button with our new Component */}
        <TriggerOnboardingButton />
        </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Onboardings" value={totalOnboardings} />
        <StatCard title="Avg. Time-to-Productivity" value="14 Days" />
        <StatCard title="Pending IT Tasks" value={pendingITTasks} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Active New Hire Workflows</h2>
        <ActiveWorkflowsTable data={activeWorkflows} />
      </div>
    </div>
  );
}