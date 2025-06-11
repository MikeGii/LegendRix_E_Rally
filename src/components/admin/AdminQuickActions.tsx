// src/components/admin/AdminQuickActions.tsx
export function AdminQuickActions() {
  const handleUserManagement = () => {
    window.location.href = '/user-management'
  }

  const handleRallyManagement = () => {
    // TODO: Implement rally management page
    alert('Rally Management page coming soon!')
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        <button 
          onClick={handleUserManagement}
          className="flex items-center space-x-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
        >
          <span className="text-xl">👥</span>
          <span>User Management</span>
        </button>
        
        <button 
          onClick={handleRallyManagement}
          className="flex items-center space-x-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
        >
          <span className="text-xl">🏁</span>
          <span>Rally Management</span>
        </button>
      </div>
    </div>
  )
}