// src/components/game-management/EventsTab.tsx - Optimized version
import { useState } from 'react'
import { useEventTracks, useGameEventMutations } from '@/hooks/useGameManagement'
import { EmptyState, SelectionRequired, LoadingState } from '@/components/shared/States'
import { ConfirmModal, FormModal } from '@/components/shared/Modal'
import { Input, FormActions, Button, FormGrid, Select, Textarea } from '@/components/shared/FormComponents'
import { formatDateTime } from '@/lib/statusUtils'
import type { Game, GameEvent } from '@/types'
import type { GameEventFormData } from '@/types/game'
import { EventTracksModal } from './EventTracksModal'

interface EventsTabProps {
  events: GameEvent[]  // Changed from gameEvents to events
  selectedGame: Game | null
  onRefresh: () => void
}

export function EventsTab({ events, selectedGame, onRefresh }: EventsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<GameEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)

  const { createGameEvent, updateGameEvent, deleteGameEvent } = useGameEventMutations()

  const handleCreate = async (eventData: Partial<GameEvent>) => {
    if (!selectedGame) return
    
    try {
      // Convert GameEvent to GameEventFormData
      const formData: GameEventFormData = {
        game_id: selectedGame.id,
        name: eventData.name || '',
        location: eventData.country || '', // Map country to location
        event_date: new Date().toISOString(), // Add default date
        registration_deadline: new Date().toISOString(), // Add default deadline
        description: eventData.description,
        max_participants: eventData.max_participants
      }
      
      await createGameEvent.mutateAsync(formData)
      setShowCreateModal(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create game event:', error)
    }
  }

  const handleUpdate = async (eventData: Partial<GameEvent>) => {
    if (!editingEvent) return
    
    try {
      await updateGameEvent.mutateAsync({ id: editingEvent.id, ...eventData })
      setEditingEvent(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to update game event:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingEvent) return
    
    try {
      await deleteGameEvent.mutateAsync(deletingEvent.id)
      setDeletingEvent(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete game event:', error)
    }
  }

  const isLoading = createGameEvent.isPending || updateGameEvent.isPending || deleteGameEvent.isPending

  if (!selectedGame) {
    return (
      <SelectionRequired
        title="No Game Selected"
        message="Please select a game first to manage its events"
        icon="🌍"
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🌍</span>
          <span>Events for {selectedGame.name} ({events.length})</span>
        </h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="success"
          icon="➕"
          disabled={isLoading}
        >
          Add Event
        </Button>
      </div>

      {isLoading && <LoadingState message="Processing event operation..." />}

      {!isLoading && events.length === 0 ? (
        <EmptyState
          title="No Events"
          message="Add rally events like Rally Estonia, Rally Finland, etc."
          icon="🌍"
          action={{
            label: "Add First Event",
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={setEditingEvent}
              onDelete={setDeletingEvent}
              onViewTracks={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <EventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isLoading={createGameEvent.isPending}
        />
      )}

      {editingEvent && (
        <EventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={handleUpdate}
          isLoading={updateGameEvent.isPending}
        />
      )}

      {deletingEvent && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingEvent(null)}
          onConfirm={handleDelete}
          title="Delete Event"
          message={`Delete "${deletingEvent.name}"? This will also delete all associated tracks.`}
          confirmText="Delete Event"
          confirmColor="red"
          isLoading={deleteGameEvent.isPending}
        />
      )}

      {selectedEvent && (
        <EventTracksModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

// Event Card Component
interface EventCardProps {
  event: GameEvent
  onEdit: (event: GameEvent) => void
  onDelete: (event: GameEvent) => void
  onViewTracks: () => void
}

function EventCard({ event, onEdit, onDelete, onViewTracks }: EventCardProps) {
  const { data: tracks = [] } = useEventTracks(event.id)

  function setViewingTracks(event: GameEvent): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 group hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <span className="text-green-300 text-xl">🌍</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{event.name}</h3>
            <p className="text-sm text-slate-400">{event.country || 'Unknown'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"  // Changed from "ghost"
            onClick={() => setViewingTracks(event)}
            size="sm"
          >
            View Tracks ({event.tracks?.length || 0})
          </Button>
          
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(event)}
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(event)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {event.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{event.description}</p>
      )}

      <div className="space-y-2 text-sm">
        {event.surface_type && (
          <div className="flex justify-between">
            <span className="text-slate-400">Surface:</span>
            <span className="text-slate-300 capitalize">{event.surface_type}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={event.is_active ? 'text-green-400' : 'text-red-400'}>
            {event.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Tracks:</span>
          <span className="text-slate-300">{tracks.length} tracks</span>
        </div>
      </div>
    </div>
  )
}

// Event Modal Component
interface EventModalProps {
  event?: GameEvent | null
  onClose: () => void
  onSubmit: (eventData: Partial<GameEvent>) => void
  isLoading: boolean
}

function EventModal({ event, onClose, onSubmit, isLoading }: EventModalProps) {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    country: event?.country || '',
    surface_type: event?.surface_type || 'gravel',
    description: event?.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const surfaceOptions = [
    { value: 'gravel', label: 'Gravel' },
    { value: 'tarmac', label: 'Tarmac' },
    { value: 'snow', label: 'Snow' },
    { value: 'mixed', label: 'Mixed' },
  ]

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={`${event ? 'Edit' : 'Create'} Game Event`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-300 text-sm">
            <strong>{event ? 'Update:' : 'Step 1:'}</strong> {event ? 'Modify' : 'Create'} the event first. 
            You can add tracks to this event later.
          </p>
        </div>

        <FormGrid columns={2}>
          <Input
            label="Event Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Rally Estonia, Rally Finland"
            required
          />
          
          <Input
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            placeholder="e.g., Estonia, Finland"
          />
        </FormGrid>

        <Select
          label="Surface Type"
          value={formData.surface_type}
          onChange={(e) => setFormData(prev => ({ ...prev, surface_type: e.target.value }))}
          options={surfaceOptions}
        />
        
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Event description..."
          rows={3}
        />

        <FormActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={isLoading} disabled={!formData.name}>
            {event ? 'Update Event' : 'Create Event'}
          </Button>
        </FormActions>
      </form>
    </FormModal>
  )
}