// src/components/landing/edetabel/TeamChampionshipsListView.tsx
'use client'

interface TeamChampionship {
  id: string
  name: string
  season_year: number
  game_name?: string
  game_type_name?: string
  total_teams: number
  is_active: boolean
  status: 'ongoing' | 'completed'
}

interface TeamChampionshipsListViewProps {
  teamChampionships: TeamChampionship[]
  isLoading: boolean
  onTeamChampionshipClick: (championship: TeamChampionship) => void
}

export function TeamChampionshipsListView({ 
  teamChampionships, 
  isLoading, 
  onTeamChampionshipClick 
}: TeamChampionshipsListViewProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">
            LAADIN TIIMIDE KOONDARVESTUSI...
          </p>
        </div>
      </div>
    )
  }

  if (teamChampionships.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏆👥</span>
        </div>
        <h3 className="text-lg font-['Orbitron'] uppercase text-gray-300 mb-2">
          Tiimide koondarvestusi ei leitud
        </h3>
        <p className="text-gray-500 text-sm">
          Hetkel pole ühtegi avalikuks märgitud tiimide meistrivõistlust
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {teamChampionships.map((championship, index) => (
        <div
          key={championship.id}
          onClick={() => onTeamChampionshipClick(championship)}
          className={`
            relative group cursor-pointer
            bg-gradient-to-br from-gray-900/90 to-black
            border border-gray-800 hover:border-red-500/50
            rounded-xl overflow-hidden
            transition-all duration-300
            hover:shadow-[0_0_30px_rgba(255,0,64,0.2)]
            hover:transform hover:scale-[1.01]
            ${index % 2 === 0 ? 'animate-fadeInLeft' : 'animate-fadeInRight'}
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`
              px-3 py-1 rounded-full text-xs font-['Orbitron'] uppercase tracking-wider
              ${championship.status === 'completed' 
                ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
              }
            `}>
              {championship.status === 'completed' ? 'Lõppenud' : 'Käimas'}
            </div>
          </div>

          <div className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Championship Name */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {championship.name}
                </h3>
                
                {/* Championship Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-500">📅</span>
                    <span>Hooaeg {championship.season_year}</span>
                  </div>
                  
                  {championship.game_name && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-gray-500">🎮</span>
                      <span>{championship.game_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-500">👥</span>
                    <span>{championship.total_teams} tiimi</span>
                  </div>
                </div>
              </div>

              {/* View Icon */}
              <div className="ml-4 text-2xl text-gray-600 group-hover:text-red-400 transition-colors">
                →
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}