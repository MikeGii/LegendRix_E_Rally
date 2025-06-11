// src/components/user-management/UserTableRow.tsx
import { useState } from 'react'
import { ExtendedUser } from '@/hooks/useExtendedUsers'

interface UserTableRowProps {
  user: ExtendedUser
  index: number
  onAction: (type: 'approve' | 'reject' | 'delete' | 'make_admin', user: ExtendedUser) => void
  actionLoading: string | null
  showApprovalActions: boolean
}

export function UserTableRow({ 
  user, 
  index, 
  onAction, 
  actionLoading, 
  showApprovalActions 
}: UserTableRowProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <tr className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-all duration-200 ${
      index % 2 === 0 ? 'bg-slate-800/10' : ''
    }`}>
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{user.name}</p>
            <div className="flex items-center space-x-2 mt-1">
              {!user.email_verified && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                  Email Pending
                </span>
              )}
              {user.status === 'pending_approval' && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                  Approval Needed
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
        </span>
      </td>
      <td className="p-4">
        <span className="text-slate-300">{user.email}</span>
      </td>
      <td className="p-4">
        <span className="text-slate-300 text-sm">
          {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </td>
      <td className="p-4">
        <span className="text-slate-400 text-sm">
          {user.last_login 
            ? new Date(user.last_login).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Never'
          }
        </span>
      </td>
      <td className="p-4">
        <div className="relative">
          {showApprovalActions && (
            <div className="flex space-x-2">
              {/* Only show approve button if email is verified */}
              {user.email_verified ? (
                <button
                  onClick={() => onAction('approve', user)}
                  disabled={actionLoading === user.id}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading === user.id ? '⏳' : '✅'} Approve
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1 bg-gray-600 text-gray-400 rounded text-sm font-medium cursor-not-allowed opacity-50"
                  title="User must verify email first"
                >
                  📧 Email Required
                </button>
              )}
              <button
                onClick={() => onAction('reject', user)}
                disabled={actionLoading === user.id}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading === user.id ? '⏳' : '❌'} Reject
              </button>
            </div>
          )}
          
          {!showApprovalActions && (
            <>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
              >
                ⋯
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[160px]">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => {
                        onAction('make_admin', user)
                        setShowActions(false)
                      }}
                      disabled={actionLoading === user.id}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 disabled:opacity-50"
                    >
                      👑 Make Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onAction('delete', user)
                      setShowActions(false)
                    }}
                    disabled={actionLoading === user.id}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                  >
                    🗑️ Delete Account
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}