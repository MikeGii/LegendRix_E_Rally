// src/components/user-management/PendingUsersTable.tsx - Estonian Translation
import { ExtendedUser } from '@/hooks/useExtendedUsers'
import { UserTable } from './UserTable'

interface PendingUsersTableProps {
  users: ExtendedUser[]
  isLoading: boolean
  onAction: (type: 'approve' | 'reject' | 'delete' | 'make_admin', user: ExtendedUser) => void
  actionLoading: string | null
}

export function PendingUsersTable({ 
  users, 
  isLoading, 
  onAction, 
  actionLoading 
}: PendingUsersTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Ootel kontod</h2>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin ootel kasutajaid...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
        <span>⏳</span>
        <span>Ootel kontod ({users.length})</span>
      </h2>
      
      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-green-400">✅</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Kõik on korras!</h3>
          <p className="text-slate-400">Pole ühtegi kontot, mis vajaks kinnitust.</p>
        </div>
      ) : (
        <UserTable 
          users={users} 
          onAction={onAction} 
          actionLoading={actionLoading}
          showApprovalActions={true}
        />
      )}
    </div>
  )
}