// src/components/admin/UserTable.tsx
import { PendingUser } from '@/hooks/useOptimizedUsers'

interface UserTableProps {
  users: PendingUser[]
  isLoading: boolean
  onApprove: (user: PendingUser) => void
  onReject: (user: PendingUser) => void
  onRefresh: () => void
  actionLoading: string | null
}

export function UserTable({ 
  users, 
  isLoading, 
  onApprove, 
  onReject, 
  onRefresh, 
  actionLoading 
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading fresh data...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
        <p className="text-slate-400">No users need attention at this time.</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Refresh Data
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-6 font-medium text-slate-300 bg-slate-800/30">User</th>
              <th className="text-left p-6 font-medium text-slate-300 bg-slate-800/30">Registration</th>
              <th className="text-left p-6 font-medium text-slate-300 bg-slate-800/30">Status</th>
              <th className="text-left p-6 font-medium text-slate-300 bg-slate-800/30">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                index={index}
                onApprove={onApprove}
                onReject={onReject}
                actionLoading={actionLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface UserTableRowProps {
  user: PendingUser
  index: number
  onApprove: (user: PendingUser) => void
  onReject: (user: PendingUser) => void
  actionLoading: string | null
}

function UserTableRow({ user, index, onApprove, onReject, actionLoading }: UserTableRowProps) {
  return (
    <tr className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-all duration-200 ${
      index % 2 === 0 ? 'bg-slate-800/10' : ''
    }`}>
      <td className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500">ID: {user.id.substring(0, 8)}...</p>
          </div>
        </div>
      </td>
      <td className="p-6">
        <p className="text-sm text-slate-300">
          {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </td>
      <td className="p-6">
        <div className="flex flex-col space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
            user.email_verified 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {user.email_verified ? '✅ Email Verified' : '⏳ Email Pending'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
            user.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            user.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            user.admin_approved ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {user.status === 'approved' ? '✅ Approved' :
             user.status === 'rejected' ? '❌ Rejected' :
             user.admin_approved ? '✅ Admin Approved' :
             '⏳ Admin Review'}
          </span>
        </div>
      </td>
      <td className="p-6">
        {user.status === 'pending_approval' && user.email_verified && !user.admin_approved ? (
          <div className="flex space-x-3">
            <button
              onClick={() => onApprove(user)}
              disabled={actionLoading === user.id}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50"
            >
              {actionLoading === user.id ? '⏳' : '✅'} Approve
            </button>
            <button
              onClick={() => onReject(user)}
              disabled={actionLoading === user.id}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
            >
              {actionLoading === user.id ? '⏳' : '❌'} Reject
            </button>
          </div>
        ) : user.status === 'approved' ? (
          <span className="text-green-400 font-medium text-sm">✅ Approved</span>
        ) : user.status === 'rejected' ? (
          <span className="text-red-400 font-medium text-sm">❌ Rejected</span>
        ) : (
          <span className="text-slate-500 text-sm">
            {user.status === 'pending_email' ? '⏳ Waiting for email verification' : '⏳ Processing...'}
          </span>
        )}
      </td>
    </tr>
  )
}