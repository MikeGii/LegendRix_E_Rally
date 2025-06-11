// src/components/UserManagement.tsx
'use client'

import { useState } from 'react'
import { useAllUsers, useUserAction, useDeleteUser, usePromoteUser, ExtendedUser } from '@/hooks/useExtendedUsers'
import { UserManagementHeader } from '@/components/user-management/UserManagementHeader'
import { UserManagementSearch } from '@/components/user-management/UserManagementSearch'
import { PendingUsersTable } from '@/components/user-management/PendingUsersTable'
import { AllUsersTable } from '@/components/user-management/AllUsersTable'
import { UserActionModal } from '@/components/user-management/UserActionModal'

type ActionType = 'delete' | 'make_admin' | 'approve' | 'reject'

interface UserAction {
  type: ActionType
  user: ExtendedUser
}

export function UserManagement() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [currentAction, setCurrentAction] = useState<UserAction | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Data Hooks
  const { data: users = [], isLoading, error, refetch } = useAllUsers()
  const userActionMutation = useUserAction()
  const deleteUserMutation = useDeleteUser()
  const promoteUserMutation = usePromoteUser()

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Separate pending and approved users
  const pendingUsers = filteredUsers.filter(user => 
    user.status === 'pending_email' || 
    (user.status === 'pending_approval' && user.email_verified && !user.admin_approved)
  )

  const approvedUsers = filteredUsers.filter(user => 
    user.status === 'approved' || user.admin_approved
  )

  // Event Handlers
  const handleAction = (type: ActionType, user: ExtendedUser) => {
    setCurrentAction({ type, user })
    setRejectionReason('')
  }

  const handleConfirmAction = async () => {
    if (!currentAction) return

    try {
      switch (currentAction.type) {
        case 'approve':
          await userActionMutation.mutateAsync({
            userId: currentAction.user.id,
            action: 'approve'
          })
          break
        
        case 'reject':
          await userActionMutation.mutateAsync({
            userId: currentAction.user.id,
            action: 'reject',
            reason: rejectionReason
          })
          break
        
        case 'delete':
          await deleteUserMutation.mutateAsync(currentAction.user.id)
          break
        
        case 'make_admin':
          await promoteUserMutation.mutateAsync(currentAction.user.id)
          break
      }
      
      // Close modal and reset state
      setCurrentAction(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Action failed:', error)
      alert('Action failed. Please try again.')
    }
  }

  const handleCancelAction = () => {
    setCurrentAction(null)
    setRejectionReason('')
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-red-400">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load users</h3>
          <p className="text-slate-400 mb-4">There was an error loading the user management data.</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <UserManagementHeader 
          totalUsers={users.length}
          pendingCount={pendingUsers.length}
          approvedCount={approvedUsers.length}
          isLoading={isLoading}
          onRefresh={() => refetch()}
        />

        {/* Search Bar */}
        <UserManagementSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredUsers.length}
        />

        {/* Pending Users Table */}
        <PendingUsersTable
          users={pendingUsers}
          isLoading={isLoading}
          onAction={handleAction}
          actionLoading={isLoading ? currentAction?.user?.id || null : null}
        />

        {/* All Users Table */}
        <AllUsersTable
          users={approvedUsers}
          isLoading={isLoading}
          onAction={handleAction}
          actionLoading={isLoading ? currentAction?.user?.id || null : null}
        />

        {/* Action Modal */}
        <UserActionModal
          action={currentAction}
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}