// src/components/RallyManagement.tsx - FIXED VERSION with Delete Functionality
'use client'

import { useState } from 'react'
import { useRallies, useDeleteRally } from '@/hooks/useRallyManagement'
import { RallyManagementHeader } from '@/components/rally-management/RallyManagementHeader'
import { RalliesGrid } from '@/components/rally-management/RalliesGrid'
import { CreateRallyModal } from '@/components/rally-management/CreateRallyModal'

export function RallyManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRally, setEditingRally] = useState<any>(null)

  // Data hooks
  const { data: rallies = [], isLoading, refetch } = useRallies()
  const deleteRallyMutation = useDeleteRally() // FIXED: Added missing delete hook

  const handleCreateRally = () => {
    setEditingRally(null)
    setShowCreateModal(true)
  }

  const handleEditRally = (rally: any) => {
    setEditingRally(rally)
    setShowCreateModal(true)
  }

  // FIXED: Implemented actual delete functionality
  const handleDeleteRally = async (rallyId: string) => {
    try {
      await deleteRallyMutation.mutateAsync(rallyId)
      // The useDeleteRally hook automatically invalidates queries, so no manual refetch needed
    } catch (error) {
      console.error('Error deleting rally:', error)
      alert('Ralli kustutamine ebaõnnestus. Palun proovi uuesti.')
    }
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
          onCreateRally={handleCreateRally}
          onEditRally={handleEditRally}
          onDeleteRally={handleDeleteRally}
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