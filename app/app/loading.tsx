// app/app/loading.tsx
import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">Loading workspace...</p>
    </div>
  );
}