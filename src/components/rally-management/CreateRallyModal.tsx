// src/components/rally-management/CreateRallyModal.tsx
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
  
  // Simplified form data - removed entry_fee and prize_pool
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

  // Pre-fill form when editing - updated to exclude removed fields
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
      const rallyData = {
        name: formData.name,
        description: formData.description,
        game_id: formData.game_id,
        game_type_id: formData.game_type_id,
        competition_date: new Date(formData.competition_date).toISOString(),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        rules: formData.rules,
        is_featured: formData.is_featured,
        // Required fields that were missing
        status: 'upcoming' as const,
        is_active: true,
        // Set default values for removed fields  
        entry_fee: 0,
        prize_pool: 0
      }

      if (rally) {
        await updateRallyMutation.mutateAsync({ id: rally.id, ...rallyData })
      } else {
        await createRallyMutation.mutateAsync({
          rally: rallyData,
          selectedEvents,
          selectedTracks,
          selectedClasses
        })
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save rally:', error)
      // Add user-friendly error handling
      alert('Failed to save rally. Please check the console for details.')
    }
  }

  const canProceedToStep2 = formData.name && formData.game_id && formData.game_type_id && 
                            formData.competition_date && formData.registration_deadline
  const canProceedToStep3 = selectedEvents.length > 0
  const canSubmit = selectedClasses.length > 0

  const isLoading = createRallyMutation.isPending || updateRallyMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <span>🏁</span>
            <span>{rally ? 'Edit Rally' : 'Create New Rally'}</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <span className="text-slate-400 text-xl">×</span>
          </button>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center space-x-8">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Basic Info</span>
            </div>
            
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Events & Tracks</span>
            </div>
            
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Classes</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rally Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Estonian Championship Round 1"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Game *
                  </label>
                  <select
                    name="game_id"
                    value={formData.game_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a game</option>
                    {games.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.name} ({game.platform})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Game Type *
                  </label>
                  <select
                    name="game_type_id"
                    value={formData.game_type_id}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.game_id}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select game type</option>
                    {gameTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Competition Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="competition_date"
                    value={formData.competition_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Registration Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Rally description, special notes, conditions..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rules & Regulations
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Special rules, regulations, requirements..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-slate-300">
                  Feature this rally on homepage
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Events & Tracks */}
          {currentStep === 2 && (
            <div className="p-6">
              <EventSelector
                events={events}
                selectedEvents={selectedEvents}
                selectedTracks={selectedTracks}
                onEventToggle={handleEventToggle}
                onTrackToggle={handleTrackToggle}
                gameId={formData.game_id}
              />
            </div>
          )}

          {/* Step 3: Classes */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">Select Competition Classes</h4>
                <p className="text-slate-400 text-sm">Choose which classes can participate in this rally.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(cls => (
                  <label
                    key={cls.id}
                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedClasses.includes(cls.id)
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.id)}
                      onChange={() => handleClassToggle(cls.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{cls.name}</div>
                      {cls.description && (
                        <div className="text-slate-400 text-sm mt-1">{cls.description}</div>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        {cls.skill_level && (
                          <span>Level: {cls.skill_level}</span>
                        )}
                        {cls.max_participants && (
                          <span>Max: {cls.max_participants}</span>
                        )}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedClasses.includes(cls.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-600'
                    }`}>
                      {selectedClasses.includes(cls.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="border-t border-slate-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={
                      (currentStep === 1 && !canProceedToStep2) ||
                      (currentStep === 2 && !canProceedToStep3)
                    }
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>{rally ? 'Update Rally' : 'Create Rally'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}