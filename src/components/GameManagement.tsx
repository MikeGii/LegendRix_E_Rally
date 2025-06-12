// src/components/GameManagement.tsx
'use client'

import { useState } from 'react'
import { useGames, useGameTypes, useGameEvents, useGameClasses, useEventTracks } from '@/hooks/useGameManagement'
import { Tab } from '@/types'
import { GamesTab } from './game-management/GamesTab'
import { GameTypesTab } from './game-management/GameTypesTab'
import { GameEventsTab } from './game-management/GameEventsTab'
import { EventTracksTab } from './game-management/EventTracksTab'
import { GameClassesTab } from './game-management/GameClassesTab'

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
    }
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'games':
        return (
          <GamesTab 
            games={games}
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
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Game Management</h1>
              <p className="text-slate-300">
                Manage games, types, events, tracks, and classes for rally competitions
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/admin-dashboard'}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-2">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${activeTab === tab.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-600 text-slate-300'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="space-y-6">
          {renderActiveTab()}
        </div>

      </div>
    </div>
  )
}