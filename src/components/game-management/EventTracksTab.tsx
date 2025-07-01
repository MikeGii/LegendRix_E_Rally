// src/components/game-management/EventTracksTab.tsx - Fixed version with proper selection flow
'use client'

import { useState } from 'react'
import { Game, GameEvent, EventTrack } from '@/types'
import { useCreateEventTrack, useUpdateEventTrack, useDeleteEventTrack } from '@/hooks/useGameManagement'
import { Modal } from '@/components/ui/Modal'
import '@/styles/futuristic-theme.css'

interface EventTracksTabProps {
  eventTracks: EventTrack[]
  games: Game[]
  gameEvents: GameEvent[]
  selectedGameId: string
  selectedEventId: string
  onGameChange: (gameId: string) => void
  onEventChange: (eventId: string) => void
}

interface EventTrackFormData {
  name: string
  surface_type: string
  length_km: number | ''
}

// Surface types as per Estonian terminology
const SURFACE_TYPES = [
  { value: 'kruus', label: 'Kruus (Gravel)' },
  { value: 'asfalt', label: 'Asfalt (Tarmac)' },
  { value: 'lumi', label: 'Lumi (Snow)' },
  { value: 'muda', label: 'Muda (Mud)' }
]

export function EventTracksTab({ 
  eventTracks, 
  games, 
  gameEvents, 
  selectedGameId, 
  selectedEventId, 
  onGameChange, 
  onEventChange 
}: EventTracksTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState<EventTrack | null>(null)
  const [formData, setFormData] = useState<EventTrackFormData>({ 
    name: '', 
    surface_type: 'kruus', 
    length_km: '' 
  })

  const createEventTrackMutation = useCreateEventTrack()
  const updateEventTrackMutation = useUpdateEventTrack()
  const deleteEventTrackMutation = useDeleteEventTrack()

  const selectedGame = games.find(g => g.id === selectedGameId)
  const selectedEvent = gameEvents.find(e => e.id === selectedEventId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !selectedEventId) return

    try {
      const trackData = {
        event_id: selectedEventId,
        name: formData.name.trim(),
        surface_type: formData.surface_type,
        length_km: formData.length_km ? Number(formData.length_km) : undefined
      }

      if (editingTrack) {
        await updateEventTrackMutation.mutateAsync({
          id: editingTrack.id,
          ...trackData
        })
      } else {
        await createEventTrackMutation.mutateAsync(trackData)
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving event track:', error)
    }
  }

  const handleEdit = (e: React.MouseEvent, track: EventTrack) => {
    e.preventDefault()
    e.stopPropagation()
    
    setEditingTrack(track)
    setFormData({ 
      name: track.name,
      surface_type: track.surface_type || 'kruus',
      length_km: track.length_km || ''
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, track: EventTrack) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Kas oled kindel, et soovid kustutada raja "${track.name}"?`)) {
      return
    }

    try {
      await deleteEventTrackMutation.mutateAsync({ 
        id: track.id, 
        event_id: selectedEventId 
      })
    } catch (error) {
      console.error('Error deleting event track:', error)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingTrack(null)
    setFormData({ name: '', surface_type: 'kruus', length_km: '' })
  }

  // No game selected
  if (!selectedGameId) {
    return (
      <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
            <span className="text-5xl text-cyan-400">🛣️</span>
          </div>
          <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-3 uppercase">
            Mäng valimata
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Vali mäng "Mängud" vahekaardilt, et hallata radasid
          </p>
          
          {/* Game Selection Grid */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-4 font-['Orbitron'] uppercase tracking-wider">
              Saadavalolevad mängud
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => onGameChange(game.id)}
                  className="tech-border rounded-xl p-4 bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span className="font-['Orbitron'] text-white group-hover:text-cyan-400 transition-colors">
                      {game.name}
                    </span>
                    <span className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }


  // Game selected but no event selected
  if (!selectedEventId) {
    return (
      <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
            <span className="text-5xl text-cyan-400">🛣️</span>
          </div>
          <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-3 uppercase">
            Sündmus valimata
          </h3>
          <p className="text-gray-400 mb-2">
            Valitud mäng: <span className="text-cyan-400 font-medium">{selectedGame?.name}</span>
          </p>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Vali sündmus "Sündmused" vahekaardilt, et hallata selle radasid
          </p>
          
          {/* Event Selection Grid */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-4 font-['Orbitron'] uppercase tracking-wider">
              Saadavalolevad sündmused
            </p>
            {gameEvents.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {gameEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventChange(event.id)}
                    className="tech-border rounded-xl p-4 bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏁</span>
                      <span className="font-['Orbitron'] text-white group-hover:text-cyan-400 transition-colors">
                        {event.name}
                      </span>
                      <span className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">See mäng ei sisalda sündmusi</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Empty state when both are selected but no tracks exist
  if (eventTracks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
              Rajad <span className="text-cyan-500">(0)</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-400">
                Mäng: <span className="text-cyan-400 font-medium">{selectedGame?.name}</span>
              </p>
              <span className="text-gray-600">•</span>
              <p className="text-gray-400">
                Sündmus: <span className="text-cyan-400 font-medium">{selectedEvent?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider group"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">+</span>
              <span>Loo rada</span>
            </span>
          </button>
        </div>

        {/* Empty State Content */}
        <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
              <span className="text-5xl text-cyan-400">🛣️</span>
            </div>
            <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-2 uppercase">
              Radasid ei leitud
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Lisa esimene rada sellele sündmusele
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider"
            >
              Loo esimene rada
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="space-y-6">
    {/* Header with Create Button */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
          Rajad <span className="text-cyan-500">({eventTracks.length})</span>
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-400">
            Mäng: <span className="text-cyan-400 font-medium">{selectedGame?.name}</span>
          </p>
          <span className="text-gray-600">•</span>
          <p className="text-gray-400 flex items-center gap-2">
            Sündmus: <span className="text-cyan-400 font-medium">{selectedEvent?.name}</span>
            <button
              onClick={() => onEventChange('')}
              className="ml-2 w-6 h-6 rounded-md bg-gray-800/50 hover:bg-red-900/30 border border-gray-700/50 hover:border-red-500/50 flex items-center justify-center transition-all duration-200 group"
              title="Tühista sündmuse valik"
            >
              <span className="text-sm text-gray-400 group-hover:text-red-400 transition-colors">×</span>
            </button>
          </p>
        </div>
      </div>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-wider group"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">+</span>
          <span>Loo rada</span>
        </span>
      </button>
    </div>

      {/* Event Tracks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {eventTracks.map((eventTrack) => (
          <div 
            key={eventTrack.id} 
            className="relative tech-border rounded-2xl p-6 transition-all duration-300 bg-gray-900/30 border-gray-700/50 hover:bg-gray-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] group"
          >
            {/* Track Icon & Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-gray-800/50 border border-gray-700/50 group-hover:border-cyan-500/50">
                <span className="text-2xl">🛣️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold font-['Orbitron'] text-white text-lg uppercase tracking-wide">
                  {eventTrack.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Loodud {new Date(eventTrack.created_at).toLocaleDateString('et-EE')}
                </p>
              </div>
            </div>

            {/* Track Details */}
            <div className="space-y-2 mb-6 text-sm">
              {eventTrack.surface_type && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Pinnas:</span>
                  <span className="text-cyan-400 font-medium uppercase">
                    {eventTrack.surface_type}
                  </span>
                </div>
              )}
              {eventTrack.length_km && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Pikkus:</span>
                  <span className="text-cyan-400 font-medium">
                    {eventTrack.length_km} km
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => handleEdit(e, eventTrack)}
                className="flex-1 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 uppercase tracking-wider"
              >
                Muuda
              </button>
              <button
                onClick={(e) => handleDelete(e, eventTrack)}
                disabled={deleteEventTrackMutation.isPending}
                className="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 disabled:opacity-50 uppercase tracking-wider"
              >
                Kustuta
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingTrack ? 'Muuda rada' : 'Loo uus rada'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Raja nimi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              placeholder="Sisesta raja nimi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Pinnase tüüp
            </label>
            <select
              value={formData.surface_type}
              onChange={(e) => setFormData({ ...formData, surface_type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            >
              {SURFACE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Raja pikkus (km)
            </label>
            <input
              type="number"
              value={formData.length_km}
              onChange={(e) => setFormData({ ...formData, length_km: e.target.value ? parseFloat(e.target.value) : '' })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              placeholder="nt. 12.5"
              step="0.1"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 uppercase tracking-wider"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createEventTrackMutation.isPending || updateEventTrackMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase tracking-wider"
            >
              {createEventTrackMutation.isPending || updateEventTrackMutation.isPending 
                ? 'Salvestamine...' 
                : editingTrack ? 'Uuenda' : 'Loo rada'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}