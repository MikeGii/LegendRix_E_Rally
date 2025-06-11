// src/components/admin/RejectionModal.tsx
import { PendingUser } from '@/hooks/useOptimizedUsers'

interface RejectionModalProps {
  isOpen: boolean
  user: PendingUser | null
  reason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export function RejectionModal({
  isOpen,
  user,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isLoading
}: RejectionModalProps) {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Reject Registration</h3>
        <p className="text-slate-300 mb-6">
          You are about to reject <strong className="text-white">{user.name}</strong> ({user.email}).
        </p>
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
        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
          >
            {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
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