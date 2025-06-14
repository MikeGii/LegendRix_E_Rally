// src/components/user-management/UserActionModal.tsx - Fixed Interface & Estonian
import { ExtendedUser } from '@/hooks/useExtendedUsers'

interface ActionText {
  title: string
  description: string
  confirmText: string
}

interface UserActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  actionText: ActionText
  user: ExtendedUser
  isLoading: boolean
  rejectionReason?: string
  setRejectionReason?: (reason: string) => void
  showReasonInput?: boolean
}

export function UserActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionText,
  user,
  isLoading,
  rejectionReason = '',
  setRejectionReason,
  showReasonInput = false
}: UserActionModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm()
  }

  // Determine modal styling based on action type
  const getActionColor = () => {
    if (actionText.confirmText.includes('Kustuta') || actionText.confirmText.includes('Lükka tagasi')) {
      return 'red'
    }
    if (actionText.confirmText.includes('administraator')) {
      return 'purple'
    }
    return 'green'
  }

  const actionColor = getActionColor()

  const colorClasses = {
    red: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: '❌',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmRing: 'focus:ring-red-500'
    },
    green: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: '✅',
      confirmBg: 'bg-green-600 hover:bg-green-700',
      confirmRing: 'focus:ring-green-500'
    },
    purple: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      icon: '👑',
      confirmBg: 'bg-purple-600 hover:bg-purple-700',
      confirmRing: 'focus:ring-purple-500'
    }
  }

  const colors = colorClasses[actionColor]

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${colors.bg} ${colors.border} border
              `}>
                <span className="text-2xl">{colors.icon}</span>
              </div>
              
              {/* Title */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {actionText.title}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Kasutaja: {user.name}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleConfirm}>
            <div className="px-6 pb-4">
              {/* Description */}
              <p className="text-slate-300 leading-relaxed mb-4">
                {actionText.description}
              </p>

              {/* User Info */}
              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nimi:</span>
                    <span className="text-white">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">E-mail:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  {user.player_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mängijanimi:</span>
                      <span className="text-blue-400">{user.player_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Roll:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role === 'admin' ? '👑 Administraator' : '👤 Kasutaja'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection Reason Input */}
              {showReasonInput && setRejectionReason && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tagasilükkamise põhjus <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Palun kirjeldage, miks see konto lükati tagasi..."
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                    rows={3}
                    required={showReasonInput}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/30 rounded-b-2xl border-t border-slate-700/50 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tühista
              </button>
              <button
                type="submit"
                disabled={isLoading || (showReasonInput && !rejectionReason.trim())}
                className={`
                  flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${colors.confirmBg} ${colors.confirmRing}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Töötleb...</span>
                  </div>
                ) : (
                  actionText.confirmText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}