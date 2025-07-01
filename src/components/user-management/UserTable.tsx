// src/components/user-management/UserTable.tsx - Redesigned with Futuristic Theme
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
    <div className="bg-black/50 rounded-xl border border-gray-800/50 overflow-hidden shadow-[0_0_20px_rgba(255,0,64,0.1)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50">
              <th className="text-left px-6 py-4 font-medium text-gray-300 font-['Orbitron'] tracking-wider text-sm">
                Konto nimi
              </th>
              <th className="text-left px-6 py-4 font-medium text-gray-300 font-['Orbitron'] tracking-wider text-sm">
                Mängijanimi
              </th>
              <th className="text-left px-6 py-4 font-medium text-gray-300 font-['Orbitron'] tracking-wider text-sm">
                E-mail
              </th>
              <th className="text-left px-6 py-4 font-medium text-gray-300 font-['Orbitron'] tracking-wider text-sm">
                Konto loodud
              </th>
              <th className="text-center px-6 py-4 font-medium text-gray-300 font-['Orbitron'] tracking-wider text-sm">
                Tegevused
              </th>
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