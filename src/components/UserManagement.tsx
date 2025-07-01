// src/components/UserManagement.tsx - Fixed Version
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
  const [showAllPending, setShowAllPending] = useState(false)
  const [showAllApproved, setShowAllApproved] = useState(false)
  const [pendingPage, setPendingPage] = useState(1)
  const [approvedPage, setApprovedPage] = useState(1)

  // Constants
  const INITIAL_DISPLAY = 10
  const ITEMS_PER_PAGE = 20

  // Data Hooks
  const { data: users = [], isLoading, error, refetch } = useAllUsers()
  const userActionMutation = useUserAction()
  const deleteUserMutation = useDeleteUser()
  const promoteUserMutation = usePromoteUser()

  // Sort function
  const sortUsers = (users: ExtendedUser[]) => {
    return [...users].sort((a, b) => {
      // First, sort by role (admins first)
      if (a.role === 'admin' && b.role !== 'admin') return -1
      if (a.role !== 'admin' && b.role === 'admin') return 1
      
      // Then sort alphabetically by name
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'et-EE')
    })
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.player_name && user.player_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Separate and sort pending and approved users
  const allPendingUsers = sortUsers(
    filteredUsers.filter(user => 
      user.status === 'pending_email' || 
      (user.status === 'pending_approval' && user.email_verified && !user.admin_approved)
    )
  )

  const allApprovedUsers = sortUsers(
    filteredUsers.filter(user => 
      user.status === 'approved' || user.admin_approved
    )
  )

  // Pagination logic for pending users
  const getPendingUsersToDisplay = () => {
    if (!showAllPending) {
      return allPendingUsers.slice(0, INITIAL_DISPLAY)
    }
    const startIndex = (pendingPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return allPendingUsers.slice(startIndex, endIndex)
  }

  // Pagination logic for approved users
  const getApprovedUsersToDisplay = () => {
    if (!showAllApproved) {
      return allApprovedUsers.slice(0, INITIAL_DISPLAY)
    }
    const startIndex = (approvedPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return allApprovedUsers.slice(startIndex, endIndex)
  }

  const pendingUsers = getPendingUsersToDisplay()
  const approvedUsers = getApprovedUsersToDisplay()

  // Calculate total pages
  const totalPendingPages = Math.ceil(allPendingUsers.length / ITEMS_PER_PAGE)
  const totalApprovedPages = Math.ceil(allApprovedUsers.length / ITEMS_PER_PAGE)

  // Check if there are more users to show
  const hasMorePending = !showAllPending ? allPendingUsers.length > INITIAL_DISPLAY : pendingPage < totalPendingPages
  const hasMoreApproved = !showAllApproved ? allApprovedUsers.length > INITIAL_DISPLAY : approvedPage < totalApprovedPages

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

  // Handle show more for pending users
  const handleShowMorePending = () => {
    if (!showAllPending) {
      setShowAllPending(true)
      setPendingPage(1)
    } else {
      setPendingPage(pendingPage + 1)
    }
  }

  // Handle show more for approved users
  const handleShowMoreApproved = () => {
    if (!showAllApproved) {
      setShowAllApproved(true)
      setApprovedPage(1)
    }
  }

  // Handle page change for approved users
  const handleApprovedPageChange = (page: number) => {
    setApprovedPage(page)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-900/30 to-red-800/20 
                        border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4
                        shadow-[0_0_20px_rgba(255,0,64,0.3)]">
            <span className="text-4xl text-red-400">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Viga andmete laadimisel</h2>
          <p className="text-gray-400 mb-6">Kasutajate andmeid ei õnnestunud laadida.</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 
                     hover:from-red-700 hover:to-red-800 
                     text-white rounded-xl font-medium border border-red-500/30
                     shadow-[0_0_15px_rgba(255,0,64,0.3)]"
          >
            Proovi uuesti
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '4s' }}></div>
        
        {/* Scan Line Effect */}
        <div className="scan-line"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Unified Admin Header */}
        <AdminPageHeader
          title="Kasutajate haldamine"
          description="Halda kõiki kasutajakontosid ja õigusi"
          icon="👥"
          stats={[
            { label: 'Kinnitatud', value: allApprovedUsers.length, color: 'green' },
            { label: 'Ootab kinnitust', value: allPendingUsers.length, color: 'yellow' },
            { label: 'Kokku kasutajaid', value: users.length, color: 'blue' }
          ]}
          onRefresh={refetch}
          isLoading={isLoading}
        />

        {/* Search Section with Futuristic Style */}
        <div className="tech-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50"></div>
          <div className="relative z-10">
            <UserManagementSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>

        {/* Pending Users Section */}
        {allPendingUsers.length > 0 && (
          <div className="tech-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50"></div>
            
            {/* Section Header */}
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 
                              border border-yellow-500/30 rounded-xl flex items-center justify-center
                              shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                  <span className="text-yellow-400 text-xl">⏳</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white font-['Orbitron'] tracking-wider">
                    Kinnitust ootavad kasutajad
                  </h2>
                  <p className="text-gray-400 text-sm">Kasutajad, kes vajavad admin kinnitust</p>
                </div>
                {/* Decorative Line */}
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/20 to-transparent"></div>
              </div>
              
              <PendingUsersTable
                users={pendingUsers}
                isLoading={isLoading}
                onAction={handleAction}
                actionLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending ? 'loading' : null}
              />
            </div>
          </div>
        )}

        {/* All Users Section */}
        <div className="tech-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-900/30 to-green-800/20 
                            border border-green-500/30 rounded-xl flex items-center justify-center
                            shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white font-['Orbitron'] tracking-wider">
                  Kõik kasutajad
                </h2>
                <p className="text-gray-400 text-sm">Registreeritud ja kinnitatud kasutajad</p>
              </div>
              {/* Decorative Line */}
              <div className="flex-1 h-px bg-gradient-to-r from-green-500/20 to-transparent"></div>
            </div>
            
            <AllUsersTable
              users={approvedUsers}
              totalUsers={allApprovedUsers.length}
              isLoading={isLoading}
              onAction={handleAction}
              actionLoading={userActionMutation.isPending || deleteUserMutation.isPending || promoteUserMutation.isPending ? 'loading' : null}
              hasMore={hasMoreApproved}
              onShowMore={handleShowMoreApproved}
              isShowingAll={showAllApproved}
              currentPage={approvedPage}
              totalPages={totalApprovedPages}
              onPageChange={handleApprovedPageChange}
            />
          </div>
        </div>

        {/* Action Modal */}
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