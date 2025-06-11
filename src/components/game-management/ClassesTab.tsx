// src/components/game-management/ClassesTab.tsx
import { useState } from 'react'
import { Game, GameClass, useCreateGameClass } from '@/hooks/useGameManagement'
import { CreateGameClassModal } from './CreateGameClassModal'

interface ClassesTabProps {
  classes: GameClass[]
  selectedGame: Game | undefined
  isLoading: boolean
  onRefresh: () => void
}

export function ClassesTab({ classes, selectedGame, isLoading, onRefresh }: ClassesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const createGameClassMutation = useCreateGameClass()

  const handleCreateGameClass = async (classData: Partial<GameClass>) => {
    if (!selectedGame) return
    
    try {
      await createGameClassMutation.mutateAsync({
        ...classData,
        game_id: selectedGame.id
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create game class:', error)
    }
  }

  if (!selectedGame) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🏅</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Game Selected</h3>
        <p className="text-slate-400">Please select a game first to manage its classes</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading game classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🏅</span>
          <span>Classes for {selectedGame.name} ({classes.length})</span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
        >
          <div className="flex items-center space-x-2">
            <span>➕</span>
            <span>Add Class</span>
          </div>
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-slate-500">🏅</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Classes</h3>
          <p className="text-slate-400 mb-6">Add classes like Pro, Semi-Pro, Amateur, etc.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Add First Class
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((gameClass) => (
            <div key={gameClass.id} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    gameClass.skill_level === 'professional' ? 'bg-purple-500/20' :
                    gameClass.skill_level === 'advanced' ? 'bg-blue-500/20' :
                    gameClass.skill_level === 'intermediate' ? 'bg-green-500/20' :
                    'bg-yellow-500/20'
                  }`}>
                    <span className={`text-xl ${
                      gameClass.skill_level === 'professional' ? 'text-purple-300' :
                      gameClass.skill_level === 'advanced' ? 'text-blue-300' :
                      gameClass.skill_level === 'intermediate' ? 'text-green-300' :
                      'text-yellow-300'
                    }`}>🏅</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{gameClass.name}</h3>
                    <p className="text-sm text-slate-400 capitalize">{gameClass.skill_level}</p>
                  </div>
                </div>
                <div className="text-right">
                  {gameClass.entry_fee && gameClass.entry_fee > 0 && (
                    <p className="text-green-400 font-medium">€{gameClass.entry_fee}</p>
                  )}
                </div>
              </div>

              {gameClass.description && (
                <p className="text-slate-300 text-sm mb-4">{gameClass.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Participants:</span>
                  <span className="text-slate-300">{gameClass.max_participants || 'Unlimited'}</span>
                </div>
                {gameClass.requirements && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requirements:</span>
                    <span className="text-slate-300 text-right max-w-[200px]">{gameClass.requirements}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`${gameClass.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {gameClass.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGameClassModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGameClass}
          isLoading={createGameClassMutation.isPending}
        />
      )}
    </div>
  )
}