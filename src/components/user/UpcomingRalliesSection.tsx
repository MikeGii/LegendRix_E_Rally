// src/components/user/UpcomingRalliesSection.tsx - MOBILE-FRIENDLY WITH ORIGINAL DESKTOP LAYOUT
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TransformedRally, useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { useDeleteRegistration } from '@/hooks/useRallyRegistrations'
import { RallyDetailModal } from '@/components/rally/RallyDetailModal'

// Import helper functions for proper status checking
import { 
  canRegisterToRally, 
  getRallyStatus, 
  getStatusDisplayText, 
  getStatusColor,
  isRallyInPast 
} from '@/hooks/useOptimizedRallies'

interface UpcomingRalliesSectionProps {
  rallies: TransformedRally[]
  isLoading: boolean
  canAccessRallies: boolean
}

export function UpcomingRalliesSection({ rallies, isLoading, canAccessRallies }: UpcomingRalliesSectionProps) {
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPastRallies, setShowPastRallies] = useState(false)
  const router = useRouter()
  
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  const deleteRegistrationMutation = useDeleteRegistration()

  if (!canAccessRallies) return null

  // Helper function to check if rally is in the past (1-hour rule)
  const isRallyPast = (competitionDate: string) => {
    return isRallyInPast({ competition_date: competitionDate })
  }

  // Split rallies by date (ignore status, use only time)
  const upcomingRallies = rallies.filter(rally => !isRallyPast(rally.competition_date))
  const pastRallies = rallies.filter(rally => isRallyPast(rally.competition_date))

  // Sort: upcoming by date ASC, past by date DESC
  const sortedUpcoming = [...upcomingRallies].sort((a, b) => 
    new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime()
  )
  const sortedPast = [...pastRallies].sort((a, b) => 
    new Date(b.competition_date).getTime() - new Date(a.competition_date).getTime()
  )

  // Choose which to display
  const displayRallies = showPastRallies ? sortedPast : sortedUpcoming
  const limitedRallies = isExpanded ? displayRallies : displayRallies.slice(0, 5)

  // Functions
  const handleRegister = (rally: TransformedRally) => {
    router.push(`/registration?rallyId=${rally.id}`)
  }

  const handleUnregister = async (registrationId: string) => {
    if (window.confirm('Kas olete kindel, et soovite tühistada oma registreeringu?')) {
      try {
        await deleteRegistrationMutation.mutateAsync(registrationId)
      } catch (error) {
        console.error('Error unregistering:', error)
        alert('Registreeringu tühistamine ebaõnnestus. Palun proovige uuesti.')
      }
    }
  }

  const handleViewDetails = (rally: TransformedRally) => {
    setSelectedRally(rally)
  }

  // Get registration info
  const getRegistrationInfo = (rallyId: string) => {
    return userRegistrations.find(reg => reg.rally_id === rallyId)
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Format time helper
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('et-EE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Futuristic status color mapping
  const getFuturisticStatusColor = (status: string): string => {
    switch (status) {
      case 'bg-green-500/20 text-green-400 border-green-500/30':
        return 'bg-gradient-to-r from-green-900/20 to-green-800/10 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
      case 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30':
        return 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
      case 'bg-orange-500/20 text-orange-400 border-orange-500/30':
        return 'bg-gradient-to-r from-orange-900/20 to-orange-800/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
      case 'bg-red-500/20 text-red-400 border-red-500/30':
        return 'bg-gradient-to-r from-red-900/20 to-red-800/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      case 'bg-slate-500/20 text-slate-400 border-slate-500/30':
        return 'bg-gradient-to-r from-gray-900/20 to-gray-800/10 text-gray-400 border border-gray-500/30'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-700'
    }
  }

return (
 <>
 <div className="upcoming-rallies-container">
   <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-4 sm:p-8 relative overflow-hidden">
     {/* Animated background pattern */}
     <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
     
     {/* Header with futuristic styling */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
       <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 font-['Orbitron'] tracking-wider">
         <span className="text-2xl sm:text-3xl text-red-400 animate-pulse">{showPastRallies ? '🏆' : '🏁'}</span>
         <span className="bg-gradient-to-r from-red-400 to-gray-300 bg-clip-text text-transparent">
           {showPastRallies ? 'OLNUD RALLID' : 'TULEVASED RALLID'}
         </span>
       </h2>

       
       {/* Toggle buttons */}
       <div className="flex justify-center sm:justify-end">
         <div className="bg-gray-900/70 rounded-xl p-1.5 backdrop-blur-xl border border-gray-800">
           <button
             onClick={() => {
               setShowPastRallies(false)
               setIsExpanded(false)
             }}
             className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
               !showPastRallies 
                 ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                 : 'text-gray-400 hover:text-red-400'
             }`}
           >
             Tulevased
             <span className="ml-1 sm:ml-2 opacity-70">({sortedUpcoming.length})</span>
           </button>
           <button
             onClick={() => {
               setShowPastRallies(true)
               setIsExpanded(false)
             }}
             className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
               showPastRallies 
                 ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(255,0,64,0.5)]' 
                 : 'text-gray-400 hover:text-red-400'
             }`}
           >
             Olnud
             <span className="ml-1 sm:ml-2 opacity-70">({sortedPast.length})</span>
           </button>
         </div>
       </div>
     </div>
     
     {/* Scan line effect */}
     <div className="scan-line"></div>
     
     {/* Content - directly in main div without wrapper */}
     {isLoading ? (
       <div className="flex justify-center py-12">
         <div className="text-center">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 w-16 h-16 border-4 border-gray-500/20 border-b-gray-500 rounded-full animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
           </div>
           <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">LAADIN RALLISID...</p>
         </div>
       </div>
     ) : displayRallies.length === 0 ? (
       /* Empty state */
       <div className="text-center py-16 relative">
         <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-48 sm:w-64 h-48 sm:h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
         </div>
         <div className="relative">
           <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_30px_rgba(255,0,64,0.3)]">
             <span className="text-3xl sm:text-4xl text-red-400">
               {showPastRallies ? '🏆' : '🏁'}
             </span>
           </div>
           <h3 className="text-base sm:text-lg font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wide">
             {showPastRallies ? 'Olnud rallisid ei leitud' : 'Tulevasi rallisid ei leitud'}
           </h3>
           <p className="text-gray-500 text-sm sm:text-base">
             {showPastRallies 
               ? 'Vaadake hiljem uuesti' 
               : 'Uued rallid lisatakse peagi'}
           </p>
         </div>
       </div>
     ) : (
       /* Rally cards - directly, no wrapper div */
       limitedRallies.map((rally, index) => {
         const registration = getRegistrationInfo(rally.id)
         const isUserRegistered = !!registration
         const currentStatus = getRallyStatus(rally)
         const canRegister = canRegisterToRally(rally)
         
         return (
           <div
             key={rally.id}
             className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.2)] mt-3 sm:mt-4 first:mt-6"
             style={{ animationDelay: `${index * 50}ms` }}
           >
             {/* Animated sweep effect on hover */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
             
             <div className="relative p-4 sm:p-6">
               {/* Mobile: Stack layout, Desktop: Original side-by-side layout */}
               <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                 {/* Rally Info Section */}
                 <div className="flex-1">
                   {/* Rally header with badges */}
                   <div className="flex flex-wrap items-center gap-2 mb-3">
                     <h3 className="text-base sm:text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wide">
                       {rally.name}
                     </h3>
                     
                     {/* Status Badge */}
                     <span className={`px-2 py-1 rounded-md text-xs font-medium font-['Orbitron'] uppercase ${getFuturisticStatusColor(getStatusColor(currentStatus))}`}>
                       {getStatusDisplayText(currentStatus)}
                     </span>
                     
                     {/* Registration Badge - if user is registered */}
                     {isUserRegistered && (
                       <span className="px-2 py-1 bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/30 rounded-md text-xs font-medium text-green-400 font-['Orbitron'] uppercase">
                         ✓ Registreeritud
                       </span>
                     )}
                   </div>
                   
                   {/* Rally meta info */}
                   <div className="space-y-2 text-xs sm:text-sm text-gray-400">
                     <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                       <span className="flex items-center gap-1">
                         <span className="text-red-400">🎮</span>
                         {rally.game_name}
                       </span>
                       <span className="flex items-center gap-1">
                         <span className="text-red-400">📅</span>
                         {formatDate(rally.competition_date)}
                       </span>
                       <span className="flex items-center gap-1">
                         <span className="text-red-400">⏰</span>
                         {formatTime(rally.competition_date)}
                       </span>
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                       {rally.total_events !== undefined && rally.total_events > 0 && (
                         <span className="flex items-center gap-1">
                           <span className="text-red-400">📍</span>
                           {rally.total_events} {rally.total_events === 1 ? 'sündmus' : 'sündmust'}
                         </span>
                       )}
                       
                       {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
                         <span className="flex items-center gap-1">
                           <span className="text-red-400">🛣️</span>
                           {rally.total_tracks} {rally.total_tracks === 1 ? 'rada' : 'rada'}
                         </span>
                       )}
                       
                       <span className="flex items-center gap-1">
                         <span className="text-red-400">👥</span>
                         {rally.registered_participants || 0}/{rally.max_participants || '∞'}
                       </span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Action buttons - Mobile: Full width, Desktop: Right-aligned column */}
                 <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
                   {!showPastRallies && (
                     <>
                       {isUserRegistered ? (
                         <button
                           onClick={() => registration && handleUnregister(registration.id)}
                           className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider hover:from-red-700 hover:to-red-800 transition-all shadow-[0_0_15px_rgba(255,0,64,0.5)] hover:shadow-[0_0_20px_rgba(255,0,64,0.7)]"
                         >
                           Tühista
                         </button>
                       ) : canRegister ? (
                         <button
                           onClick={() => handleRegister(rally)}
                           className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider hover:from-green-700 hover:to-green-800 transition-all shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                         >
                           Registreeri
                         </button>
                       ) : null}
                     </>
                   )}
                   
                   <button
                     onClick={() => handleViewDetails(rally)}
                     className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-900/50 border border-gray-700 text-gray-300 rounded-lg text-xs sm:text-sm font-['Orbitron'] uppercase tracking-wider hover:bg-gray-800/50 hover:border-red-500/50 hover:text-red-400 transition-all"
                   >
                     Vaata
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )
       })
     )}
     
     {/* Expand/Collapse button - also directly in main div */}
     {displayRallies.length > 5 && !isLoading && displayRallies.length > 0 && (
       <div className="flex justify-center pt-6 sm:pt-8">
         <button
           onClick={() => setIsExpanded(!isExpanded)}
           className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 text-gray-300 rounded-xl font-['Orbitron'] uppercase tracking-wider hover:border-red-500/50 hover:text-red-400 transition-all group text-xs sm:text-sm"
         >
           {isExpanded ? (
             <>
               <span>Näita vähem</span>
               <span className="ml-2 group-hover:rotate-180 transition-transform inline-block">▲</span>
             </>
           ) : (
             <>
               <span>Näita kõiki ({displayRallies.length})</span>
               <span className="ml-2 group-hover:translate-y-1 transition-transform inline-block">▼</span>
             </>
           )}
         </button>
       </div>
     )}
   </div>
 </div>
 
 {/* Rally Detail Modal */}
 {selectedRally && (
   <RallyDetailModal
     rally={selectedRally}
     onClose={() => setSelectedRally(null)}
   />
 )}
 </>
)
}