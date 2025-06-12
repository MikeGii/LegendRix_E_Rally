// src/components/UserManagement.tsx - Simplified from 300+ lines to ~100 lines

'use client'

import { useState } from 'react'
import { useAllUsers, useUserAction, useDeleteUser, usePromoteUser } from '@/hooks/useExtendedUsers'
import { PageHeader, SearchBar, UserTable, SimpleModal } from '@/components/shared'

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ type: string; user: any; message: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Data and mutations
  const { data: users = [], isLoading, error, refetch } = useAllUsers()
  const { mutateAsync: approveUser, isPending: approvePending } = useUserAction()
  const { mutateAsync: deleteUser, isPending: deletePending } = useDeleteUser()
  const { mutateAsync: promoteUser, isPending: promotePending } = usePromoteUser()

  // Filter users
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingUsers = filteredUsers.filter(user => 
    user.status === 'pending_email' || 
    (user.status === 'pending_approval' && user.email_verified && !user.admin_approved)
  )

  const approvedUsers = filteredUsers.filter(user => 
    user.status === 'approved' || user.admin_approved
  )

  // Calculate stats
  const userStats = [
    { label: 'Total Users', value: users.length },
    { label: 'Pending Email', value: users.filter(u => u.status === 'pending_email').length },
    { label: 'Pending Approval', value: pendingUsers.length },
    { label: 'Approved', value: users.filter(u => u.status === 'approved').length },
    { label: 'Rejected', value: users.filter(u => u.status === 'rejected').length }
  ]

  // Action handlers
  const handleAction = (type: string, user: any) => {
    const messages: Record<string, string> = {
      approve: `Approve ${user.name}'s account? They will receive email notification.`,
      reject: `Reject ${user.name}'s account? They will receive email notification.`,
      delete: `Delete ${user.name}'s account? This cannot be undone.`,
      make_admin: `Promote ${user.name} to administrator? They will have full access.`
    }

    setConfirmAction({ type, user, message: messages[type] || 'Confirm this action?' })
    setRejectionReason('')
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    try {
      const { type, user } = confirmAction

      switch (type) {
        case 'approve':
        case 'reject':
          await approveUser({ userId: user.id, action: type as 'approve' | 'reject', reason: rejectionReason })
          break
        case 'delete':
          await deleteUser(user.id)
          break
        case 'make_admin':
          await promoteUser(user.id)
          break
      }

      setConfirmAction(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Action failed:', error)
      alert('Action failed. Please try again.')
    }
  }

  const isActionLoading = approvePending || deletePending || promotePending

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-red-400">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load users</h3>
          <p className="text-slate-400 mb-4">There was an error loading the user data.</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header with Stats */}
        <PageHeader
          title="User Management"
          description="Manage all user accounts and permissions"
          backUrl="/admin-dashboard"
          backLabel="Back to Admin"
          stats={userStats}
        />

        {/* Search */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredUsers.length}
          onRefresh={refetch}
          isLoading={isLoading}
        />

        {/* Pending Users */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <span>⏳</span>
            <span>Pending Accounts ({pendingUsers.length})</span>
          </h2>
          
          <UserTable
            users={pendingUsers}
            isLoading={isLoading}
            onAction={handleAction}
            actionLoading={isActionLoading ? confirmAction?.user?.id : null}
            showApprovalActions={true}
          />
        </div>

        {/* All Users */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <span>👥</span>
            <span>All Users ({approvedUsers.length})</span>
          </h2>
          
          <UserTable
            users={approvedUsers}
            isLoading={isLoading}
            onAction={handleAction}
            actionLoading={isActionLoading ? confirmAction?.user?.id : null}
            showApprovalActions={false}
          />
        </div>

        {/* Confirmation Modals */}
        {confirmAction && confirmAction.type === 'reject' && (
          <SimpleModal
            isOpen={true}
            onClose={() => setConfirmAction(null)}
            title="Reject User Account"
          >
            <div className="space-y-4">
              <p className="text-slate-300">{confirmAction.message}</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Optional: Provide a reason for rejection..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmAction}
                  disabled={isActionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200"
                >
                  Reject User
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SimpleModal>
        )}

        {confirmAction && confirmAction.type !== 'reject' && (
          <SimpleModal
            isOpen={true}
            onClose={() => setConfirmAction(null)}
            title={`${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)} User`}
          >
            <div className="space-y-4">
              <p className="text-slate-300">{confirmAction.message}</p>
              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmAction}
                  disabled={isActionLoading}
                  className={`flex-1 px-4 py-2 text-white rounded-xl transition-all duration-200 ${
                    confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isActionLoading ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SimpleModal>
        )}
      </div>
    </div>
  )
}