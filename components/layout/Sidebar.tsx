// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  CheckSquare, 
  Settings,
  Hexagon,
  ClipboardCheck
} from "lucide-react";


const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Active Workflows", href: "/app/workflows", icon: Activity },
  { name: "IT Tasks", href: "/app/tasks", icon: CheckSquare },
  { name: "HR Tasks", href: "/app/hr-tasks", icon: ClipboardCheck }, // <-- Add this
  { name: "Profiles", href: "/app/profiles", icon: Users },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 px-6 font-bold text-xl tracking-tight border-b border-slate-800">
        <Hexagon className="h-6 w-6 text-blue-500 fill-blue-500/20" />
        <span>Harmony OP</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Tenant Area (Placeholder for now) */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-md bg-slate-800 p-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
            HR
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin User</span>
            <span className="text-xs text-slate-400">Muster AG</span>
          </div>
        </div>
      </div>
    </div>
  );
}