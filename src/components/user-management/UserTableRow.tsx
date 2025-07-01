// src/components/user-management/UserTableRow.tsx - Simplified with Inline Actions
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
  const [showEmail, setShowEmail] = useState(false)
  const [showFullName, setShowFullName] = useState(false)

  const formatEstonianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmailPreview = (email: string) => {
    return email.substring(0, 3)
  }

  const getNameDisplay = (name: string) => {
    const nameParts = name.trim().split(' ')
    if (nameParts.length > 1 && !showFullName) {
      return nameParts[0] // Show only first name
    }
    return name
  }

  const hasMultipleNames = (name: string) => {
    return name.trim().split(' ').length > 1
  }

  return (
    <tr className={`border-b border-gray-800/30 hover:bg-gray-900/30 transition-all duration-200 ${
      user.role === 'admin' 
        ? 'bg-gradient-to-r from-yellow-900/10 to-orange-900/10' 
        : ''
    }`}>
      {/* Account Name Column */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${user.role === 'admin' 
                          ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                          : 'bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 shadow-[0_0_10px_rgba(255,0,64,0.3)]'
                        }`}>
            <span className={`font-bold ${user.role === 'admin' ? 'text-yellow-400' : 'text-red-400'}`}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-white flex items-center space-x-1">
                <span>{getNameDisplay(user.name)}</span>
                {user.role === 'admin' && <span className="text-yellow-400" title="Admin">👑</span>}
              </p>
              {hasMultipleNames(user.name) && (
                <button
                  onClick={() => setShowFullName(!showFullName)}
                  className="p-1 hover:bg-gray-800/50 rounded transition-colors group"
                  title={showFullName ? "Peida täisnimi" : "Näita täisnime"}
                >
                  {!showFullName ? (
                    <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-400 transition-colors" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {!user.email_verified && (
                <span className="px-2 py-0.5 bg-yellow-900/30 border border-yellow-500/30 
                               text-yellow-400 text-xs rounded-md font-['Orbitron']">
                  E-mail ootel
                </span>
              )}
              {user.status === 'pending_approval' && (
                <span className="px-2 py-0.5 bg-orange-900/30 border border-orange-500/30 
                               text-orange-400 text-xs rounded-md font-['Orbitron']">
                  Vajab kinnitust
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Player Name Column */}
      <td className="px-6 py-4">
        {user.player_name ? (
          <span className="text-purple-400 font-medium flex items-center space-x-2">
            <span className="text-lg">🎮</span>
            <span>{user.player_name}</span>
          </span>
        ) : (
          <span className="text-gray-500 italic">Ei ole määratud</span>
        )}
      </td>

      {/* Email Column with Privacy Feature */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {!showEmail ? (
            <button
              onClick={() => setShowEmail(true)}
              className="flex items-center space-x-1 px-3 py-1.5 
                       bg-gray-900/50 hover:bg-gray-800/50 
                       border border-gray-700/50 hover:border-red-500/30
                       rounded-lg transition-all duration-200 group"
            >
              <span className="text-gray-400 font-mono text-sm">{getEmailPreview(user.email)}•••</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 font-mono text-sm">{user.email}</span>
              <button
                onClick={() => setShowEmail(false)}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors group"
                title="Peida e-mail"
              >
                <svg className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </td>

      {/* Date Column */}
      <td className="px-6 py-4">
        <span className="text-gray-400 text-sm">{formatEstonianDate(user.created_at)}</span>
      </td>

      {/* Actions Column - Simplified */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center space-x-2">
          {actionLoading === user.id ? (
            <div className="w-6 h-6 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin" />
          ) : (
            <>
              {/* For pending users - show approve/reject buttons */}
              {showApprovalActions && user.status !== 'approved' && (
                <>
                  <button
                    onClick={() => onAction('approve', user)}
                    className="p-2 bg-green-900/20 hover:bg-green-900/30 
                             border border-green-500/30 hover:border-green-500/50
                             rounded-lg transition-all duration-200 group"
                    title="Kinnita kasutaja"
                  >
                    <svg className="w-5 h-5 text-green-400 group-hover:text-green-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                            d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onAction('reject', user)}
                    className="p-2 bg-red-900/20 hover:bg-red-900/30 
                             border border-red-500/30 hover:border-red-500/50
                             rounded-lg transition-all duration-200 group"
                    title="Lükka tagasi"
                  >
                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* For all users - show admin/delete buttons */}
              {!showApprovalActions && (
                <>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onAction('make_admin', user)}
                      className="p-2 bg-purple-900/20 hover:bg-purple-900/30 
                               border border-purple-500/30 hover:border-purple-500/50
                               rounded-lg transition-all duration-200 group"
                      title="Tee administraatoriks"
                    >
                      <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" 
                           fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.86-2h8.28l.57-2H7.43l.43 2zm1-4h6.28l.57-2H8.43l.43 2zm10.14 9c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onAction('delete', user)}
                    className="p-2 bg-red-900/20 hover:bg-red-900/30 
                             border border-red-500/30 hover:border-red-500/50
                             rounded-lg transition-all duration-200 group"
                    title="Kustuta kasutaja"
                  >
                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}