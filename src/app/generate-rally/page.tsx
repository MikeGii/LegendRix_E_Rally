// src/app/generate-rally/page.tsx
'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { GameSelectionComponent } from '@/components/generate-rally/GameSelectionComponent'
import { EventSelectionComponent } from '@/components/generate-rally/EventSelectionComponent'
import { useGames, useGameEvents } from '@/hooks/useGameManagement'

export default function GenerateRallyPage() {
  console.log('🎲 GenerateRallyPage - Component loaded')
  
  // State
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  
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
              { label: 'Valitud riigid', value: selectedEventIds.length, color: 'yellow' }
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
          
          {/* Generate Button - Only show when game and events are selected */}
          {selectedGameId && selectedEventIds.length > 0 && (
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="text-center">
                <button
                  onClick={() => {
                    // TODO: Implement rally generation logic
                    console.log('Generating rally with:', {
                      gameId: selectedGameId,
                      eventIds: selectedEventIds
                    })
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transform hover:scale-105"
                >
                  🎲 Genereeri Ralli!
                </button>
                <p className="text-slate-400 text-sm mt-3">
                  Vajuta nuppu, et genereerida uus ralli valitud parameetritega
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}