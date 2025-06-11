// src/components/GameManagement.tsx
'use client'

import { useState } from 'react'
import { useGames, useGameTypes, useGameEvents, useGameClasses } from '@/hooks/useGameManagement'
import { GameManagementHeader } from '@/components/game-management/GameManagementHeader'
import { GameManagementTabs } from '@/components/game-management/GameManagementTabs'
import { GamesTab } from '@/components/game-management/GamesTab'
import { GameTypesTab } from '@/components/game-management/GameTypesTab'
import { EventsTab } from '@/components/game-management/EventsTab'
import { ClassesTab } from '@/components/game-management/ClassesTab'

type TabType = 'games' | 'types' | 'events' | 'classes'

export function GameManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('games')
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)

  // Data hooks
  const { data: games = [], isLoading: isLoadingGames, refetch: refetchGames } = useGames()
  const { data: gameTypes = [], isLoading: isLoadingTypes, refetch: refetchTypes } = useGameTypes(selectedGameId)
  const { data: events = [], isLoading: isLoadingEvents, refetch: refetchEvents } = useGameEvents(selectedGameId)
  const { data: classes = [], isLoading: isLoadingClasses, refetch: refetchClasses } = useGameClasses(selectedGameId)

  const selectedGame = games.find(game => game.id === selectedGameId)

  const handleRefreshAll = () => {
    refetchGames()
    if (selectedGameId) {
      refetchTypes()
      refetchEvents()
      refetchClasses()
    }
  }

  const tabs = [
    { id: 'games', label: 'Games', icon: '🎮', count: games.length },
    { id: 'types', label: 'Game Types', icon: '🏆', count: gameTypes.length },
    { id: 'events', label: 'Events', icon: '🌍', count: events.length },
    { id: 'classes', label: 'Classes', icon: '🏅', count: classes.length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <GameManagementHeader 
          totalGames={games.length}
          selectedGame={selectedGame}
          onRefresh={handleRefreshAll}
          isLoading={isLoadingGames}
        />

        {/* Tab Navigation */}
        <GameManagementTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          disabled={!selectedGameId && activeTab !== 'games'}
        />

        {/* Content Area */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          {activeTab === 'games' && (
            <GamesTab
              games={games}
              isLoading={isLoadingGames}
              selectedGameId={selectedGameId}
              onSelectGame={setSelectedGameId}
              onRefresh={refetchGames}
            />
          )}

          {activeTab === 'types' && (
            <GameTypesTab
              gameTypes={gameTypes}
              selectedGame={selectedGame}
              isLoading={isLoadingTypes}
              onRefresh={refetchTypes}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab
              events={events}
              selectedGame={selectedGame}
              isLoading={isLoadingEvents}
              onRefresh={refetchEvents}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesTab
              classes={classes}
              selectedGame={selectedGame}
              isLoading={isLoadingClasses}
              onRefresh={refetchClasses}
            />
          )}
        </div>
      </div>
    </div>
  )
}