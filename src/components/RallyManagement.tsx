'use client'

import { useState } from 'react'
import { useRallies } from '@/hooks/useRallyManagement'
import { RallyManagementHeader } from '@/components/rally-management/RallyManagementHeader'
import { RalliesGrid } from '@/components/rally-management/RalliesGrid'
import { CreateRallyModal } from '@/components/rally-management/CreateRallyModal'

export function RallyManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRally, setEditingRally] = useState<any>(null)

  // Data hooks
  const { data: rallies = [], isLoading, refetch } = useRallies()

  const handleCreateRally = () => {
    setEditingRally(null)
    setShowCreateModal(true)
  }

  const handleEditRally = (rally: any) => {
    setEditingRally(rally)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingRally(null)
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <RallyManagementHeader 
          totalRallies={rallies.length}
          onCreateRally={handleCreateRally}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Rallies Grid */}
        <RalliesGrid
          rallies={rallies}
          isLoading={isLoading}
          onEditRally={handleEditRally}
          onRefresh={handleRefresh}
        />

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateRallyModal
            rally={editingRally}
            onClose={handleCloseModal}
            onSuccess={handleRefresh}
          />
        )}
      </div>
    </div>
  )
}