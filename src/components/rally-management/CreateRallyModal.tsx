// src/components/rally-management/CreateRallyModal.tsx - CLEANED VERSION
import { useState, useEffect } from 'react'
import { Rally, useCreateRally, useUpdateRally } from '@/hooks/useRallyManagement'
import { useGames, useGameTypes, useGameEvents, useGameClasses, useEventTracks } from '@/hooks/useGameManagement'
import { EventSelector } from './EventSelector'

interface CreateRallyModalProps {
  rally?: Rally | null
  onClose: () => void
  onSuccess: () => void
}

export function CreateRallyModal({ rally, onClose, onSuccess }: CreateRallyModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Clean form data - removed all unwanted fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_id: '',
    game_type_id: '',
    competition_date: '',
    registration_deadline: '',
    max_participants: '',
    rules: '',
    is_featured: false
  })
  
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedTracks, setSelectedTracks] = useState<{ [eventId: string]: string[] }>({})
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  // Data hooks
  const { data: games = [] } = useGames()
  const { data: gameTypes = [] } = useGameTypes(formData.game_id)
  const { data: events = [] } = useGameEvents(formData.game_id)
  const { data: classes = [] } = useGameClasses(formData.game_id)
  
  const createRallyMutation = useCreateRally()
  const updateRallyMutation = useUpdateRally()

  // Pre-fill form when editing
  useEffect(() => {
    if (rally) {
      setFormData({
        name: rally.name || '',
        description: rally.description || '',
        game_id: rally.game_id || '',
        game_type_id: rally.game_type_id || '',
        competition_date: rally.competition_date ? new Date(rally.competition_date).toISOString().slice(0, 16) : '',
        registration_deadline: rally.registration_deadline ? new Date(rally.registration_deadline).toISOString().slice(0, 16) : '',
        max_participants: rally.max_participants?.toString() || '',
        rules: rally.rules || '',
        is_featured: rally.is_featured || false
      })
    }
  }, [rally])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => {
      const newEvents = prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
      
      // Clear tracks for removed events
      if (!newEvents.includes(eventId)) {
        setSelectedTracks(prev => {
          const newTracks = { ...prev }
          delete newTracks[eventId]
          return newTracks
        })
      }
      
      return newEvents
    })
  }

  const handleTrackToggle = (eventId: string, trackId: string) => {
    setSelectedTracks(prev => ({
      ...prev,
      [eventId]: prev[eventId]?.includes(trackId)
        ? prev[eventId].filter(id => id !== trackId)
        : [...(prev[eventId] || []), trackId]
    }))
  }

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Clean rally data - matches the useCreateRally interface
      const rallyData = {
        name: formData.name,
        description: formData.description,
        game_id: formData.game_id,
        game_type_id: formData.game_type_id,
        competition_date: new Date(formData.competition_date).toISOString(),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        rules: formData.rules,
        is_featured: formData.is_featured
      }

      if (rally) {
        await updateRallyMutation.mutateAsync({ id: rally.id, ...rallyData })
      } else {
        // Create rally - the hook only expects rally data, not additional properties
        await createRallyMutation.mutateAsync(rallyData)
        
        // TODO: Handle events, tracks, and classes separately after rally creation
        // This would require additional API calls or a different approach
        console.log('Rally created. Events, tracks, and classes handling not yet implemented:', {
          selectedEvents,
          selectedTracks,
          selectedClasses
        })
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save rally:', error)
      alert('Ralli salvestamine ebaõnnestus. Palun kontrolli konsoolit vigade osas.')
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {rally ? 'Muuda rallit' : 'Loo uus ralli'}
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? 'bg-blue-600 text-white'
                        : step < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-600 text-slate-400'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <span className="text-slate-400 text-xl">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Põhiinfo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ralli nimi *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Sisesta ralli nimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max osavõtjaid
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Maksimaalne osavõtjate arv"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kirjeldus
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Kirjelda rallit..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Võistluse kuupäev *
                  </label>
                  <input
                    type="datetime-local"
                    name="competition_date"
                    value={formData.competition_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Registreerimise tähtaeg *
                  </label>
                  <input
                    type="datetime-local"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reeglid
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Kirjelda ralli reegleid..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-slate-300">
                  Märgi kui esiletõstetud ralli
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Game Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Mäng ja tüüp</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mäng *
                  </label>
                  <select
                    name="game_id"
                    value={formData.game_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Vali mäng</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mängu tüüp *
                  </label>
                  <select
                    name="game_type_id"
                    value={formData.game_type_id}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.game_id}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                  >
                    <option value="">Vali mängu tüüp</option>
                    {gameTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Events and Classes */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Etapid ja klassid</h3>
              
              {formData.game_id ? (
                <EventSelector
                  events={events}
                  selectedEvents={selectedEvents}
                  selectedTracks={selectedTracks}
                  onEventToggle={handleEventToggle}
                  onTrackToggle={handleTrackToggle}
                  gameId={formData.game_id}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">Palun vali esmalt mäng eelmises etapis</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/50">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Tagasi
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Tühista
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.name || !formData.competition_date || !formData.registration_deadline}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Edasi
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createRallyMutation.isPending || updateRallyMutation.isPending}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {createRallyMutation.isPending || updateRallyMutation.isPending
                    ? 'Salvestamine...'
                    : rally ? 'Uuenda ralli' : 'Loo ralli'
                  }
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}