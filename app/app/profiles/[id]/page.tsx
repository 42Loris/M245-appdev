// app/app/profiles/[id]/page.tsx
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { roleProfiles, profileTasks } from "@/db/schema";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Laptop, Users, GraduationCap, ClipboardList } from "lucide-react";
import { addProfileTaskAction } from "@/actions/profile-tasks";

// Fix: In Next.js 15, params is a Promise!
export default async function ProfileDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Fix: Await the params before extracting the ID
  const { id } = await params;

  // Fetch the specific profile and its tasks using the awaited ID
  const profile = await db.query.roleProfiles.findFirst({
    where: eq(roleProfiles.id, id),
    with: {
      defaultTasks: true,
    },
  });

  if (!profile) redirect("/app/profiles");

  // Helper to get the right icon for the task type
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "IT_ACCESS": return <Laptop className="h-4 w-4 text-blue-500" />;
      case "HARDWARE": return <Laptop className="h-4 w-4 text-purple-500" />;
      case "HR_ADMIN": return <Users className="h-4 w-4 text-pink-500" />;
      case "TRAINING": return <GraduationCap className="h-4 w-4 text-orange-500" />;
      default: return <ClipboardList className="h-4 w-4 text-slate-500" />;
    }
  };

  // Wrapper function to satisfy TypeScript's strict void requirement
  const handleAddTask = async (formData: FormData) => {
    "use server";
    await addProfileTaskAction(formData);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6">
        <Link href="/app/profiles" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Profiles
        </Link>
      </div>

      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Department: {profile.department}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: The Task List */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Default Onboarding Tasks</h2>
          
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {profile.defaultTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No tasks added yet. Add some tasks on the right.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {profile.defaultTasks.map(task => (
                  <li key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-md">
                        {getTaskIcon(task.taskType)}
                      </div>
                      <span className="font-medium text-slate-700">{task.title}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {task.taskType.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Add Task Form */}
        <div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sticky top-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Task
            </h3>
            
            <form action={handleAddTask} className="space-y-4">
              <input type="hidden" name="profileId" value={profile.id} />
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g., Order MacBook Pro" 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Category</label>
                <select 
                  name="taskType" 
                  required 
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="IT_ACCESS">IT Access (Software)</option>
                  <option value="HARDWARE">Hardware (Equipment)</option>
                  <option value="HR_ADMIN">HR & Admin (Payroll, etc.)</option>
                  <option value="TRAINING">Training & Courses</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-md text-sm font-medium transition-colors"
              >
                Save Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}