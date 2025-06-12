// src/components/game-management/EventTracksTab.tsx
'use client'

import { useState } from 'react'
import { Game, GameEvent, EventTrack } from '@/types'
import { useCreateEventTrack, useUpdateEventTrack, useDeleteEventTrack } from '@/hooks/useGameManagement'
import { FormModal } from '@/components/shared/Modal'

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

// Common Estonian track names for suggestions
const SUGGESTED_TRACK_NAMES = [
  'Otepää',
  'Tartu', 
  'Elva',
  'Tallinn',
  'Pärnu',
  'Viljandi',
  'Rakvere',
  'Narva',
  'Kuressaare',
  'Haapsalu',
  'Võru',
  'Valga'
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
        name: formData.name,
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

  const handleEdit = (track: EventTrack) => {
    setEditingTrack(track)
    setFormData({ 
      name: track.name,
      surface_type: track.surface_type || 'kruus',
      length_km: track.length_km || ''
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (track: EventTrack) => {
    if (!confirm(`Are you sure you want to delete track "${track.name}"?`)) {
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

  const handleSuggestedTrack = (suggestedName: string) => {
    setFormData(prev => ({ ...prev, name: suggestedName }))
  }

  // No game selected
  if (!selectedGameId) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🛣️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Game Selected</h3>
          <p className="text-slate-400 mb-6">
            Select a game and event to manage tracks.
          </p>
          <button
            onClick={() => onGameChange(games[0]?.id || '')}
            disabled={games.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
          >
            {games.length > 0 ? 'Select First Game' : 'Create Game First'}
          </button>
        </div>
      </div>
    )
  }

  // No event selected
  if (!selectedEventId) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🛣️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Event Selected</h3>
          <p className="text-slate-400 mb-6">
            Select an event to manage its tracks.
          </p>
          {gameEvents.length > 0 ? (
            <button
              onClick={() => onEventChange(gameEvents[0].id)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              Select First Event
            </button>
          ) : (
            <p className="text-slate-500">Create events first in the Game Events tab</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header with Game/Event Selection */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Tracks for: <span className="text-blue-400">{selectedEvent?.name}</span>
            </h2>
            <p className="text-slate-400">
              Game: {selectedGame?.name} • Add tracks with surface type and length
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedGameId}
              onChange={(e) => onGameChange(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
            <select
              value={selectedEventId}
              onChange={(e) => onEventChange(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Select Event</option>
              {gameEvents.map((event) => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              + Add Track
            </button>
          </div>
        </div>
      </div>

      {/* Event Tracks List */}
      {eventTracks.length === 0 ? (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛣️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Tracks</h3>
            <p className="text-slate-400 mb-4">
              Add tracks for this rally event.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Create First Track
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventTracks.map((track) => (
            <div 
              key={track.id} 
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-300 text-lg">🛣️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{track.name}</h3>
                    <p className="text-sm text-slate-400 capitalize">
                      {track.surface_type}
                      {track.length_km && ` • ${track.length_km}km`}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(track)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    title="Edit Track"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(track)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Delete Track"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Surface:</span>
                  <span className="text-slate-300 capitalize font-medium">
                    {track.surface_type}
                  </span>
                </div>
                {track.length_km && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-400">Length:</span>
                    <span className="text-slate-300 font-medium">
                      {track.length_km} km
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingTrack ? 'Edit Track' : 'Create New Track'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Suggested Track Names (only for new tracks) */}
          {!editingTrack && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Common Estonian Locations
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUGGESTED_TRACK_NAMES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestedTrack(suggestion)}
                    className={`
                      px-3 py-2 text-left rounded-lg border transition-all duration-200 text-sm
                      ${formData.name === suggestion
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                      }
                    `}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="text-center my-4">
                <span className="text-slate-500 text-sm">or enter custom track name below</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Track Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter track name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Teekate (Surface Type) *
            </label>
            <select
              value={formData.surface_type}
              onChange={(e) => setFormData(prev => ({ ...prev, surface_type: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              {SURFACE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Raja pikkus (Track Length in km) - Optional
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.length_km}
              onChange={(e) => setFormData(prev => ({ ...prev, length_km: e.target.value ? Number(e.target.value) : '' }))}
              placeholder="Enter length in km..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-yellow-300 font-medium">Track Requirements</span>
            </div>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• Only track name, surface type, and length are allowed</li>
              <li>• No additional optional information permitted</li>
              <li>• Keep track information simple and focused</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || createEventTrackMutation.isPending || updateEventTrackMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              {createEventTrackMutation.isPending || updateEventTrackMutation.isPending 
                ? 'Saving...' 
                : editingTrack ? 'Update Track' : 'Create Track'
              }
            </button>
          </div>
        </form>
      </FormModal>

    </div>
  )
}