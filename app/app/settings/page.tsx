// app/app/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tenant Settings</h1>
        <p className="text-sm text-slate-500">Manage your organization's integrations and preferences.</p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Integrations</h3>
        
        <div className="border border-slate-200 rounded-lg p-6 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              Microsoft Entra ID (SSO)
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Upcoming</span>
            </h4>
            <p className="text-sm text-slate-500 mt-1">Automatically sync users and groups directly from your Microsoft Tenant.</p>
          </div>
          <button className="px-4 py-2 bg-slate-100 text-slate-400 font-medium rounded-md cursor-not-allowed" disabled>
            Connect Tenant
          </button>
        </div>
      </div>
    </div>
  );
}