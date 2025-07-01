// src/components/GameManagement.tsx - VISUAL REDESIGN ONLY
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
import '@/styles/futuristic-theme.css'

export function GameManagement() {
  const [activeTab, setActiveTab] = useState('games')
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)

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
      label: 'Mängud', 
      icon: '🎮', 
      count: games.length 
    },
    { 
      id: 'types', 
      label: 'Tüübid', 
      icon: '🏆', 
      count: gameTypes.length 
    },
    { 
      id: 'events', 
      label: 'Sündmused', 
      icon: '🏁', 
      count: gameEvents.length 
    },
    { 
      id: 'tracks', 
      label: 'Rajad', 
      icon: '🛣️', 
      count: eventTracks.length 
    },
    { 
      id: 'classes', 
      label: 'Klassid', 
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Unified Admin Header - Futuristic Style */}
        <div className="mb-8">
          <div className="tech-border rounded-2xl bg-gray-900/50 backdrop-blur-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                  <span className="text-3xl">🎮</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-['Orbitron'] text-white">
                    Mängude haldamine
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Halda mänge, riike, radasid ja klasse ralli süsteemi jaoks
                  </p>
                </div>
              </div>
              
              {/* Juhend Button */}
              <button
                onClick={() => setIsInstructionsOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-['Orbitron'] font-medium rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-wider text-sm"
              >
                Juhend
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Futuristic Style */}
        <div className="mb-8">
          <div className="tech-border rounded-2xl bg-gray-900/50 backdrop-blur-xl p-2">
            <nav className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-3 py-2 rounded-lg font-['Orbitron'] font-medium
                    transition-all duration-300 group
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-900/50 to-red-800/30 text-white border border-red-500/50 shadow-[0_0_20px_rgba(255,0,64,0.3)]'
                      : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{tab.icon}</span>
                    <span className="text-xs uppercase tracking-wide">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`
                        inline-flex items-center px-2 py-0 rounded-full text-[14px] font-bold
                        ${activeTab === tab.id
                          ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                          : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </div>

                  {/* Active Tab Indicator */}
                  {activeTab === tab.id && (
                    <>
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                      <div className="absolute inset-0 bg-red-500/5 rounded-lg"></div>
                    </>
                  )}

                  {/* Hover Effect */}
                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-orange-500/10 rounded-lg transition-all duration-300"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content - Futuristic Container */}
        <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl">
          <div className="p-8">
            {renderActiveTab()}
          </div>
        </div>
      </div>

      {/* Game Management Instructions Modal */}
      {isInstructionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsInstructionsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden tech-border">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-['Orbitron'] text-white">
                  Mängude Haldamise Juhend
                </h2>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsInstructionsOpen(false)}
                  className="w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 flex items-center justify-center transition-all duration-300 group"
                >
                  <span className="text-2xl text-gray-400 group-hover:text-white transition-colors">×</span>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="text-center py-12">
                <p className="text-gray-400">
                  Juhendi sisu tuleb hiljem...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}