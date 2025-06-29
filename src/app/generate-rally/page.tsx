// src/app/generate-rally/page.tsx
'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { GameSelectionComponent } from '@/components/generate-rally/GameSelectionComponent'
import { EventSelectionComponent } from '@/components/generate-rally/EventSelectionComponent'
import { TrackLengthFilter } from '@/components/generate-rally/TrackLengthFilter'
import { RallyGenerationModal } from '@/components/generate-rally/RallyGenerationModal'
import { GenerationHistory } from '@/components/generate-rally/GenerationHistory'
import { useGames, useGameEvents } from '@/hooks/useGameManagement'
import '@/styles/track-length-filter.css'

export default function GenerateRallyPage() {
  console.log('🎲 GenerateRallyPage - Component loaded')
  
  // State
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [minTrackLength, setMinTrackLength] = useState<number>(5)
  const [maxTrackLength, setMaxTrackLength] = useState<number>(20)
  const [trackCount, setTrackCount] = useState<number>(3)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  
  // Data hooks
  const { data: games = [], isLoading: gamesLoading } = useGames()
  const { data: events = [], isLoading: eventsLoading } = useGameEvents(selectedGameId)
  
  // Handle game selection
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedEventIds([]) // Reset event selection when game changes
  }
  
  // Handle event toggle
  const handleEventToggle = (eventId: string) => {
    setSelectedEventIds(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId)
      } else {
        return [...prev, eventId]
      }
    })
  }
  
  // Handle track length change
  const handleTrackLengthChange = (min: number, max: number) => {
    setMinTrackLength(min)
    setMaxTrackLength(max)
  }
  
  // Handle track count change
  const handleTrackCountChange = (count: number) => {
    setTrackCount(count)
  }
  
  // Handle rally generation
  const handleGenerateRally = () => {
    setShowGenerationModal(true)
  }
  
  // Handle modal close and refresh history
  const handleModalClose = () => {
    setShowGenerationModal(false)
    setHistoryRefreshKey(prev => prev + 1) // Trigger history refresh
  }
  
  // Get selected event names
  const getSelectedEventNames = () => {
    return selectedEventIds.map(id => 
      events.find(e => e.id === id)?.name || 'Unknown'
    )
  }
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Unified Admin Header */}
          <AdminPageHeader
            title="Genereeri mulle ralli!"
            description="Genereeri automaatselt uus ralli"
            icon="🎲"
            stats={[
              { label: 'Valitud mäng', value: selectedGameId ? games.find(g => g.id === selectedGameId)?.name || '-' : '-', color: 'blue' },
              { label: 'Valitud riigid', value: selectedEventIds.length, color: 'yellow' },
              { label: 'Raja pikkus', value: `${minTrackLength}-${maxTrackLength} km`, color: 'green' },
              { label: 'Radade arv', value: `${trackCount} rada/riik`, color: 'red' }
            ]}
            actions={[]}
          />
          
          {/* Game Selection */}
          <GameSelectionComponent
            games={games}
            selectedGameId={selectedGameId}
            onGameSelect={handleGameSelect}
            isLoading={gamesLoading}
          />
          
          {/* Event Selection - Only show when game is selected */}
          {selectedGameId && (
            <EventSelectionComponent
              events={events}
              selectedEventIds={selectedEventIds}
              onEventToggle={handleEventToggle}
              isLoading={eventsLoading}
            />
          )}
          
          {/* Track Length Filter - Only show when events are selected */}
          {selectedGameId && selectedEventIds.length > 0 && (
            <TrackLengthFilter
              minLength={minTrackLength}
              maxLength={maxTrackLength}
              trackCount={trackCount}
              onLengthChange={handleTrackLengthChange}
              onTrackCountChange={handleTrackCountChange}
            />
          )}
          
          {/* Generate Button - Only show when all parameters are selected */}
          {selectedGameId && selectedEventIds.length > 0 && (
            <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/90 backdrop-blur-xl overflow-hidden">
              <div className="relative bg-gradient-to-r from-red-900/20 to-black p-6">
                <div className="scan-line"></div>
                <div className="flex items-center justify-between">
                  {/* Left side - Generate button */}
                  <div className="flex-1">
                    <button
                      onClick={handleGenerateRally}
                      className="group relative px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-black text-lg font-['Orbitron'] uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] transform hover:scale-105"
                    >
                      {/* Animated background glow */}
                      <div className="absolute inset-0 rounded-xl bg-red-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                      
                      {/* Button content */}
                      <span className="relative z-10 flex items-center space-x-3">
                        <span className="text-2xl animate-pulse">🎲</span>
                        <span>Genereeri Ralli!</span>
                      </span>
                    </button>
                  </div>
                  
                  {/* Right side - Summary stats */}
                  <div className="flex items-center space-x-8 px-8">
                    {/* Game */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">Mäng valitud</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                        <span className="text-white font-medium font-['Orbitron']">
                          {games.find(g => g.id === selectedGameId)?.name || '-'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Countries */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">Riiki</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>
                        <span className="text-white font-bold font-['Orbitron'] text-xl">
                          {selectedEventIds.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Track Length */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">Raja pikkus</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.6)]"></div>
                        <span className="text-white font-medium font-['Orbitron']">
                          {minTrackLength}-{maxTrackLength} km
                        </span>
                      </div>
                    </div>
                    
                    {/* Tracks per Country */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">Rada/Riik</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                        <span className="text-white font-bold font-['Orbitron'] text-xl">
                          {trackCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Generation History */}
          <GenerationHistory refreshKey={historyRefreshKey} />
        </div>
        
        {/* Rally Generation Modal */}
        <RallyGenerationModal
          isOpen={showGenerationModal}
          onClose={handleModalClose}
          gameId={selectedGameId}
          gameName={games.find(g => g.id === selectedGameId)?.name || ''}
          selectedEventIds={selectedEventIds}
          eventNames={getSelectedEventNames()}
          minTrackLength={minTrackLength}
          maxTrackLength={maxTrackLength}
          trackCount={trackCount}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}