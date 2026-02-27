// app/app/tasks/page.tsx
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users, onboardingWorkflows } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusDropdown from "@/components/tasks/StatusDropdown";

export default async function ITTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!dbUser) redirect("/app/dashboard");

  const workflows = await db.query.onboardingWorkflows.findMany({
    where: eq(onboardingWorkflows.orgId, dbUser.orgId),
    with: {
      newHire: true,
      tasks: true,
    },
  });

  const itTasks = workflows.flatMap((wf: any) => 
    (wf.tasks || [])
      .filter((t: any) => t.taskType === "IT_ACCESS" || t.taskType === "HARDWARE")
      .map((t: any) => ({
        ...t,
        employeeName: wf.newHire?.name || "Unknown",
        role: wf.roleTitle,
      }))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">IT & Hardware Tasks</h1>
        <p className="text-sm text-slate-500">Manage equipment and system access for new hires.</p>
      </header>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-medium">Task</TableHead>
              <TableHead className="font-medium">Employee</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                  No IT tasks pending.
                </TableCell>
              </TableRow>
            ) : (
              itTasks.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium text-slate-900">{task.title}</TableCell>
                  <TableCell className="text-slate-600">{task.employeeName}</TableCell>
                  <TableCell className="text-slate-600">{task.role}</TableCell>
                  <TableCell className="text-right">
                    <StatusDropdown taskId={task.id} currentStatus={task.status} />
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