// src/components/user-management/UserTable.tsx - Updated with Player Name column
import { ExtendedUser } from '@/hooks/useExtendedUsers'
import { UserTableRow } from './UserTableRow'

interface UserTableProps {
  users: ExtendedUser[]
  onAction: (type: 'approve' | 'reject' | 'delete' | 'make_admin', user: ExtendedUser) => void
  actionLoading: string | null
  showApprovalActions: boolean
}

export function UserTable({ users, onAction, actionLoading, showApprovalActions }: UserTableProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Account Name</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Player Name</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Role</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Email</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Account Created</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Last Login</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                index={index}
                onAction={onAction}
                actionLoading={actionLoading}
                showApprovalActions={showApprovalActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}