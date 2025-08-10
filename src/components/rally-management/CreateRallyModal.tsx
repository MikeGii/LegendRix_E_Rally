// src/components/rally-management/CreateRallyModal.tsx - ENHANCED with Event/Track Loading and Saving
import { useState, useEffect } from 'react'
import { Rally, useCreateRally, useUpdateRally, useRallyEvents, useRallyClasses } from '@/hooks/useRallyManagement'
import { useGames, useGameTypes, useGameEvents, useGameClasses } from '@/hooks/useGameManagement'
import { useCompleteRallySetup } from '@/hooks/useRallyLinking'
import { EventSelector } from './EventSelector'
import { supabase } from '@/lib/supabase'

interface CreateRallyModalProps {
  rally?: Rally | null
  onClose: () => void
  onSuccess: () => void
}

export function CreateRallyModal({ rally, onClose, onSuccess }: CreateRallyModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Updated form data with separate date and time fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_id: '',
    game_type_id: '',
    competition_date: '', // Date only (YYYY-MM-DD)
    competition_time: '', // Time only (HH:MM)
    registration_deadline_date: '', // Date only (YYYY-MM-DD)
    registration_deadline_time: '', // Time only (HH:MM)
    max_participants: '',
    rules: ''
  })
  
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedTracks, setSelectedTracks] = useState<{ [eventId: string]: string[] }>({})
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  // Data hooks - Only load when needed
  const { data: games = [] } = useGames()
  const { data: gameTypes = [] } = useGameTypes(formData.game_id)
  const { data: events = [] } = useGameEvents(currentStep >= 3 ? formData.game_id : undefined)
  const { data: classes = [] } = useGameClasses(currentStep >= 3 ? formData.game_id : undefined)
  
  // FIXED: Load existing rally events and classes when editing
  const { data: existingRallyEvents = [] } = useRallyEvents(rally?.id)
  const { data: existingRallyClasses = [] } = useRallyClasses(rally?.id)
  
  // Mutation hooks
  const createRallyMutation = useCreateRally()
  const updateRallyMutation = useUpdateRally()
  const completeRallySetup = useCompleteRallySetup()

  // Helper function to parse datetime into date and time components
  const parseDateTimeToComponents = (dateTimeString: string) => {
    if (!dateTimeString) return { date: '', time: '' }
    
    const date = new Date(dateTimeString)
    // Use local date/time instead of UTC
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    }
  }

  // Helper function to combine date and time into ISO string (local time)
  const combineDateTime = (date: string, time: string) => {
    if (!date || !time) return ''
    
    // Create date in local timezone
    const combinedDate = new Date(`${date}T${time}:00`)
    return combinedDate.toISOString()
  }

  // Pre-fill form when editing
  useEffect(() => {
    if (rally) {
      const competitionDateTime = parseDateTimeToComponents(rally.competition_date)
      const registrationDateTime = parseDateTimeToComponents(rally.registration_deadline)
      
      setFormData({
        name: rally.name || '',
        description: rally.description || '',
        game_id: rally.game_id || '',
        game_type_id: rally.game_type_id || '',
        competition_date: competitionDateTime.date,
        competition_time: competitionDateTime.time,
        registration_deadline_date: registrationDateTime.date,
        registration_deadline_time: registrationDateTime.time,
        max_participants: rally.max_participants?.toString() || '',
        rules: rally.rules || ''
      })
    }
  }, [rally])

  // FIXED: Load existing events and tracks when editing
  useEffect(() => {
    if (rally && existingRallyEvents.length > 0) {
      console.log('🔄 Loading existing rally events and tracks for editing...')
      
      // Extract selected events
      const eventIds = existingRallyEvents.map(re => re.event_id)
      setSelectedEvents(eventIds)
      
      // Extract selected tracks by event
      const tracksByEvent: { [eventId: string]: string[] } = {}
      existingRallyEvents.forEach(rallyEvent => {
        if (rallyEvent.tracks && rallyEvent.tracks.length > 0) {
          // RallyEventTrack has track_id field directly, not nested track object
          tracksByEvent[rallyEvent.event_id] = rallyEvent.tracks.map(track => track.track_id).filter(Boolean)
        }
      })
      setSelectedTracks(tracksByEvent)
      
      console.log('✅ Loaded existing events:', eventIds)
      console.log('✅ Loaded existing tracks:', tracksByEvent)
    }
  }, [rally, existingRallyEvents])

  // FIXED: Load existing classes when editing
  useEffect(() => {
    if (rally && existingRallyClasses.length > 0) {
      console.log('🔄 Loading existing rally classes for editing...')
      
      const classIds = existingRallyClasses.map(rc => rc.class_id)
      setSelectedClasses(classIds)
      
      console.log('✅ Loaded existing classes:', classIds)
    }
  }, [rally, existingRallyClasses])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Prevent event handlers from causing form submission
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

  // FIXED: Complete implementation with event/track/class handling for both create and edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Combine date and time fields into ISO strings (local time)
      const rallyData = {
        name: formData.name,
        description: formData.description,
        game_id: formData.game_id,
        game_type_id: formData.game_type_id,
        competition_date: combineDateTime(formData.competition_date, formData.competition_time),
        registration_deadline: combineDateTime(formData.registration_deadline_date, formData.registration_deadline_time),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        rules: formData.rules
      }

      if (rally) {
        // FIXED: Update existing rally AND handle events/tracks/classes
        console.log('🔄 Updating existing rally with events, tracks, and classes...')
        
        // Step 1: Update the rally basic information
        await updateRallyMutation.mutateAsync({ id: rally.id, ...rallyData })
        
        // Step 2: Clear existing events, tracks, and classes using Supabase directly
        console.log('🔄 Clearing existing rally events, tracks, and classes...')
        
        try {
          // Delete existing rally event tracks first (foreign key constraint)
          const { error: tracksError } = await supabase
            .from('rally_event_tracks')
            .delete()
            .in('rally_event_id', 
              existingRallyEvents.map(re => re.id)
            )
          
          if (tracksError) {
            console.warn('Error deleting existing tracks:', tracksError)
          }

          // Delete existing rally events
          const { error: eventsError } = await supabase
            .from('rally_events')
            .delete()
            .eq('rally_id', rally.id)
          
          if (eventsError) {
            console.warn('Error deleting existing events:', eventsError)
          }

          // Delete existing rally classes
          const { error: classesError } = await supabase
            .from('rally_classes')
            .delete()
            .eq('rally_id', rally.id)
          
          if (classesError) {
            console.warn('Error deleting existing classes:', classesError)
          }

          console.log('✅ Existing rally data cleared')
        } catch (clearError) {
          console.error('Error clearing existing data:', clearError)
          // Continue anyway - the complete setup will handle duplicates
        }
        
        // Step 3: Add new events, tracks, and classes
        if (selectedEvents.length > 0 || selectedClasses.length > 0) {
          await completeRallySetup.mutateAsync({
            rallyId: rally.id,
            selectedEvents,
            selectedTracks,
            selectedClasses
          })
          
          console.log('✅ Rally updated successfully with all events, tracks, and classes!')
        } else {
          console.log('✅ Rally updated successfully (no events/classes selected)')
        }
        
      } else {
        // Create new rally
        console.log('🔄 Creating new rally with events, tracks, and classes...')
        
        const createdRally = await createRallyMutation.mutateAsync(rallyData)
        
        // Link events, tracks, and classes to the created rally
        if (selectedEvents.length > 0 || selectedClasses.length > 0) {
          await completeRallySetup.mutateAsync({
            rallyId: createdRally.id,
            selectedEvents,
            selectedTracks,
            selectedClasses
          })
          
          console.log('✅ Rally created successfully with all events, tracks, and classes linked!')
        } else {
          console.log('✅ Rally created successfully (no events/classes selected)')
        }
      }
      
      onSuccess()
      onClose()
      
    } catch (error) {
      console.error('Failed to save rally:', error)
      alert('Ralli salvestamine ebaõnnestus. Palun kontrolli konsoolit vigade osas.')
    }
  }

  // Prevent navigation functions from causing issues
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Close handler to prevent event bubbling
  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Reset form state when closing
    setCurrentStep(1)
    setFormData({
      name: '',
      description: '',
      game_id: '',
      game_type_id: '',
      competition_date: '',
      competition_time: '',
      registration_deadline_date: '',
      registration_deadline_time: '',
      max_participants: '',
      rules: ''
    })
    setSelectedEvents([])
    setSelectedTracks({})
    setSelectedClasses([])
    
    onClose()
  }

  // Show loading state when any mutations are pending
  const isLoading = createRallyMutation.isPending || updateRallyMutation.isPending || completeRallySetup.isPending

  // Validation check for required fields
  const isStep1Valid = formData.name && 
                      formData.competition_date && formData.competition_time && 
                      formData.registration_deadline_date && formData.registration_deadline_time

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
              
              {/* Step Labels */}
              <div className="flex items-center space-x-8 mt-2 text-xs text-slate-400">
                <span className={currentStep === 1 ? 'text-blue-400' : currentStep > 1 ? 'text-green-400' : ''}>
                  Põhiinfo
                </span>
                <span className={currentStep === 2 ? 'text-blue-400' : currentStep > 2 ? 'text-green-400' : ''}>
                  Mäng
                </span>
                <span className={currentStep === 3 ? 'text-blue-400' : ''}>
                  Sündmused
                </span>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <span className="text-slate-400 text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Basic Rally Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                  maxLength={100}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Sisesta ralli nimi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kirjeldus
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Kirjelda rallit..."
                />
              </div>

              {/* UPDATED: Competition Date and Time - Separate inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Võistluse kuupäev *
                  </label>
                  <input
                    type="date"
                    name="competition_date"
                    value={formData.competition_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Võistluse kellaaeg *
                  </label>
                  <input
                    type="time"
                    name="competition_time"
                    value={formData.competition_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              {/* UPDATED: Registration Deadline Date and Time - Separate inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Registreerimise kuupäev *
                  </label>
                  <input
                    type="date"
                    name="registration_deadline_date"
                    value={formData.registration_deadline_date}
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
                    type="time"
                    name="registration_deadline_time"
                    value={formData.registration_deadline_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="HH:MM"
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
            </div>
          )}

          {/* Step 2: Game Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
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
                    {games.map(game => (
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
                    {gameTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Maksimaalne osalejate arv
                </label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ei ole piirang"
                />
              </div>
            </div>
          )}

          {/* Step 3: Events and Classes Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Etapid ja klassid</h3>
              
              {formData.game_id ? (
                <div className="space-y-8">
                  {/* Events & Tracks Selection */}
                  <div>
                    <EventSelector
                      events={events}
                      selectedEvents={selectedEvents}
                      selectedTracks={selectedTracks}
                      onEventToggle={handleEventToggle}
                      onTrackToggle={handleTrackToggle}
                      gameId={formData.game_id}
                    />
                  </div>

                  {/* Classes Selection */}
                  {classes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Vali klassid</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {classes.map(cls => (
                          <label
                            key={cls.id}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedClasses.includes(cls.id)
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedClasses.includes(cls.id)}
                              onChange={() => handleClassToggle(cls.id)}
                              className="sr-only"
                            />
                            <span>{cls.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">Palun vali esmalt mäng teises etapis</p>
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
                  disabled={isLoading}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Tagasi
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Tühista
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === 1 ? !isStep1Valid : (!formData.game_id || !formData.game_type_id) || isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Edasi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Salvestab...</span>
                    </>
                  ) : (
                    <span>{rally ? 'Uuenda ralli' : 'Loo ralli'}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}