// src/components/game-management/ClassesTab.tsx - FIXED VERSION
'use client'

import { useState } from 'react'
import { useGameClassMutations } from '@/hooks/useGameManagement'
import { EmptyState, SelectionRequired, LoadingState } from '@/components/shared/States'
import { ConfirmModal, FormModal } from '@/components/shared/Modal'
import { Input, FormActions, Button } from '@/components/shared/FormComponents'
import { formatDateTime } from '@/lib/statusUtils'
import type { Game, GameClass } from '@/types'

interface ClassesTabProps {
  gameClasses: GameClass[]
  selectedGame: Game | null
  onRefresh: () => void
}

export function ClassesTab({ gameClasses, selectedGame, onRefresh }: ClassesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClass, setEditingClass] = useState<GameClass | null>(null)
  const [deletingClass, setDeletingClass] = useState<GameClass | null>(null)

  const { createGameClass, updateGameClass, deleteGameClass } = useGameClassMutations()

  const handleCreate = async (classData: Partial<GameClass>) => {
    if (!selectedGame) return
    
    try {
      await createGameClass.mutateAsync({ ...classData, game_id: selectedGame.id })
      setShowCreateModal(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create game class:', error)
    }
  }

  const handleUpdate = async (classData: Partial<GameClass>) => {
    if (!editingClass) return
    
    try {
      await updateGameClass.mutateAsync({ id: editingClass.id, ...classData })
      setEditingClass(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to update game class:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingClass) return
    
    try {
      await deleteGameClass.mutateAsync(deletingClass.id)
      setDeletingClass(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete game class:', error)
    }
  }

  const isLoading = createGameClass.isPending || updateGameClass.isPending || deleteGameClass.isPending

  if (!selectedGame) {
    return (
      <SelectionRequired
        title="No Game Selected"
        message="Please select a game first to manage its competition classes"
        icon="🏅"
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🏅</span>
          <span>Game Classes for {selectedGame.name} ({gameClasses.length})</span>
        </h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="success"
          icon="➕"
          disabled={isLoading}
        >
          Add Game Class
        </Button>
      </div>

      {isLoading && <LoadingState message="Processing game class operation..." />}

      {!isLoading && gameClasses.length === 0 ? (
        <EmptyState
          title="No Game Classes Found"
          message="Create your first competition class to organize participants by skill level or vehicle requirements."
          icon="🏅"
          action={{
            label: "Create First Class",
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameClasses.map((gameClass) => (
            <GameClassCard
              key={gameClass.id}
              gameClass={gameClass}
              onEdit={(cls) => setEditingClass(cls)}
              onDelete={(cls) => setDeletingClass(cls)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingClass) && (
        <GameClassModal
          gameClass={editingClass}
          onClose={() => {
            setShowCreateModal(false)
            setEditingClass(null)
          }}
          onSubmit={editingClass ? handleUpdate : handleCreate}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deletingClass && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingClass(null)}
          onConfirm={handleDelete}
          title="Delete Game Class"
          message={`Are you sure you want to delete "${deletingClass.name}"? This action cannot be undone.`}
          confirmText="Delete Class"
          confirmColor="red"
          isLoading={deleteGameClass.isPending}
        />
      )}
    </div>
  )
}

// Game Class Card Component
interface GameClassCardProps {
  gameClass: GameClass
  onEdit: (cls: GameClass) => void
  onDelete: (cls: GameClass) => void
}

function GameClassCard({ gameClass, onEdit, onDelete }: GameClassCardProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 group hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <span className="text-green-300 text-xl">🏅</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{gameClass.name}</h3>
            <p className="text-sm text-slate-400 capitalize">{gameClass.skill_level || 'Intermediate'}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(gameClass)}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(gameClass)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            🗑️
          </button>
        </div>
      </div>

      {gameClass.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{gameClass.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Entry Fee:</span>
          <span className="text-slate-300">
            {gameClass.entry_fee ? `$${gameClass.entry_fee}` : 'Free'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={gameClass.is_active ? 'text-green-400' : 'text-red-400'}>
            {gameClass.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Created:</span>
          <span className="text-slate-300">
            {formatDateTime(gameClass.created_at, { short: true })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Game Class Modal Component
interface GameClassModalProps {
  gameClass?: GameClass | null
  onClose: () => void
  onSubmit: (classData: Partial<GameClass>) => void
  isLoading: boolean
}

function GameClassModal({ gameClass, onClose, onSubmit, isLoading }: GameClassModalProps) {
  const [formData, setFormData] = useState({
    name: gameClass?.name || '',
    description: gameClass?.description || '',
    skill_level: gameClass?.skill_level || 'intermediate',
    requirements: gameClass?.requirements || '',
    entry_fee: gameClass?.entry_fee?.toString() || '',
    max_participants: gameClass?.max_participants?.toString() || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : undefined,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
    })
  }

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={`${gameClass ? 'Edit' : 'Create'} Game Class`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Class Name"
          value={formData.name}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Novice, Expert, Open Class"
          required
        />

        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={isLoading} disabled={!formData.name}>
            {gameClass ? 'Update Class' : 'Create Class'}
          </Button>
        </FormActions>
      </form>
    </FormModal>
  )
}