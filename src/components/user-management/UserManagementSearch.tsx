// src/components/user-management/UserManagementSearch.tsx
interface UserManagementSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  resultsCount: number
}

export function UserManagementSearch({ 
  searchTerm, 
  onSearchChange, 
  resultsCount 
}: UserManagementSearchProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-slate-400 text-sm">
          {resultsCount} users found
        </div>
      </div>
    </div>
  )
}