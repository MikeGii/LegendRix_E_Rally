// src/components/user-management/UserActionModal.tsx
import { ExtendedUser } from '@/hooks/useExtendedUsers'

interface UserAction {
  type: 'delete' | 'make_admin' | 'approve' | 'reject'
  user: ExtendedUser
}

interface UserActionModalProps {
  action: UserAction | null
  reason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export function UserActionModal({
  action,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isLoading
}: UserActionModalProps) {
  if (!action) return null

  const getModalContent = () => {
    switch (action.type) {
      case 'delete':
        return {
          title: 'Delete User Account',
          message: `Are you sure you want to delete ${action.user.name}'s account? This action cannot be undone and will remove all associated data.`,
          confirmText: 'Delete Account',
          confirmColor: 'red',
          icon: '🗑️',
          showReasonInput: false
        }
      
      case 'make_admin':
        return {
          title: 'Promote to Administrator',
          message: `Are you sure you want to promote ${action.user.name} to administrator? They will have full access to the admin panel.`,
          confirmText: 'Make Admin',
          confirmColor: 'purple',
          icon: '👑',
          showReasonInput: false
        }
      
      case 'approve':
        return {
          title: 'Approve User Account',
          message: `Approve ${action.user.name}'s account? They will receive email notification and gain access to rally features.`,
          confirmText: 'Approve Account',
          confirmColor: 'green',
          icon: '✅',
          showReasonInput: false
        }
      
      case 'reject':
        return {
          title: 'Reject User Account',
          message: `Reject ${action.user.name}'s account? They will receive email notification with the reason.`,
          confirmText: 'Reject Account',
          confirmColor: 'red',
          icon: '❌',
          showReasonInput: true
        }
      
      default:
        return null
    }
  }

  const content = getModalContent()
  if (!content) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{content.icon}</span>
          <h3 className="text-xl font-semibold text-white">{content.title}</h3>
        </div>
        
        <p className="text-slate-300 mb-6">
          {content.message}
        </p>
        
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">
            <strong>User:</strong> {action.user.name} ({action.user.email})
          </p>
          <p className="text-sm text-slate-400">
            <strong>Role:</strong> {action.user.role}
          </p>
        </div>

        {content.showReasonInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Reason for rejection (optional):
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="e.g., Incomplete information, suspicious activity, etc."
            />
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-lg disabled:opacity-50 ${
              content.confirmColor === 'red' 
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-800 hover:shadow-red-500/25'
                : content.confirmColor === 'green'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800 hover:shadow-green-500/25'
                : content.confirmColor === 'purple'
                ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 hover:shadow-purple-500/25'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 hover:shadow-blue-500/25'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              content.confirmText
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}