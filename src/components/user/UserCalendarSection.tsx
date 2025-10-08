// src/components/user/UserCalendarSection.tsx - Calendar for User Dashboard
'use client'

import { useState } from 'react'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'

export function UserCalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { data: allEvents = [], isLoading } = useCalendarEvents()

  // Calendar data
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('et-EE', { month: 'long', year: 'numeric' })
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const firstDayAdjusted = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build calendar grid
  const calendarDays: number[] = []
  
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

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDayClick = (day: number) => {
    if (day > 0) {
      const clickedDate = new Date(year, month, day)
      setSelectedDate(clickedDate)
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

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return allEvents.filter(event => event.event_date === dateStr)
  }

  const weekDays = ['E', 'T', 'K', 'N', 'R', 'L', 'P']

  return (
    <div className="tech-border rounded-2xl bg-gray-900/50 backdrop-blur-xl p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,165,0,0.3)]">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              Sündmuste Kalender
            </h2>
            <p className="text-gray-400 text-sm">Vaata tulevasi sündmusi ja üritusi</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/50 rounded-lg transition-all duration-300"
        >
          <span className="text-xl text-gray-400 hover:text-red-400">←</span>
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
            {monthName}
          </h3>
          <button
            onClick={goToToday}
            className="mt-1 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Täna
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/50 rounded-lg transition-all duration-300"
        >
          <span className="text-xl text-gray-400 hover:text-red-400">→</span>
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center py-2 text-sm font-bold text-gray-500 font-['Orbitron']"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day > 0
          const displayDay = Math.abs(day)
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
                  ? 'bg-gray-800/30 hover:bg-gray-700/50 cursor-pointer' 
                  : 'bg-transparent border border-transparent cursor-default'
                }
                ${dayHasEvents && isCurrentMonth
                  ? 'border-2 border-blue-500 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : isCurrentMonth
                  ? 'border border-gray-700/30 hover:border-red-500/50'
                  : ''
                }
                ${today ? 'ring-2 ring-red-500/50 bg-red-900/20' : ''}
                ${selected ? 'bg-red-500/30 border-red-500 shadow-[0_0_20px_rgba(255,0,64,0.3)]' : ''}
                group
              `}
            >
              <span className={`
                text-sm font-bold font-['Orbitron']
                ${isCurrentMonth ? 'text-white group-hover:text-red-400' : 'text-gray-700'}
                ${today ? 'text-red-400' : ''}
                ${selected ? 'text-white' : ''}
                transition-colors duration-300
              `}>
                {displayDay}
              </span>

              {/* Today Indicator - only if no events */}
              {today && !selected && !dayHasEvents && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-800/30 border border-red-500/30 rounded-xl">
          <h4 className="text-lg font-bold text-white font-['Orbitron'] mb-3">
            {selectedDate.toLocaleDateString('et-EE', { 
              weekday: 'long',
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h4>
          
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                  <h5 className="text-white font-bold font-['Orbitron']">{event.heading}</h5>
                  <p className="text-red-400 text-sm mt-1">🕐 {event.time}</p>
                  {event.description && (
                    <p className="text-gray-400 text-sm mt-2">{event.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">Sellel kuupäeval pole sündmusi</p>
            )}
          </div>

          <button
            onClick={() => setSelectedDate(null)}
            className="mt-4 w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
          >
            Sulge
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}