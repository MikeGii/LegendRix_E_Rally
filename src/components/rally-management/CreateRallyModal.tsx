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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_id: '',
    game_type_id: '',
    competition_date: '',
    registration_deadline: '',
    max_participants: '',
    entry_fee: '',
    prize_pool: '',
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
        entry_fee: rally.entry_fee?.toString() || '',
        prize_pool: rally.prize_pool?.toString() || '',
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
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : 0,
        prize_pool: formData.prize_pool ? parseFloat(formData.prize_pool) : 0,
        competition_date: new Date(formData.competition_date).toISOString(),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
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
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-slate-700/30">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= step ? 'text-white' : 'text-slate-400'
                }`}>
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Events & Tracks' : 'Classes'}
                </span>
                {step < 3 && <div className="w-8 h-px bg-slate-600 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Rally Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rally Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Estonian Championship 2025"
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
                        <option key={game.id} value={game.id}>{game.name}</option>
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
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
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
                      Entry Fee (€)
                    </label>
                    <input
                      type="number"
                      name="entry_fee"
                      value={formData.entry_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Prize Pool (€)
                    </label>
                    <input
                      type="number"
                      name="prize_pool"
                      value={formData.prize_pool}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Describe the rally competition..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rules & Additional Information
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Special rules, requirements, or additional information..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_featured" className="text-sm text-slate-300">
                    Featured Rally (will be highlighted to users)
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Events & Tracks */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Select Events & Tracks</h4>
                
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No events available for the selected game.</p>
                    <button
                      type="button"
                      onClick={() => window.open('/game-management', '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Create Events First
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map(event => (
                      <EventSelector
                        key={event.id}
                        event={event}
                        isSelected={selectedEvents.includes(event.id)}
                        selectedTracks={selectedTracks[event.id] || []}
                        onEventToggle={() => handleEventToggle(event.id)}
                        onTrackToggle={(trackId: string) => handleTrackToggle(event.id, trackId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Classes */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Select Available Classes</h4>
                
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No classes available for the selected game.</p>
                    <button
                      type="button"
                      onClick={() => window.open('/game-management', '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Create Classes First
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map(gameClass => (
                      <div
                        key={gameClass.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedClasses.includes(gameClass.id)
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                        }`}
                        onClick={() => handleClassToggle(gameClass.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedClasses.includes(gameClass.id) ? 'bg-blue-400' : 'bg-slate-600'
                          }`}></div>
                          <div>
                            <h5 className="font-semibold">{gameClass.name}</h5>
                            <p className="text-xs opacity-70">Competition Class</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedToStep2) ||
                  (currentStep === 2 && !canProceedToStep3)
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !canSubmit}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{rally ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  rally ? 'Update Rally' : 'Create Rally'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
