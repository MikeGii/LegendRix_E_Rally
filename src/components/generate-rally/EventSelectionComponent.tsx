// src/components/generate-rally/EventSelectionComponent.tsx
'use client'

import { GameEvent } from '@/types'
import '@/styles/futuristic-theme.css'

interface EventSelectionComponentProps {
  events: GameEvent[]
  selectedEventIds: string[]
  onEventToggle: (eventId: string) => void
  isLoading?: boolean
}

export function EventSelectionComponent({ 
  events, 
  selectedEventIds, 
  onEventToggle,
  isLoading = false 
}: EventSelectionComponentProps) {
  const handleSelectAll = () => {
    if (selectedEventIds.length === events.length) {
      // Deselect all
      selectedEventIds.forEach(id => onEventToggle(id))
    } else {
      // Select all
      events.forEach(event => {
        if (!selectedEventIds.includes(event.id)) {
          onEventToggle(event.id)
        }
      })
    }
  }

  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Header with scan line effect */}
      <div className="relative bg-gradient-to-r from-yellow-900/20 to-black p-4 border-b border-yellow-500/20">
        <div className="scan-line-purple"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              <span className="text-white text-lg">🌍</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                Vali riigid
              </h2>
              <p className="text-yellow-400/80 text-xs font-medium">Millistele riikidele soovid radu genereerida?</p>
            </div>
          </div>
          
          {events.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="futuristic-btn px-3 py-1.5 bg-gray-900/50 hover:bg-gray-800/70 border border-gray-700 hover:border-yellow-500/50 text-gray-300 hover:text-yellow-400 rounded-lg text-xs font-['Orbitron'] uppercase tracking-wider transition-all"
            >
              {selectedEventIds.length === events.length ? 'Tühista kõik' : 'Vali kõik'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <span className="text-gray-500 text-2xl">🌍</span>
            </div>
            <p className="text-gray-400 mb-4">Valitud mängul pole ühtegi riiki lisatud</p>
            <button
              onClick={() => window.location.href = '/game-management'}
              className="futuristic-btn futuristic-btn-primary px-4 py-2 rounded-lg text-sm"
            >
              Lisa riike
            </button>
          </div>
        ) : (
          <>
            {/* Selected Count Badge */}
            <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.6)]"></div>
              <span className="text-gray-400 text-xs font-['Orbitron'] uppercase tracking-wider">Valitud:</span>
              <span className="text-white font-bold font-['Orbitron']">{selectedEventIds.length}/{events.length}</span>
            </div>

            {/* Events Grid - More Compact */}
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {events.map((event) => {
                const isSelected = selectedEventIds.includes(event.id)
                
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventToggle(event.id)}
                    className={`
                      relative group p-3 rounded-xl border transition-all duration-300
                      ${isSelected
                        ? 'bg-gradient-to-br from-yellow-900/30 to-orange-800/20 border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                        : 'bg-gray-900/30 border-gray-800 hover:bg-gray-900/50 hover:border-gray-700'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div className="absolute -top-1 -right-1">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300
                        ${isSelected 
                          ? 'bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.8)]' 
                          : 'bg-gray-800 border-gray-600 group-hover:border-yellow-500/50'
                        }
                      `}>
                        {isSelected && (
                          <span className="text-black text-xs font-bold">✓</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className={`
                      absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
                      ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-600/20 to-transparent blur-sm"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Country Flag */}
                      <div className="text-2xl mb-1">
                        {getCountryFlag(event.name)}
                      </div>
                      
                      {/* Event Name */}
                      <h3 className={`
                        font-medium text-sm font-['Orbitron'] transition-colors
                        ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                      `}>
                        {event.name}
                      </h3>
                      
                      {/* Active Badge */}
                      <div className="mt-1">
                        <span className={`
                          inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium transition-all
                          ${isSelected 
                            ? 'bg-green-500/30 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                            : 'bg-green-500/20 text-green-400/80'
                          }
                        `}>
                          AKTIIVNE
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper function to get country flag emoji
function getCountryFlag(eventName: string): string {
  const countryFlags: { [key: string]: string } = {
    'Estonia': '🇪🇪',
    'Eesti': '🇪🇪',
    'Latvia': '🇱🇻',
    'Läti': '🇱🇻',
    'Lithuania': '🇱🇹',
    'Leedu': '🇱🇹',
    'Finland': '🇫🇮',
    'Soome': '🇫🇮',
    'Sweden': '🇸🇪',
    'Rootsi': '🇸🇪',
    'Norway': '🇳🇴',
    'Norra': '🇳🇴',
    'Poland': '🇵🇱',
    'Poola': '🇵🇱',
    'Germany': '🇩🇪',
    'Saksamaa': '🇩🇪',
    'UK': '🇬🇧',
    'United Kingdom': '🇬🇧',
    'Suurbritannia': '🇬🇧',
    'France': '🇫🇷',
    'Prantsusmaa': '🇫🇷',
    'Italy': '🇮🇹',
    'Itaalia': '🇮🇹',
    'Spain': '🇪🇸',
    'Hispaania': '🇪🇸',
    'Russia': '🇷🇺',
    'Venemaa': '🇷🇺',
    'Denmark': '🇩🇰',
    'Taani': '🇩🇰',
    'Belgium': '🇧🇪',
    'Belgia': '🇧🇪',
    'Netherlands': '🇳🇱',
    'Holland': '🇳🇱',
    'Madalmaad': '🇳🇱',
    'Austria': '🇦🇹',
    'Switzerland': '🇨🇭',
    'Šveits': '🇨🇭',
    'Czech': '🇨🇿',
    'Tšehhi': '🇨🇿',
    'Portugal': '🇵🇹',
    'USA': '🇺🇸',
    'Canada': '🇨🇦',
    'Kanada': '🇨🇦',
    'Japan': '🇯🇵',
    'Jaapan': '🇯🇵',
    'Australia': '🇦🇺',
    'Austraalia': '🇦🇺'
  }
  
  // Try to find a match
  for (const [key, flag] of Object.entries(countryFlags)) {
    if (eventName.toLowerCase().includes(key.toLowerCase())) {
      return flag
    }
  }
  
  // Default flag if no match found
  return '🏁'
}