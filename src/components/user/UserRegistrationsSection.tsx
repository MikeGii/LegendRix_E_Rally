// src/components/user/UserRegistrationsSection.tsx - CLEANED VERSION
import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
}

export function UserRegistrationsSection({ registrations }: UserRegistrationsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'disqualified':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered':
        return 'Registreeritud'
      case 'confirmed':
        return 'Kinnitatud'
      case 'cancelled':
        return 'Tühistatud'
      case 'disqualified':
        return 'Diskvalifitseeritud'
      case 'completed':
        return 'Lõpetatud'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-slate-500">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Registreeringuid pole</h3>
        <p className="text-slate-400">Sa pole veel ühelegi rallile registreerunud</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Minu registreeringud</h2>
          <span className="text-blue-300 text-sm font-medium">{registrations.length} aktiivset</span>
        </div>
      </div>

      <div className="space-y-4">
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="bg-slate-700/30 rounded-xl border border-slate-600/50 p-6 hover:bg-slate-700/40 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Rally Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-lg">🏁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{registration.rally_name}</h3>
                    <p className="text-sm text-slate-400">{registration.class_name}</p>
                  </div>
                </div>

                {/* Registration Details - CLEANED (removed notes, car_number, team_name) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Registreeritud:</span>
                    <p className="text-slate-300 font-medium">
                      {new Date(registration.registration_date).toLocaleDateString('et-EE', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {registration.rally_competition_date && (
                    <div>
                      <span className="text-slate-400">Võistluse kuupäev:</span>
                      <p className="text-slate-300 font-medium">
                        {new Date(registration.rally_competition_date).toLocaleDateString('et-EE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400">Staatus:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rally Status Indicator */}
              {registration.rally_status && (
                <div className="ml-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium border
                    ${registration.rally_status === 'upcoming' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : registration.rally_status === 'registration_open'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : registration.rally_status === 'active'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : registration.rally_status === 'completed'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }
                  `}>
                    {registration.rally_status === 'upcoming' && 'Eelseisev'}
                    {registration.rally_status === 'registration_open' && 'Registreerimine avatud'}
                    {registration.rally_status === 'registration_closed' && 'Registreerimine suletud'}
                    {registration.rally_status === 'active' && 'Käimas'}
                    {registration.rally_status === 'completed' && 'Lõppenud'}
                    {registration.rally_status === 'cancelled' && 'Tühistatud'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}