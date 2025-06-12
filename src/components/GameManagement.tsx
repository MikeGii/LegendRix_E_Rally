// src/components/GameManagement.tsx - Clean Main Component
'use client'

import { useState } from 'react'
import { useGameManagement } from '@/hooks/useGameManagement'
import { GameManagementHeader } from './game-management/GameManagementHeader'
import { GameManagementTabs } from './game-management/GameManagementTabs'
import { GamesTab } from './game-management/GamesTab'
import { GameTypesTab } from './game-management/GameTypesTab'
import { EventsTab } from './game-management/EventsTab'
import { ClassesTab } from './game-management/ClassesTab'
import { LoadingState, ErrorState } from '@/components/shared/States'
import type { Game } from '@/types/game'

type TabType = 'games' | 'types' | 'events' | 'classes'

export function GameManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('games')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  // Centralized data management
  const {
    games,
    gameTypes,
    gameEvents,
    gameClasses,
    isLoading,
    error,
    refetch
  } = useGameManagement(selectedGame?.id)

  // Tab configuration with dynamic counts
  const tabs = [
    { 
      id: 'games' as const, 
      label: 'Games', 
      icon: '🎮', 
      count: games.length,
      description: 'Manage rally games'
    },
    { 
      id: 'types' as const, 
      label: 'Game Types', 
      icon: '🏆', 
      count: gameTypes.length,
      description: 'Competition formats',
      disabled: !selectedGame
    },
    { 
      id: 'events' as const, 
      label: 'Events', 
      icon: '🌍', 
      count: gameEvents.length,
      description: 'Rally locations',
      disabled: !selectedGame
    },
    { 
      id: 'classes' as const, 
      label: 'Classes', 
      icon: '🏅', 
      count: gameClasses.length,
      description: 'Competition categories',
      disabled: !selectedGame
    }
  ]

  const handleGameSelect = (game: Game | null) => {
    setSelectedGame(game)
    // Reset to games tab if no game selected
    if (!game && activeTab !== 'games') {
      setActiveTab('games')
    }
  }

  const handleTabChange = (tabId: string) => {
    const tab = tabId as TabType
    
    // Prevent switching to dependent tabs without game selection
    if (!selectedGame && tab !== 'games') {
      return
    }
    
    setActiveTab(tab)
  }

  // Error boundary
  if (error) {
    return (
      <ErrorState 
        title="Game Management Error"
        message="Failed to load game management data"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header with contextual information */}
        <GameManagementHeader 
          totalGames={games.length}
          selectedGame={selectedGame}
          onRefresh={refetch}
          isLoading={isLoading}
        />
        
        {/* Navigation tabs */}
        <GameManagementTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        {/* Tab content with loading state */}
        {isLoading ? (
          <LoadingState message="Loading game management data..." />
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            {activeTab === 'games' && (
              <GamesTab 
                games={games}
                selectedGame={selectedGame}
                onSelectGame={handleGameSelect}
                onRefresh={refetch}
              />
            )}
            
            {activeTab === 'types' && selectedGame && (
              <GameTypesTab 
                gameTypes={gameTypes}
                selectedGame={selectedGame}
                onRefresh={refetch}
              />
            )}
            
            {activeTab === 'events' && selectedGame && (
              <EventsTab 
                gameEvents={gameEvents}
                selectedGame={selectedGame}
                onRefresh={refetch}
              />
            )}
            
            {activeTab === 'classes' && selectedGame && (
              <ClassesTab 
                gameClasses={gameClasses}
                selectedGame={selectedGame}
                onRefresh={refetch}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}