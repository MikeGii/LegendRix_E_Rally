interface RallyManagementHeaderProps {
  totalRallies: number
  onCreateRally: () => void
  onRefresh: () => void
  isLoading: boolean
}

export function RallyManagementHeader({ 
  totalRallies, 
  onCreateRally, 
  onRefresh, 
  isLoading 
}: RallyManagementHeaderProps) {
  const handleBackToAdmin = () => {
    window.location.href = '/admin-dashboard'
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={handleBackToAdmin}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
            >
              <span>←</span>
              <span>Back to Admin</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Rally Management</h1>
          </div>
          <p className="text-slate-400 mb-4">Create and manage rally competitions using your game data</p>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-slate-300">Total Rallies: {totalRallies}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-slate-300">Active: {totalRallies}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
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
          
          <button
            onClick={onCreateRally}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            <div className="flex items-center space-x-2">
              <span>➕</span>
              <span>Create Rally</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}