// app/app/workflows/page.tsx
export default function WorkflowsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Active Workflows</h1>
        <p className="text-sm text-slate-500">A detailed view of all ongoing employee onboardings.</p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
        <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Expanded Workflow View Coming Soon</h2>
        <p className="text-slate-500 max-w-md">This page will eventually feature detailed timelines, audit logs, and blocker alerts for every onboarding workflow.</p>
      </div>
    </div>
  );
}