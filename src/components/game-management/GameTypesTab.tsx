// src/components/game-management/GameTypesTab.tsx
import { useState } from 'react'
import { Game, GameType, useCreateGameType } from '@/hooks/useGameManagement'
import { CreateGameTypeModal } from './CreateGameTypeModal'

interface GameTypesTabProps {
  gameTypes: GameType[]
  selectedGame: Game | undefined
  isLoading: boolean
  onRefresh: () => void
}

export function GameTypesTab({ gameTypes, selectedGame, isLoading, onRefresh }: GameTypesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const createGameTypeMutation = useCreateGameType()

  const handleCreateGameType = async (typeData: Partial<GameType>) => {
    if (!selectedGame) return
    
    try {
      await createGameTypeMutation.mutateAsync({
        ...typeData,
        game_id: selectedGame.id
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create game type:', error)
    }
  }

  if (!selectedGame) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🏆</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Game Selected</h3>
        <p className="text-slate-400">Please select a game first to manage its types</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading game types...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🏆</span>
          <span>Game Types for {selectedGame.name} ({gameTypes.length})</span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
        >
          <div className="flex items-center space-x-2">
            <span>➕</span>
            <span>Add Game Type</span>
          </div>
        </button>
      </div>

      {gameTypes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-slate-500">🏆</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Game Types</h3>
          <p className="text-slate-400 mb-6">Add types like Championship, Quick Play, Training, etc.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Add First Game Type
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {gameTypes.map((type) => (
            <div key={type.id} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-purple-300 text-xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{type.name}</h3>
                    <p className="text-sm text-slate-400">{type.duration_type}</p>
                  </div>
                </div>
              </div>

              {type.description && (
                <p className="text-slate-300 text-sm mb-4">{type.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Participants:</span>
                  <span className="text-slate-300">{type.min_participants || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Participants:</span>
                  <span className="text-slate-300">{type.max_participants || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`${type.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGameTypeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGameType}
          isLoading={createGameTypeMutation.isPending}
        />
      )}
    </div>
  )
}