// src/components/user-management/PendingUsersTable.tsx - With Pagination
import { ExtendedUser } from '@/hooks/useExtendedUsers'
import { UserTable } from './UserTable'

interface PendingUsersTableProps {
  users: ExtendedUser[]
  totalUsers?: number
  isLoading: boolean
  onAction: (type: 'approve' | 'reject' | 'delete' | 'make_admin', user: ExtendedUser) => void
  actionLoading: string | null
  hasMore?: boolean
  onShowMore?: () => void
  isShowingAll?: boolean
  currentPage?: number
}

export function PendingUsersTable({ 
  users, 
  totalUsers,
  isLoading, 
  onAction, 
  actionLoading,
  hasMore,
  onShowMore,
  isShowingAll,
  currentPage = 1
}: PendingUsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-yellow-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-4">Laadin ootel kasutajaid...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-green-900/30 to-green-800/20 
                      border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4
                      shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <span className="text-4xl text-green-400">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Kõik on korras!</h3>
        <p className="text-gray-400">Pole ühtegi kontot, mis vajaks kinnitust.</p>
      </div>
    )
  }

  return (
    <div>
      <UserTable 
        users={users} 
        onAction={onAction} 
        actionLoading={actionLoading}
        showApprovalActions={true}
      />
      
      {/* Pagination Controls - Only show if props are provided */}
      {hasMore && onShowMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onShowMore}
            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900
                     hover:from-yellow-900/20 hover:to-yellow-800/20
                     border border-gray-700 hover:border-yellow-500/50
                     rounded-lg transition-all duration-300
                     text-white font-['Orbitron'] tracking-wider
                     flex items-center space-x-2 group"
          >
            <span>
              {!isShowingAll 
                ? `Näita kõiki (${totalUsers || users.length})` 
                : `Näita rohkem (${users.length}/${totalUsers || users.length})`}
            </span>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Page indicator for multiple pages */}
      {isShowingAll && currentPage && currentPage > 1 && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500 font-['Orbitron']">
            Lehekülg {currentPage}
          </span>
        </div>
      )}
    </div>
  )
}