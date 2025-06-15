// src/components/edetabel/ApprovedRallyCard.tsx
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface ApprovedRallyCardProps {
  rally: ApprovedRally
  onClick: () => void
}

export function ApprovedRallyCard({ rally, onClick }: ApprovedRallyCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatApprovedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
            {rally.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              🎮 {rally.game_name}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {rally.game_type_name}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            ✅ Kinnitatud
          </span>
          <span className="text-xs text-slate-500">
            {formatApprovedDate(rally.approved_at)}
          </span>
        </div>
      </div>

      {/* Description */}
      {rally.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {rally.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">{rally.total_participants}</div>
          <div className="text-xs text-slate-400">Osalejaid</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-green-400">{rally.participants_with_results}</div>
          <div className="text-xs text-slate-400">Tulemused</div>
        </div>
      </div>

      {/* Competition Date */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <span>📅</span>
        <span>{formatDate(rally.competition_date)}</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Tulemuste täielikkus</span>
          <span className="text-white font-medium">
            {rally.total_participants > 0 
              ? Math.round((rally.participants_with_results / rally.total_participants) * 100)
              : 0
            }%
          </span>
        </div>
        
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ 
              width: `${rally.total_participants > 0 
                ? (rally.participants_with_results / rally.total_participants) * 100
                : 0
              }%` 
            }}
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Vaata detailseid tulemusi</span>
          <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
            →
          </span>
        </div>
      </div>
    </div>
  )
}