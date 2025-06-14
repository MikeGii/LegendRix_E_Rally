// src/components/user-management/UserManagementSearch.tsx - Estonian Translation
interface UserManagementSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function UserManagementSearch({ searchTerm, onSearchChange }: UserManagementSearchProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Otsi kasutajaid nime, e-maili või mängijanime järgi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
          >
            Tühista
          </button>
        )}
      </div>
    </div>
  )
}