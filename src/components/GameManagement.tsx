// src/components/GameManagement.tsx - Fixed TypeScript errors
'use client'

import { useState } from 'react'
import { useGameManagement } from '@/hooks/useGameManagement'
import { GameManagementHeader } from './game-management/GameManagementHeader'
import { GameManagementTabs } from '@/components/game-management/GameManagementTabs'
import { GamesTab } from '@/components/game-management/GamesTab'
import { GameTypesTab } from '@/components/game-management/GameTypesTab'
import { EventsTab } from '@/components/game-management/EventsTab'
import { ClassesTab } from '@/components/game-management/ClassesTab'
import { LoadingState, ErrorState } from '@/components/shared/States'
import type { Game } from '@/types'

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
        
        {/* Header with contextual information - Fixed isLoading type */}
        <GameManagementHeader 
          totalGames={games.length}
          selectedGame={selectedGame}
          onRefresh={refetch}
          isLoading={!!isLoading}  // Convert to boolean
        />

        {/* Tab Navigation with enhanced UX */}
        <GameManagementTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          selectedGame={selectedGame}
        />

        {/* Content Area with proper loading states */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          {isLoading ? (
            <LoadingState message="Loading game data..." />
          ) : (
            <TabContent 
              activeTab={activeTab}
              selectedGame={selectedGame}
              games={games}
              gameTypes={gameTypes}
              gameEvents={gameEvents}
              gameClasses={gameClasses}
              onGameSelect={handleGameSelect}
              onRefresh={refetch}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Separated tab content for better organization
interface TabContentProps {
  activeTab: TabType
  selectedGame: Game | null
  games: Game[]
  gameTypes: any[]
  gameEvents: any[]
  gameClasses: any[]
  onGameSelect: (game: Game | null) => void
  onRefresh: () => void
}

function TabContent({
  activeTab,
  selectedGame,
  games,
  gameTypes,
  gameEvents,
  gameClasses,
  onGameSelect,
  onRefresh
}: TabContentProps) {
  switch (activeTab) {
    case 'games':
      return (
        <GamesTab
          games={games}
          selectedGame={selectedGame}
          onSelectGame={onGameSelect}
          onRefresh={onRefresh}
        />
      )
    
    case 'types':
      return (
        <GameTypesTab
          gameTypes={gameTypes}
          selectedGame={selectedGame || undefined}  // Convert null to undefined
          onRefresh={onRefresh}
        />
      )
    
    case 'events':
      return (
        <EventsTab
          events={gameEvents}
          selectedGame={selectedGame || undefined}  // Convert null to undefined
          onRefresh={onRefresh}
        />
      )
    
    case 'classes':
      return (
        <ClassesTab
          classes={gameClasses}
          selectedGame={selectedGame || undefined}  // Convert null to undefined
          onRefresh={onRefresh}
        />
      )
    
    default:
      return <div>Invalid tab</div>
  }
}