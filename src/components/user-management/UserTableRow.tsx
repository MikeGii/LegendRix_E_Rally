// src/components/user-management/UserTableRow.tsx - Estonian Translation & No Last Login
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

  const formatEstonianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <tr className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-all duration-200 ${
      index % 2 === 0 ? 'bg-slate-800/10' : ''
    }`}>
      {/* Account Name Column */}
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
                  E-mail ootel
                </span>
              )}
              {user.status === 'pending_approval' && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                  Vajab kinnitust
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Player Name Column */}
      <td className="p-4">
        <div className="flex items-center">
          {user.player_name ? (
            <span className="text-blue-400 font-medium flex items-center">
              🎮 {user.player_name}
            </span>
          ) : (
            <span className="text-slate-500 italic">Ei ole määratud</span>
          )}
        </div>
      </td>

      {/* Role Column */}
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {user.role === 'admin' ? '👑 Administraator' : '👤 Kasutaja'}
        </span>
      </td>

      {/* Email Column */}
      <td className="p-4">
        <span className="text-slate-300">{user.email}</span>
      </td>

      {/* Account Created Column */}
      <td className="p-4">
        <span className="text-slate-300 text-sm">
          {formatEstonianDate(user.created_at)}
        </span>
      </td>

      {/* Actions Column */}
      <td className="p-4">
        <div className="relative">
          {showApprovalActions && user.status === 'pending_approval' ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onAction('approve', user)}
                disabled={actionLoading === user.id}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === user.id ? '⏳' : '✅'} Kinnita
              </button>
              <button
                onClick={() => onAction('reject', user)}
                disabled={actionLoading === user.id}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === user.id ? '⏳' : '❌'} Lükka tagasi
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded-lg transition-all duration-200"
              >
                ⚙️ Tegevused
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  <div className="py-1">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          onAction('make_admin', user)
                          setShowActions(false)
                        }}
                        disabled={actionLoading === user.id}
                        className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-slate-700 disabled:opacity-50"
                      >
                        👑 Tee administraatoriks
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onAction('delete', user)
                        setShowActions(false)
                      }}
                      disabled={actionLoading === user.id}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 disabled:opacity-50"
                    >
                      🗑️ Kustuta kasutaja
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}