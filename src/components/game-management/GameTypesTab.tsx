// src/components/game-management/GameTypesTab.tsx - COMPLETE FIXED VERSION

'use client'

import { useState } from 'react'
import { useGameTypeMutations } from '@/hooks/useGameManagement'
import { EmptyState, SelectionRequired, LoadingState } from '@/components/shared/States'
import { ConfirmModal, FormModal } from '@/components/shared/Modal'
import { Input, Textarea, Select, FormGrid, FormActions, Button } from '@/components/shared/FormComponents'
import { formatDateTime } from '@/lib/statusUtils'
import type { Game, GameType } from '@/types'

interface GameTypesTabProps {
  gameTypes: GameType[]
  selectedGame: Game | undefined
  onRefresh: () => void
}

export function GameTypesTab({ gameTypes, selectedGame, onRefresh }: GameTypesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingType, setEditingType] = useState<GameType | null>(null)
  const [deletingType, setDeletingType] = useState<GameType | null>(null)

  const { createGameType, updateGameType, deleteGameType } = useGameTypeMutations()

  const handleCreate = async (typeData: Partial<GameType>) => {
    if (!selectedGame) return
    
    try {
      await createGameType.mutateAsync({ ...typeData, game_id: selectedGame.id })
      setShowCreateModal(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create game type:', error)
    }
  }

  const handleUpdate = async (typeData: Partial<GameType>) => {
    if (!editingType) return
    
    try {
      await updateGameType.mutateAsync({ id: editingType.id, ...typeData })
      setEditingType(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to update game type:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingType) return
    
    try {
      await deleteGameType.mutateAsync(deletingType.id)
      setDeletingType(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete game type:', error)
    }
  }

  const isLoading = createGameType.isPending || updateGameType.isPending || deleteGameType.isPending

  if (!selectedGame) {
    return (
      <SelectionRequired
        title="No Game Selected"
        message="Please select a game first to manage its competition types"
        icon="🏆"
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🏆</span>
          <span>Game Types for {selectedGame.name} ({gameTypes.length})</span>
        </h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="success"
          icon="➕"
          disabled={isLoading}
        >
          Add Game Type
        </Button>
      </div>

      {isLoading && <LoadingState message="Processing game type operation..." />}

      {!isLoading && gameTypes.length === 0 ? (
        <EmptyState
          title="No Game Types"
          message="Add competition types like Championship, Quick Play, Training, etc."
          icon="🏆"
          action={{
            label: "Add First Game Type",
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {gameTypes.map((type) => (
            <GameTypeCard
              key={type.id}
              gameType={type}
              onEdit={setEditingType}
              onDelete={setDeletingType}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <GameTypeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isLoading={createGameType.isPending}
        />
      )}

      {editingType && (
        <GameTypeModal
          gameType={editingType}
          onClose={() => setEditingType(null)}
          onSubmit={handleUpdate}
          isLoading={updateGameType.isPending}
        />
      )}

      {deletingType && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingType(null)}
          onConfirm={handleDelete}
          title="Delete Game Type"
          message={`Delete "${deletingType.name}"? This action cannot be undone.`}
          confirmText="Delete Type"
          confirmColor="red"
          isLoading={deleteGameType.isPending}
        />
      )}
    </div>
  )
}

// Game Type Card Component
interface GameTypeCardProps {
  gameType: GameType
  onEdit: (type: GameType) => void
  onDelete: (type: GameType) => void
}

function GameTypeCard({ gameType, onEdit, onDelete }: GameTypeCardProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 group hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <span className="text-purple-300 text-xl">🏆</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{gameType.name}</h3>
            <p className="text-sm text-slate-400 capitalize">{gameType.duration_type || 'Single Event'}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(gameType)}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(gameType)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            🗑️
          </button>
        </div>
      </div>

      {gameType.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{gameType.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Participants:</span>
          <span className="text-slate-300">
            {gameType.min_participants || 1} - {gameType.max_participants || '∞'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={gameType.is_active ? 'text-green-400' : 'text-red-400'}>
            {gameType.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Created:</span>
          <span className="text-slate-300">
            {formatDateTime(gameType.created_at, { short: true })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Game Type Modal Component
interface GameTypeModalProps {
  gameType?: GameType | null
  onClose: () => void
  onSubmit: (typeData: Partial<GameType>) => void
  isLoading: boolean
}

function GameTypeModal({ gameType, onClose, onSubmit, isLoading }: GameTypeModalProps) {
  const [formData, setFormData] = useState({
    name: gameType?.name || '',
    description: gameType?.description || '',
    max_participants: gameType?.max_participants?.toString() || '',
    duration_type: gameType?.duration_type || 'single',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
      min_participants: 1,
    })
  }

  const durationOptions = [
    { value: 'single', label: 'Single Event' },
    { value: 'multi_stage', label: 'Multi-Stage' },
    { value: 'season', label: 'Full Season' },
  ]

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={`${gameType ? 'Edit' : 'Create'} Game Type`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGrid columns={1}>
          <Input
            label="Type Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Championship, Quick Play, Training"
            required
          />
          
          <Select
            label="Duration Type"
            value={formData.duration_type}
            onChange={(e) => setFormData(prev => ({ ...prev, duration_type: e.target.value }))}
            options={durationOptions}
          />
          
          <Input
            label="Max Participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
            placeholder="Leave empty for unlimited"
            min="1"
            hint="Leave empty for unlimited participants"
          />
          
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this game type..."
            rows={3}
          />
        </FormGrid>

        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={isLoading} disabled={!formData.name}>
            {gameType ? 'Update Type' : 'Create Type'}
          </Button>
        </FormActions>
      </form>
    </FormModal>
  )
}