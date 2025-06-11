// src/components/user-management/UserManagementHeader.tsx
interface UserManagementHeaderProps {
  totalUsers: number
  pendingCount: number
  approvedCount: number
  isLoading: boolean
  onRefresh: () => void
}

export function UserManagementHeader({ 
  totalUsers, 
  pendingCount, 
  approvedCount, 
  isLoading, 
  onRefresh 
}: UserManagementHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">Manage all user accounts and permissions</p>
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-slate-300">Total Users: {totalUsers}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-sm text-slate-300">Pending: {pendingCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-slate-300">Approved: {approvedCount}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔄</span>
                <span>Refresh</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}