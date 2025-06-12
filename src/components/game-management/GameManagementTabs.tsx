// src/components/game-management/GameManagementTabs.tsx - Enhanced tabs with better UX
import type { Game } from '@/types'

interface Tab {
  id: string
  label: string
  icon: string
  count: number
  description?: string
  disabled?: boolean
}

interface GameManagementTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  selectedGame: Game | null
}

export function GameManagementTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  selectedGame 
}: GameManagementTabsProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
      {/* Game Selection Status */}
      {selectedGame && (
        <div className="mb-4 mx-4 mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-300 text-sm">🎮</span>
            </div>
            <div>
              <p className="text-blue-200 font-medium">
                Managing: {selectedGame.name}
              </p>
              <p className="text-blue-300/80 text-xs">
                {selectedGame.platform} • {selectedGame.developer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isDisabled = tab.disabled
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`group relative flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : isDisabled 
                    ? 'text-slate-500 cursor-not-allowed opacity-50 bg-slate-800/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 bg-slate-800/20'
              }`}
              title={isDisabled ? 'Select a game first to manage this section' : tab.description}
            >
              {/* Icon */}
              <span className={`text-lg transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                {tab.icon}
              </span>
              
              {/* Label */}
              <span className="font-semibold">{tab.label}</span>
              
              {/* Count Badge */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors duration-200 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : isDisabled
                    ? 'bg-slate-600/30 text-slate-500'
                    : 'bg-slate-600/50 text-slate-300 group-hover:bg-slate-600/70'
              }`}>
                {tab.count}
              </span>

              {/* Disabled Overlay Icon */}
              {isDisabled && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 text-xs">🔒</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Helper Text */}
      {!selectedGame && (
        <div className="mt-4 mx-4 mb-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="text-yellow-400 text-lg">💡</span>
            <div>
              <p className="text-yellow-200 text-sm font-medium">
                Select a game to unlock additional management options
              </p>
              <p className="text-yellow-300/80 text-xs">
                Game Types, Events, and Classes require a selected game
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}