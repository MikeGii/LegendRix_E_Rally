// src/components/admin/UserFilters.tsx
interface UserFiltersProps {
  filter: 'all' | 'pending_verification' | 'pending_approval'
  onFilterChange: (filter: 'all' | 'pending_verification' | 'pending_approval') => void
  filteredUsersCount: number
  pendingEmailCount: number
  pendingApprovalCount: number
}

export function UserFilters({ 
  filter, 
  onFilterChange, 
  filteredUsersCount, 
  pendingEmailCount, 
  pendingApprovalCount 
}: UserFiltersProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          filter === 'all' 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
        }`}
      >
        All ({filteredUsersCount})
      </button>
      <button
        onClick={() => onFilterChange('pending_verification')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          filter === 'pending_verification' 
            ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/25' 
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
        }`}
      >
        Email Pending ({pendingEmailCount})
      </button>
      <button
        onClick={() => onFilterChange('pending_approval')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          filter === 'pending_approval' 
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/25' 
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
        }`}
      >
        Ready for Approval ({pendingApprovalCount})
      </button>
    </div>
  )
}