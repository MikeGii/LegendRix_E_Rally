// src/components/CalendarManagement.tsx - With Edit Functionality
'use client'

import { useState } from 'react'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/shared/FormComponents'
import { 
  useCalendarEvents, 
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  CalendarEvent 
} from '@/hooks/useCalendarEvents'
import '@/styles/futuristic-theme.css'

export function CalendarManagement() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    heading: '',
    time: '',
    description: ''
  })

  // Hooks
  const { data: allEvents = [], isLoading, refetch } = useCalendarEvents()
  const createEventMutation = useCreateCalendarEvent()
  const updateEventMutation = useUpdateCalendarEvent()
  const deleteEventMutation = useDeleteCalendarEvent()

  const handleRefresh = () => {
    refetch()
  }

  // Calendar navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Get calendar data
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('et-EE', { month: 'long', year: 'numeric' })
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const firstDayAdjusted = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build calendar grid
  const calendarDays: (number | null)[] = []
  
  for (let i = firstDayAdjusted - 1; i >= 0; i--) {
    calendarDays.push(-(daysInPrevMonth - i))
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }
  
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(-(i))
  }

  const handleDayClick = (day: number) => {
    if (day > 0) {
      const clickedDate = new Date(year, month, day)
      setSelectedDate(clickedDate)
      // Modal ei avane automaatselt, ainult kuvatakse sündmused all
    }
  }

  const handleOpenCreateModal = () => {
    setEditingEvent(null)
    setFormData({ heading: '', time: '', description: '' })
    setIsEventModalOpen(true)
  }

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      heading: event.heading,
      time: event.time,
      description: event.description || ''
    })
    setIsEventModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEventModalOpen(false)
    setEditingEvent(null)
    setFormData({ heading: '', time: '', description: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.heading || !formData.time) {
      alert('Palun täida kõik kohustuslikud väljad')
      return
    }

    try {
      if (editingEvent) {
        // Update existing event
        await updateEventMutation.mutateAsync({
          id: editingEvent.id,
          heading: formData.heading,
          time: formData.time,
          description: formData.description || undefined
        })
        console.log('✅ Sündmus edukalt uuendatud!')
      } else {
        // Create new event
        if (!selectedDate) {
          alert('Palun vali kuupäev')
          return
        }

        const eventDate = selectedDate.toISOString().split('T')[0]

        await createEventMutation.mutateAsync({
          event_date: eventDate,
          heading: formData.heading,
          time: formData.time,
          description: formData.description || undefined
        })
        console.log('✅ Sündmus edukalt lisatud!')
      }

      handleCloseModal()
    } catch (error) {
      console.error('❌ Viga sündmuse salvestamisel:', error)
      alert('Viga sündmuse salvestamisel. Palun proovi uuesti.')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Kas oled kindel, et soovid selle sündmuse kustutada?')) {
      return
    }

    try {
      await deleteEventMutation.mutateAsync(eventId)
      console.log('✅ Sündmus kustutatud!')
    } catch (error) {
      console.error('❌ Viga sündmuse kustutamisel:', error)
      alert('Viga sündmuse kustutamisel.')
    }
  }

  const isToday = (day: number) => {
    if (day <= 0) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate || day <= 0) return false
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const hasEvents = (day: number) => {
    if (day <= 0) return false
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return allEvents.some(event => event.event_date === dateStr)
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0]
    return allEvents.filter(event => event.event_date === dateStr)
  }

  // Calculate stats
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const futureEvents = allEvents.filter(event => event.event_date >= todayStr)
  const currentMonthEvents = allEvents.filter(event => {
    const eventDate = new Date(event.event_date)
    return eventDate.getMonth() === month && eventDate.getFullYear() === year
  })

  const weekDays = ['E', 'T', 'K', 'N', 'R', 'L', 'P']

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '4s' }}></div>
        <div className="scan-line"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Admin Page Header */}
        <AdminPageHeader
          title="Kalendri haldamine"
          description="Halda kalendris toimuvaid sündmuseid ja üritusi"
          icon="📅"
          stats={[
            { label: 'Tulevased sündmused', value: futureEvents.length, color: 'blue' },
            { label: 'Käesolev kuu', value: currentMonthEvents.length, color: 'green' },
            { label: 'Kokku sündmusi', value: allEvents.length, color: 'blue' }
          ]}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Calendar Section */}
        <div className="tech-border rounded-2xl bg-gray-900/50 backdrop-blur-xl p-8">
          
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={previousMonth}
              className="group px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/50 rounded-lg transition-all duration-300"
            >
              <span className="text-xl text-gray-400 group-hover:text-red-400">←</span>
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                {monthName}
              </h2>
              <button
                onClick={goToToday}
                className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Täna
              </button>
            </div>

            <button
              onClick={nextMonth}
              className="group px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/50 rounded-lg transition-all duration-300"
            >
              <span className="text-xl text-gray-400 group-hover:text-red-400">→</span>
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center py-3 text-sm font-bold text-gray-500 font-['Orbitron']"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - More Compact Version */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day > 0
              const isPrevOrNextMonth = day < 0
              const displayDay = isPrevOrNextMonth ? Math.abs(day) : day
              const today = isToday(day)
              const selected = isSelected(day)
              const dayHasEvents = hasEvents(day)

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!isCurrentMonth}
                  className={`
                    relative h-16 p-2 rounded-lg transition-all duration-300
                    ${isCurrentMonth 
                      ? 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/30 hover:border-red-500/50 cursor-pointer' 
                      : 'bg-transparent border border-transparent cursor-default'
                    }
                    ${today ? 'ring-2 ring-red-500/50 bg-red-900/20' : ''}
                    ${selected ? 'bg-red-500/30 border-red-500 shadow-[0_0_20px_rgba(255,0,64,0.3)]' : ''}
                    group
                  `}
                >
                  {/* Day Number */}
                  <span className={`
                    text-sm font-bold font-['Orbitron']
                    ${isCurrentMonth ? 'text-white group-hover:text-red-400' : 'text-gray-700'}
                    ${today ? 'text-red-400' : ''}
                    ${selected ? 'text-white' : ''}
                    transition-colors duration-300
                  `}>
                    {displayDay}
                  </span>

                  {/* Event Indicator Dots */}
                  {dayHasEvents && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Today Indicator Dot */}
                  {today && !selected && !dayHasEvents && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Hover Effect */}
                  {isCurrentMonth && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent rounded-lg transition-all duration-300 pointer-events-none"></div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected Date Info */}
          {selectedDate && !isEventModalOpen && (
            <div className="mt-8 p-6 bg-gray-800/30 border border-red-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-['Orbitron'] mb-1">
                    {selectedDate.toLocaleDateString('et-EE', { 
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 font-['Orbitron'] text-sm"
                  >
                    + Lisa sündmus
                  </button>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
                  >
                    Sulge
                  </button>
                </div>
              </div>
              
              {/* Display events for selected date */}
              <div className="space-y-2">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-bold font-['Orbitron']">{event.heading}</h4>
                          <p className="text-red-400 text-sm mt-1">🕐 {event.time}</p>
                          {event.description && (
                            <p className="text-gray-400 text-sm mt-2">{event.description}</p>
                          )}
                        </div>
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            className="px-3 py-1 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 hover:border-blue-500/50 rounded text-blue-400 hover:text-blue-300 text-sm transition-all duration-300"
                          >
                            Muuda
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deleteEventMutation.isPending}
                            className="px-3 py-1 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 rounded text-red-400 hover:text-red-300 text-sm transition-all duration-300 disabled:opacity-50"
                          >
                            Kustuta
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">Sellel kuupäeval pole veel sündmusi</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Add/Edit Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        title={editingEvent 
          ? `Muuda sündmust - ${new Date(editingEvent.event_date).toLocaleDateString('et-EE')}` 
          : selectedDate 
            ? `Lisa sündmus - ${selectedDate.toLocaleDateString('et-EE')}` 
            : 'Lisa sündmus'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Pealkiri"
            placeholder="Sisesta sündmuse pealkiri"
            value={formData.heading}
            onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
            required
          />

          <Input
            label="Kellaaeg"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />

          <Textarea
            label="Kirjeldus (valikuline)"
            placeholder="Lisa sündmuse kirjeldus..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 uppercase tracking-wider"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createEventMutation.isPending || updateEventMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] uppercase tracking-wider disabled:opacity-50"
            >
              {createEventMutation.isPending || updateEventMutation.isPending 
                ? 'Salvestan...' 
                : editingEvent ? 'Uuenda sündmus' : 'Lisa sündmus'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}