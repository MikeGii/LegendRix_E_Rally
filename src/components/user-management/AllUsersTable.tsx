// src/components/user-management/AllUsersTable.tsx - With Pagination
import { ExtendedUser } from '@/hooks/useExtendedUsers'
import { UserTable } from './UserTable'

interface AllUsersTableProps {
  users: ExtendedUser[]
  totalUsers: number
  isLoading: boolean
  onAction: (type: 'approve' | 'reject' | 'delete' | 'make_admin', user: ExtendedUser) => void
  actionLoading: string | null
  hasMore: boolean
  onShowMore: () => void
  isShowingAll: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function AllUsersTable({ 
  users, 
  totalUsers,
  isLoading, 
  onAction, 
  actionLoading,
  hasMore,
  onShowMore,
  isShowingAll,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: AllUsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-red-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-red-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-4">Laadin kasutajaid...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0 && totalUsers === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-900/50 to-gray-800/30 
                      border border-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4
                      shadow-[0_0_20px_rgba(156,163,175,0.2)]">
          <span className="text-4xl text-gray-500">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Kinnitatud kasutajaid ei leitud</h3>
        <p className="text-gray-400">Praeguste otsingukriteeriumitega kinnitatud kasutajaid ei leitud.</p>
      </div>
    )
  }

  return (
    <div>
      <UserTable 
        users={users} 
        onAction={onAction} 
        actionLoading={actionLoading}
        showApprovalActions={false}
      />
      
      {/* Pagination Controls */}
      {!isShowingAll && hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onShowMore}
            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900
                     hover:from-red-900/20 hover:to-red-800/20
                     border border-gray-700 hover:border-red-500/50
                     rounded-lg transition-all duration-300
                     text-white font-['Orbitron'] tracking-wider
                     flex items-center space-x-2 group"
          >
            <span>Näita kõiki kasutajaid ({totalUsers})</span>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Page Navigation for when showing all */}
      {isShowingAll && totalPages > 1 && onPageChange && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gradient-to-r from-gray-800 to-gray-900
                     hover:from-red-900/20 hover:to-red-800/20
                     border border-gray-700 hover:border-red-500/50
                     rounded-lg transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-lg font-['Orbitron'] text-sm transition-all duration-300
                              ${currentPage === page
                                ? 'bg-red-900/30 border border-red-500/50 text-red-400'
                                : 'bg-gray-900/50 border border-gray-700 text-gray-400 hover:border-red-500/30 hover:text-red-400'
                              }`}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="text-gray-600">...</span>
              }
              return null
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-gradient-to-r from-gray-800 to-gray-900
                     hover:from-red-900/20 hover:to-red-800/20
                     border border-gray-700 hover:border-red-500/50
                     rounded-lg transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Page info */}
      {isShowingAll && totalPages > 1 && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500 font-['Orbitron']">
            Lehekülg {currentPage} / {totalPages} • Näitan {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalUsers)} kasutajat {totalUsers}-st
          </span>
        </div>
      )}
    </div>
  )
}