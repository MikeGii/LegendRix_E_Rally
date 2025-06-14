// src/components/UserManagement.tsx - Estonian Translation
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
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.player_name && user.player_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
      alert('Tegevus ebaõnnestus. Palun proovige uuesti.')
    }
  }

  const handleCancelAction = () => {
    setCurrentAction(null)
    setRejectionReason('')
  }

  const getActionText = (type: ActionType): { title: string; description: string; confirmText: string } => {
    switch (type) {
      case 'approve':
        return {
          title: 'Kinnita kasutaja',
          description: 'Kas olete kindel, et soovite selle kasutaja kinnitada?',
          confirmText: 'Kinnita'
        }
      case 'reject':
        return {
          title: 'Lükka kasutaja tagasi',
          description: 'Kas olete kindel, et soovite selle kasutaja tagasi lükata?',
          confirmText: 'Lükka tagasi'
        }
      case 'delete':
        return {
          title: 'Kustuta kasutaja',
          description: 'See tegevus on lõplik ja seda ei saa tagasi võtta!',
          confirmText: 'Kustuta'
        }
      case 'make_admin':
        return {
          title: 'Tee administraatoriks',
          description: 'Kas olete kindel, et soovite anda sellele kasutajale administraatori õigused?',
          confirmText: 'Tee administraatoriks'
        }
      default:
        return {
          title: 'Kinnita tegevus',
          description: 'Kas olete kindel?',
          confirmText: 'Kinnita'
        }
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-red-400">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Viga andmete laadimisel</h2>
          <p className="text-slate-400 mb-6">Kasutajate andmeid ei õnnestunud laadida.</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
          >
            Proovi uuesti
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <UserManagementHeader
          totalUsers={users.length}
          pendingCount={pendingUsers.length}
          approvedCount={approvedUsers.length}
          isLoading={isLoading}
          onRefresh={refetch}
        />

        {/* Search */}
        <UserManagementSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Pending Users Section */}
        <PendingUsersTable
          users={pendingUsers}
          isLoading={isLoading}
          onAction={handleAction}
          actionLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending ? 'loading' : null}
        />

        {/* All Users Section */}
        <AllUsersTable
          users={approvedUsers}
          isLoading={isLoading}
          onAction={handleAction}
          actionLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending ? 'loading' : null}
        />

        {/* Action Confirmation Modal */}
        {currentAction && (
          <UserActionModal
            isOpen={!!currentAction}
            onClose={handleCancelAction}
            onConfirm={handleConfirmAction}
            actionText={getActionText(currentAction.type)}
            user={currentAction.user}
            isLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            showReasonInput={currentAction.type === 'reject'}
          />
        )}
      </div>
    </div>
  )
}