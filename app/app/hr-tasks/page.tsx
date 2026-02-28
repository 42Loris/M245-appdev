// app/app/hr-tasks/page.tsx
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users, onboardingWorkflows } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TaskCard from "@/components/tasks/TaskCard";

export default async function HRTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!dbUser || dbUser.role === "EMPLOYEE") redirect("/app/dashboard");

  // Fetch workflows and strictly include ONLY HR tasks
  const workflows = await db.query.onboardingWorkflows.findMany({
    where: eq(onboardingWorkflows.orgId, dbUser.orgId),
    with: {
      newHire: true,
      tasks: true,
    },
  });

  // Flatten and filter the tasks for the HR Board
  const hrTasks = workflows.flatMap((wf: any) => 
    (wf.tasks || [])
      .filter((t: any) => t.taskType === "HR_ADMIN")
      .map((t: any) => ({
        ...t,
        employeeName: wf.newHire?.name || "Unknown",
        role: wf.roleTitle,
      }))
  );

  // Group tasks by status for the Kanban columns
  const pendingTasks = hrTasks.filter(t => t.status === "PENDING");
  const inProgressTasks = hrTasks.filter(t => t.status === "IN_PROGRESS" || t.status === "BLOCKED");
  const doneTasks = hrTasks.filter(t => t.status === "DONE");

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">HR Administration Tasks</h1>
        <p className="text-sm text-slate-500">Manage payroll setup, contracts, and welcome packages.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PENDING COLUMN */}
        <div className="bg-slate-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-semibold text-slate-700">Pending</h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{pendingTasks.length}</span>
          </div>
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} employeeName={task.employeeName} role={task.role} />
            ))}
            {pendingTasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No pending tasks</p>}
          </div>
        </div>

        {/* IN PROGRESS / BLOCKED COLUMN */}
        <div className="bg-slate-100 rounded-lg p-4 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-semibold text-slate-700">In Progress</h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{inProgressTasks.length}</span>
          </div>
          <div className="space-y-4">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} employeeName={task.employeeName} role={task.role} />
            ))}
            {inProgressTasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nothing in progress</p>}
          </div>
        </div>

        {/* DONE COLUMN */}
        <div className="bg-slate-100 rounded-lg p-4 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-semibold text-slate-700">Completed</h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{doneTasks.length}</span>
          </div>
          <div className="space-y-4">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} employeeName={task.employeeName} role={task.role} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}