// src/components/GameManagement.tsx - FIXED VERSION
'use client'

import { useState } from 'react'
import { useGames, useGameTypes, useGameEvents, useGameClasses, useEventTracks } from '@/hooks/useGameManagement'
import { useGameVehicles } from '@/hooks/useGameVehicles'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { Tab } from '@/types'
import { GamesTab } from './game-management/GamesTab'
import { GameTypesTab } from './game-management/GameTypesTab'
import { GameEventsTab } from './game-management/GameEventsTab'
import { EventTracksTab } from './game-management/EventTracksTab'
import { GameClassesTab } from './game-management/GameClassesTab'
import { GameVehiclesTab } from './game-management/GameVehiclesTab'

export function GameManagement() {
  const [activeTab, setActiveTab] = useState('games')
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  // Data hooks
  const { data: games = [] } = useGames()
  const { data: gameTypes = [] } = useGameTypes(selectedGameId)
  const { data: gameEvents = [] } = useGameEvents(selectedGameId)
  const { data: gameClasses = [] } = useGameClasses(selectedGameId)
  const { data: eventTracks = [] } = useEventTracks(selectedEventId)
  const { data: gameVehicles = [] } = useGameVehicles(selectedGameId)

  const tabs: Tab[] = [
    { 
      id: 'games', 
      label: 'Games', 
      icon: '🎮', 
      count: games.length 
    },
    { 
      id: 'types', 
      label: 'Game Types', 
      icon: '🏆', 
      count: gameTypes.length 
    },
    { 
      id: 'events', 
      label: 'Game Events', 
      icon: '🏁', 
      count: gameEvents.length 
    },
    { 
      id: 'tracks', 
      label: 'Event Tracks', 
      icon: '🛣️', 
      count: eventTracks.length 
    },
    { 
      id: 'classes', 
      label: 'Game Classes', 
      icon: '🎯', 
      count: gameClasses.length 
    },
    { 
      id: 'vehicles', 
      label: 'Sõidukid', 
      icon: '🚗', 
      count: gameVehicles.length 
    }
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'games':
        return (
          <GamesTab 
            onGameSelect={setSelectedGameId}
            selectedGameId={selectedGameId}
          />
        )
      case 'types':
        return (
          <GameTypesTab 
            gameTypes={gameTypes}
            games={games}
            selectedGameId={selectedGameId}
            onGameChange={setSelectedGameId}
          />
        )
      case 'events':
        return (
          <GameEventsTab 
            gameEvents={gameEvents}
            games={games}
            selectedGameId={selectedGameId}
            onGameChange={setSelectedGameId}
            onEventSelect={setSelectedEventId}
          />
        )
      case 'tracks':
        return (
          <EventTracksTab 
            eventTracks={eventTracks}
            games={games}
            gameEvents={gameEvents}
            selectedGameId={selectedGameId}
            selectedEventId={selectedEventId}
            onGameChange={setSelectedGameId}
            onEventChange={setSelectedEventId}
          />
        )
      case 'classes':
        return (
          <GameClassesTab 
            gameClasses={gameClasses}
            games={games}
            selectedGameId={selectedGameId}
            onGameChange={setSelectedGameId}
          />
        )
      case 'vehicles':
        return (
          <GameVehiclesTab 
            gameVehicles={gameVehicles}
            games={games}
            selectedGameId={selectedGameId}
            onGameChange={setSelectedGameId}
          />
        )
      default:
        return null
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Unified Admin Header */}
        <AdminPageHeader
          title="Mängude haldamine"
          description="Halda mänge, riike, radasid ja klasse ralli süsteemi jaoks"
          icon="🎮"
        />

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-700/50">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}