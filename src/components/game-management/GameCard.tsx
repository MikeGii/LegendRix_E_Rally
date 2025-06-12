// src/components/game-management/GameCard.tsx - Reusable game card
import { formatDateTime } from '@/lib/statusUtils'
import type { Game } from '@/types'

interface GameCardProps {
  game: Game
  isSelected: boolean
  onSelect: () => void
  onEdit: (event: React.MouseEvent) => void
  onDelete: (event: React.MouseEvent) => void
}

export function GameCard({ 
  game, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: GameCardProps) {
  return (
    <div
      className={`bg-slate-900/50 rounded-xl border p-6 transition-all duration-200 cursor-pointer hover:bg-slate-800/50 group ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-slate-700/30 hover:border-slate-600'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            isSelected ? 'bg-blue-500/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50'
          }`}>
            <span className={`text-xl transition-colors duration-200 ${
              isSelected ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              🎮
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{game.name}</h3>
            <p className="text-sm text-slate-400 truncate">
              {game.platform || 'Unknown Platform'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
            title="Edit Game"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
            title="Delete Game"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Game Details */}
      <div className="space-y-3">
        {/* Developer & Year */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">🏢</span>
            <span className="text-slate-300 truncate">
              {game.developer || 'Unknown Developer'}
            </span>
          </div>
          {game.release_year && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">📅</span>
              <span className="text-slate-300">{game.release_year}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {game.description && (
          <div className="flex items-start space-x-2 text-sm">
            <span className="text-slate-400 mt-0.5">📝</span>
            <span className="text-slate-300 line-clamp-2 leading-relaxed">
              {game.description}
            </span>
          </div>
        )}

        {/* Status & Metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              game.is_active ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            <span className={`text-xs font-medium ${
              game.is_active ? 'text-green-400' : 'text-red-400'
            }`}>
              {game.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Created {formatDateTime(game.created_at, { short: true })}
          </span>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-blue-500/30">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-blue-300 text-sm">✅</span>
              <span className="text-blue-300 text-sm font-medium">Selected Game</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}