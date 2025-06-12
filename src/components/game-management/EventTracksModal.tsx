// ============= Event Tracks Modal =============
// src/components/game-management/EventTracksModal.tsx
import { useEventTrackMutations, useEventTracks } from '@/hooks/useGameManagement'
import { useState } from 'react'
import type { Game, GameClass, GameEvent, GameType, EventTrack } from '@/types'
import { FormModal } from '../shared/Modal'
import { Button, FormGrid, Input, Select, Textarea } from '../shared/FormComponents'
import { FormActions } from '../shared/FormComponents'
import { LoadingState, EmptyState } from '../shared/States'

interface EventTracksModalProps {
  event: GameEvent
  onClose: () => void
}

export function EventTracksModal({ event, onClose }: EventTracksModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTrack, setEditingTrack] = useState<any>(null)
  const { data: tracks = [], isLoading, refetch } = useEventTracks(event.id)
  const { createEventTrack, deleteEventTrack, updateEventTrack } = useEventTrackMutations()

  const [trackForm, setTrackForm] = useState({
    name: '',
    length_km: '',
    stage_number: '',
    description: '',
    surface_type: event.surface_type || 'gravel',
    is_special_stage: false
  })

  const resetForm = () => {
    setTrackForm({
      name: '',
      length_km: '',
      stage_number: '',
      description: '',
      surface_type: event.surface_type || 'gravel',
      is_special_stage: false
    })
  }

  const handleEditTrack = (track: any) => {
    setTrackForm({
      name: track.name,
      length_km: track.length_km?.toString() || '',
      stage_number: track.stage_number?.toString() || '',
      description: track.description || '',
      surface_type: track.surface_type || 'gravel',
      is_special_stage: track.is_special_stage
    })
    setEditingTrack(track)
    setShowCreateForm(true)
  }

  const handleDeleteTrack = async (trackId: string, trackName: string) => {
    if (!confirm(`Are you sure you want to delete "${trackName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteEventTrack.mutateAsync(trackId)
      refetch()
    } catch (error) {
      console.error('Failed to delete track:', error)
    }
  }

  const handleCreateOrUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const trackData = {
        ...trackForm,
        event_id: event.id,
        length_km: trackForm.length_km ? parseFloat(trackForm.length_km) : undefined,
        stage_number: trackForm.stage_number ? parseInt(trackForm.stage_number) : undefined,
      }

      if (editingTrack) {
        await updateEventTrack.mutateAsync({
          id: editingTrack.id,
          ...trackData
        })
      } else {
        await createEventTrack.mutateAsync(trackData)
      }
      
      resetForm()
      setShowCreateForm(false)
      setEditingTrack(null)
      refetch()
    } catch (error) {
      console.error('Failed to save track:', error)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setTrackForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCancelEdit = () => {
    resetForm()
    setShowCreateForm(false)
    setEditingTrack(null)
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
      title={`Tracks for ${event.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Event Info */}
        <div className="p-4 bg-slate-700/30 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-green-300 text-xl">🌍</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">{event.name}</h4>
              <p className="text-slate-400">{event.country} • {event.surface_type}</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-white">
            Tracks ({tracks.length})
          </h4>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={editingTrack !== null}
            variant="success"
            size="sm"
          >
            {showCreateForm ? 'Cancel' : '➕ Add Track'}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <h5 className="text-md font-semibold text-white mb-4">
              {editingTrack ? 'Edit Track' : 'Add New Track'}
            </h5>
            <form onSubmit={handleCreateOrUpdateTrack} className="space-y-4">
              <FormGrid columns={2}>
                <Input
                  label="Track Name"
                  name="name"
                  value={trackForm.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., SS1 Otepää"
                />
                
                <Input
                  label="Stage Number"
                  name="stage_number"
                  type="number"
                  value={trackForm.stage_number}
                  onChange={handleFormChange}
                  min="1"
                  placeholder="1"
                />
              </FormGrid>

              <FormGrid columns={2}>
                <Input
                  label="Length (km)"
                  name="length_km"
                  type="number"
                  value={trackForm.length_km}
                  onChange={handleFormChange}
                  step="0.1"
                  min="0"
                  placeholder="12.5"
                />
                
                <Select
                  label="Surface Type"
                  name="surface_type"
                  value={trackForm.surface_type}
                  onChange={handleFormChange}
                  options={surfaceOptions}
                />
              </FormGrid>

              <Textarea
                label="Description"
                name="description"
                value={trackForm.description}
                onChange={handleFormChange}
                rows={2}
                placeholder="Track description..."
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_special_stage"
                  name="is_special_stage"
                  checked={trackForm.is_special_stage}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_special_stage" className="text-sm text-slate-300">
                  Special Stage (competitive)
                </label>
              </div>

              <FormActions align="left">
                <Button
                  type="submit"
                  variant="success"
                  disabled={!trackForm.name}
                  loading={createEventTrack.isPending || updateEventTrack.isPending}
                >
                  {editingTrack ? 'Update Track' : 'Add Track'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </FormActions>
            </form>
          </div>
        )}

        {/* Tracks List */}
        {isLoading ? (
          <LoadingState message="Loading tracks..." />
        ) : tracks.length === 0 ? (
          <EmptyState
            title="No Tracks"
            message="Add tracks for this event"
            icon="🏁"
            action={{
              label: "Add First Track",
              onClick: () => setShowCreateForm(true)
            }}
          />
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-300 text-sm font-bold">
                      {track.stage_number || '#'}
                    </span>
                  </div>
                  <div>
                    <h6 className="font-medium text-white">{track.name}</h6>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      {track.length_km && <span>📏 {track.length_km}km</span>}
                      <span className="capitalize">🏁 {track.surface_type}</span>
                      {track.is_special_stage && <span className="text-yellow-400">⭐ Special Stage</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTrack(track)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    title="Edit Track"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTrack(track.id, track.name)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Delete Track"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <FormActions>
          <Button onClick={onClose} variant="secondary" className="w-full">
            Close
          </Button>
        </FormActions>
      </div>
    </FormModal>
  )
}