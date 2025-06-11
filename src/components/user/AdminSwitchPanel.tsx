// src/components/user/AdminSwitchPanel.tsx
interface AdminSwitchPanelProps {
  canSwitchView: boolean
  currentView: string
}

export function AdminSwitchPanel({ canSwitchView, currentView }: AdminSwitchPanelProps) {
  if (!canSwitchView || currentView !== 'user') return null

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Administrator Tools</h3>
          <p className="text-slate-400 text-sm">Switch back to admin panel to manage users and system settings</p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin-dashboard'}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        >
          <div className="flex items-center space-x-2">
            <span>👑</span>
            <span>Admin Panel</span>
          </div>
        </button>
      </div>
    </div>
  )
}