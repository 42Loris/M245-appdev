// components/dashboard/EmployeeDashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Monitor, Key, FileText } from "lucide-react";

export default function EmployeeDashboard({ workflow, userName }: { workflow: any, userName: string }) {
  if (!workflow) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-2">Welcome to the team, {userName}!</h2>
        <p className="text-slate-600">Your onboarding workflow hasn't been initialized yet. Hang tight!</p>
      </div>
    );
  }

  const tasks = workflow.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const getTaskIcon = (type: string) => {
    if (type === "IT_ACCESS") return <Key className="h-5 w-5" />;
    if (type === "HARDWARE") return <Monitor className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getStatusIcon = (status: string) => {
    if (status === "DONE") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "IN_PROGRESS") return <Clock className="h-5 w-5 text-blue-500" />;
    return <Circle className="h-5 w-5 text-slate-300" />;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome aboard, {userName}!</h1>
        <p className="text-slate-600 text-lg">Here is the real-time status of your equipment and access setup.</p>
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="bg-slate-50 border-b p-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Overall Progress</p>
              <h3 className="text-2xl font-bold text-slate-900">{progressPercent}% Ready</h3>
            </div>
            <p className="text-sm text-slate-500">{completedTasks} of {totalTasks} steps completed</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <h3 className="text-xl font-semibold mb-4 text-slate-900">Your Setup Checklist</h3>
      <div className="grid gap-3">
        {tasks.map((task: any) => (
          <Card key={task.id} className={`transition-all ${task.status === "DONE" ? "bg-slate-50/50 border-green-100" : ""}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${task.status === "DONE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {getTaskIcon(task.taskType)}
                </div>
                <div>
                  <p className={`font-medium ${task.status === "DONE" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-slate-500">Handled by {task.taskType.replace("_", " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 mr-2">
                  {task.status.replace("_", " ")}
                </span>
                {getStatusIcon(task.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}