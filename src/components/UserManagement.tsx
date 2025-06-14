// src/components/UserManagement.tsx - Updated with Unified Admin Design
'use client'

import { useState } from 'react'
import { useAllUsers, useUserAction, useDeleteUser, usePromoteUser, ExtendedUser } from '@/hooks/useExtendedUsers'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
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
  }

  const handleConfirmAction = async () => {
    if (!currentAction) return

    const { type, user } = currentAction

    try {
      switch (type) {
        case 'approve':
          await userActionMutation.mutateAsync({ userId: user.id, action: 'approve' })
          break
        case 'reject':
          if (!rejectionReason.trim()) {
            alert('Palun sisestage tagasilükkamise põhjus')
            return
          }
          await userActionMutation.mutateAsync({ 
            userId: user.id, 
            action: 'reject',
            reason: rejectionReason 
          })
          break
        case 'delete':
          await deleteUserMutation.mutateAsync(user.id)
          break
        case 'make_admin':
          await promoteUserMutation.mutateAsync(user.id)
          break
      }
      setCurrentAction(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  const getActionConfig = (type: ActionType) => {
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
          description: 'Palun sisestage tagasilükkamise põhjus:',
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
        
        {/* Unified Admin Header */}
        <AdminPageHeader
          title="Kasutajate haldamine"
          description="Halda kõiki kasutajakontosid ja õigusi"
          icon="👥"
          stats={[
            { label: 'Kinnitatud', value: approvedUsers.length, color: 'green' },
            { label: 'Ootab kinnitust', value: pendingUsers.length, color: 'yellow' },
            { label: 'Kokku kasutajaid', value: users.length, color: 'blue' }
          ]}
          onRefresh={refetch}
          isLoading={isLoading}
        />

        {/* Search */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <UserManagementSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Pending Users Section */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-xl">⏳</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Kinnitust ootavad kasutajad</h2>
              <p className="text-slate-400">Kasutajad, kes vajavad admin kinnitust</p>
            </div>
          </div>
          
          <PendingUsersTable
            users={pendingUsers}
            isLoading={isLoading}
            onAction={handleAction}
            actionLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending ? 'loading' : null}
          />
        </div>

        {/* All Users Section */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <AllUsersTable
            users={approvedUsers}
            isLoading={isLoading}
            onAction={handleAction}
            actionLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending ? 'loading' : null}
          />
        </div>

        {/* Action Confirmation Modal */}
        {currentAction && (
          <UserActionModal
            isOpen={!!currentAction}
            onClose={() => {
              setCurrentAction(null)
              setRejectionReason('')
            }}
            onConfirm={handleConfirmAction}
            user={currentAction.user}
            actionText={getActionConfig(currentAction.type)}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            showReasonInput={currentAction.type === 'reject'}
            isLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}