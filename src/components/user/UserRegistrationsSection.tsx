// src/components/user/UserRegistrationsSection.tsx - Estonian with Date Filtering
import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
  isLoading: boolean
}

export function UserRegistrationsSection({ registrations, isLoading }: UserRegistrationsSectionProps) {
  if (registrations.length === 0) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'disqualified': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Registreeritud'
      case 'confirmed': return 'Kinnitatud'
      case 'cancelled': return 'Tühistatud'
      case 'completed': return 'Lõpetatud'
      case 'disqualified': return 'Diskvalifitseeritud'
      default: return status.toUpperCase()
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'refunded': return 'text-red-400'
      case 'waived': return 'text-blue-400'
      default: return 'text-slate-400'
    }
  }

  const getPaymentText = (status: string) => {
    switch (status) {
      case 'paid': return 'Makstud'
      case 'pending': return 'Ootel'
      case 'refunded': return 'Tagastatud'
      case 'waived': return 'Loobatud'
      default: return status
    }
  }

  const formatEstonianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <span>📋</span>
          <span>Minu rallidele registreerimised ({registrations.length})</span>
        </h2>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-1">
          <span className="text-blue-300 text-sm font-medium">Aktiivsed</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin registreerimisi...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div key={registration.id} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 hover:border-slate-600/50 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{registration.rally_name}</h3>
                  <p className="text-slate-400 text-sm">Klass: {registration.class_name}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                    {getStatusText(registration.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Registreeritud:</span>
                  <p className="text-slate-300">
                    {formatEstonianDate(registration.registration_date)}
                  </p>
                </div>
              </div>

              {registration.notes && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-slate-300 text-sm">{registration.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}