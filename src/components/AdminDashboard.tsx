'use client'

import { useState } from 'react'
import { useUsers, useUserStats, useUserAction, useRealtimeUsers, PendingUser } from '@/hooks/useOptimizedUsers'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminQuickActions } from '@/components/admin/AdminQuickActions'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { UserFilters } from '@/components/admin/UserFilters'
import { UserTable } from '@/components/admin/UserTable'
import { RejectionModal } from '@/components/admin/RejectionModal'

type FilterType = 'all' | 'pending_verification' | 'pending_approval'

export function AdminDashboard() {
  // State Management
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  // Data Hooks
  const { data: users = [], isLoading, error, refetch } = useUsers()
  const userStats = useUserStats()
  const userActionMutation = useUserAction()
  
  // Setup real-time updates
  useRealtimeUsers()

  // Computed Values
  const filteredUsers = getFilteredUsers(users, filter)
  const actionLoading = userActionMutation.isPending ? selectedUser?.id || null : null

  // Event Handlers
  const handleRefresh = () => {
    refetch()
  }

  const handleApprove = async (user: PendingUser) => {
    console.log('👍 Approve button clicked for user:', user.email)
    try {
      await userActionMutation.mutateAsync({ 
        userId: user.id, 
        action: 'approve' 
      })
    } catch (error) {
      alert('Failed to approve user. Please try again.')
    }
  }

  const handleReject = (user: PendingUser) => {
    console.log('👎 Reject button clicked for user:', user.email)
    setSelectedUser(user)
    setShowRejectModal(true)
  }

  const handleConfirmRejection = async () => {
    if (!selectedUser) return

    try {
      await userActionMutation.mutateAsync({
        userId: selectedUser.id,
        action: 'reject',
        reason: rejectionReason
      })
      
      // Close modal and reset state
      setShowRejectModal(false)
      setSelectedUser(null)
      setRejectionReason('')
    } catch (error) {
      alert('Failed to reject user. Please try again.')
    }
  }

  const handleCancelRejection = () => {
    setShowRejectModal(false)
    setSelectedUser(null)
    setRejectionReason('')
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-red-400">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load data</h3>
          <p className="text-slate-400 mb-4">There was an error loading the admin dashboard.</p>
          <button
            onClick={handleRefresh}
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
        
        {/* Header Section */}
        <AdminHeader 
          userStats={userStats}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        {/* Quick Action Bar */}
        <AdminQuickActions />

        {/* Stats Cards */}
        <AdminStatsCards stats={userStats} />

        {/* User Management Section */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-white">User Management</h2>
            
            {/* Filter Pills */}
            <UserFilters
              filter={filter}
              onFilterChange={handleFilterChange}
              filteredUsersCount={filteredUsers.length}
              pendingEmailCount={userStats.pendingEmail}
              pendingApprovalCount={userStats.pendingApproval}
            />
          </div>
          
          {/* User Table */}
          <UserTable
            users={filteredUsers}
            isLoading={isLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            onRefresh={handleRefresh}
            actionLoading={actionLoading}
          />
        </div>

        {/* Rejection Modal */}
        <RejectionModal
          isOpen={showRejectModal}
          user={selectedUser}
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleConfirmRejection}
          onCancel={handleCancelRejection}
          isLoading={userActionMutation.isPending}
        />
      </div>
    </div>
  )
}

// Helper Functions
function getFilteredUsers(users: PendingUser[], filter: FilterType): PendingUser[] {
  return users.filter(user => {
    if (filter === 'all') {
      return (user.status === 'pending_email' || user.status === 'pending_approval') && 
            !user.admin_approved;
    }
    if (filter === 'pending_verification') {
      return user.status === 'pending_email' && !user.email_verified;
    }
    if (filter === 'pending_approval') {
      return user.status === 'pending_approval' && 
            user.email_verified && 
            !user.admin_approved;
    }
    return true;
  });
}