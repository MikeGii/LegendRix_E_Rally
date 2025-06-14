// src/components/rally/RallyRegistrationsTable.tsx - CLEANED VERSION
import { RallyRegistration } from '@/types'

interface RallyRegistrationsTableProps {
  registrations: RallyRegistration[]
}

export function RallyRegistrationsTable({ registrations }: RallyRegistrationsTableProps) {
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

  // Group registrations by class
  const registrationsByClass = registrations.reduce((acc, registration) => {
    const className = registration.class_name || 'Määramata klass'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(registration)
    return acc
  }, {} as Record<string, RallyRegistration[]>)

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-slate-500">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Registreeringuid pole</h3>
        <p className="text-slate-400">Selle ralli jaoks pole veel keegi registreerunud</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(registrationsByClass).map(([className, typedRegistrations]) => {
        return (
          <div key={className} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span>🏁</span>
                <span>{className}</span>
                <span className="text-sm font-normal text-slate-400">
                  ({typedRegistrations.length} registreeringut)
                </span>
              </h4>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-600/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Mängija nimi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Staatus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Registreeritud
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600/30">
                    {typedRegistrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-slate-600/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 text-sm font-medium">
                                {(registration.user_player_name || registration.user_name || 'Unknown').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                🎮 {registration.user_player_name || registration.user_name || 'Mängija nimi määramata'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                            {registration.status === 'registered' && 'Registreeritud'}
                            {registration.status === 'confirmed' && 'Kinnitatud'}
                            {registration.status === 'cancelled' && 'Tühistatud'}
                            {registration.status === 'disqualified' && 'Diskvalifitseeritud'}
                            {registration.status === 'completed' && 'Lõpetatud'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {new Date(registration.registration_date).toLocaleDateString('et-EE', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}