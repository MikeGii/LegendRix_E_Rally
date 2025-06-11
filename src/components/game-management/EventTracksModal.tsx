// src/components/game-management/EventTracksModal.tsx
import { useState } from 'react'
import { GameEvent, EventTrack, useEventTracks, useCreateEventTrack } from '@/hooks/useGameManagement'

interface EventTracksModalProps {
  event: GameEvent
  onClose: () => void
}

export function EventTracksModal({ event, onClose }: EventTracksModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { data: tracks = [], isLoading, refetch } = useEventTracks(event.id)
  const createTrackMutation = useCreateEventTrack()

  const [trackForm, setTrackForm] = useState({
    name: '',
    length_km: '',
    stage_number: '',
    description: '',
    surface_type: event.surface_type || 'gravel',
    is_special_stage: false
  })

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createTrackMutation.mutateAsync({
        ...trackForm,
        event_id: event.id,
        length_km: trackForm.length_km ? parseFloat(trackForm.length_km) : undefined,
        stage_number: trackForm.stage_number ? parseInt(trackForm.stage_number) : undefined,
      })
      
      setTrackForm({
        name: '',
        length_km: '',
        stage_number: '',
        description: '',
        surface_type: event.surface_type || 'gravel',
        is_special_stage: false
      })
      setShowCreateForm(false)
      refetch()
    } catch (error) {
      console.error('Failed to create track:', error)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setTrackForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <span>🏁</span>
            <span>Tracks for {event.name}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-700/30 rounded-xl">
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

        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold text-white">
            Tracks ({tracks.length})
          </h4>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
          >
            {showCreateForm ? 'Cancel' : '➕ Add Track'}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <h5 className="text-md font-semibold text-white mb-4">Add New Track</h5>
            <form onSubmit={handleCreateTrack} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Track Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={trackForm.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SS1 Otepää"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stage Number
                  </label>
                  <input
                    type="number"
                    name="stage_number"
                    value={trackForm.stage_number}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Length (km)
                  </label>
                  <input
                    type="number"
                    name="length_km"
                    value={trackForm.length_km}
                    onChange={handleFormChange}
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Surface Type
                  </label>
                  <select
                    name="surface_type"
                    value={trackForm.surface_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gravel">Gravel</option>
                    <option value="tarmac">Tarmac</option>
                    <option value="snow">Snow</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={trackForm.description}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Track description..."
                />
              </div>

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

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createTrackMutation.isPending || !trackForm.name}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {createTrackMutation.isPending ? 'Adding...' : 'Add Track'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-slate-500">🏁</span>
            </div>
            <h5 className="text-lg font-semibold text-white mb-2">No Tracks</h5>
            <p className="text-slate-400">Add tracks for this event</p>
          </div>
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
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    Created {new Date(track.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}