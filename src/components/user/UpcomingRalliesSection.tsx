import { RealRally } from '@/hooks/useOptimizedRallies'
import { EnhancedRallyDisplay } from '@/components/rally/EnhancedRallyDisplay'

interface UpcomingRalliesSectionProps {
  rallies: RealRally[]
  isLoading: boolean
  canAccessRallies: boolean
  onRegister?: (rally: RealRally, classId: string) => void
}

export function UpcomingRalliesSection({ rallies, isLoading, canAccessRallies, onRegister }: UpcomingRalliesSectionProps) {
  if (!canAccessRallies) return null

  // Transform RealRally to TransformedRally format
  const transformedRallies = rallies.map(rally => {
    const now = new Date()
    const competitionDate = new Date(rally.competition_date)
    const registrationDeadline = new Date(rally.registration_deadline)
    
    const daysUntilEvent = Math.ceil((competitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const daysUntilRegistrationDeadline = Math.ceil((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    let registrationStatus: 'open' | 'closed' | 'full' | 'expired' = 'closed'
    let canRegister = false

    if (rally.status === 'registration_open' && daysUntilRegistrationDeadline > 0) {
      if (rally.max_participants && rally.registered_participants && rally.registered_participants >= rally.max_participants) {
        registrationStatus = 'full'
      } else {
        registrationStatus = 'open'
        canRegister = true
      }
    } else if (daysUntilRegistrationDeadline <= 0) {
      registrationStatus = 'expired'
    }

    return {
      ...rally,
      canRegister,
      registrationStatus,
      daysUntilEvent,
      daysUntilRegistrationDeadline,
      rally_events: [],
      available_classes: [],
      user_registration: null
    }
  })

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <span>🏁</span>
          <span>Upcoming Rallies</span>
        </h2>
        
        {rallies.length > 0 && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
            View All Rallies
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading upcoming rallies...</p>
          </div>
        </div>
      ) : (
        <EnhancedRallyDisplay 
          rallies={transformedRallies}
          showLimit={3}
          showRegistration={true}
          onRegister={onRegister}
        />
      )}
    </div>
  )
}