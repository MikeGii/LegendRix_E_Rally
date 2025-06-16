// src/components/edetabel/ApprovedRallyCard.tsx - REDESIGNED as compact row
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface ApprovedRallyCardProps {
  rally: ApprovedRally
  onClick: () => void
}

export function ApprovedRallyCard({ rally, onClick }: ApprovedRallyCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
      className="group bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.01]"
    >
      {/* Compact Row Layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - Rally Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
              {rally.name}
            </h3>
            
            {/* Game and Type Badges */}
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium">
                🎮 {rally.game_name}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                {rally.game_type_name}
              </span>
            </div>
          </div>

          {/* Competition Date */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>📅</span>
            <span>{formatDate(rally.competition_date)}</span>
          </div>
        </div>

        {/* Middle - Participants Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{rally.total_participants}</div>
            <div className="text-xs text-slate-400">Osalejat</div>
          </div>
        
        </div>

        {/* Right Side - Status and Action */}
        <div className="flex flex-col items-end gap-2">
          {/* Status Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            ✅ Kinnitatud
          </span>
          
          {/* Approved Date */}
          <span className="text-xs text-slate-500">
            {formatApprovedDate(rally.approved_at)}
          </span>
          
          {/* Action Arrow */}
          <span className="text-blue-400 group-hover:text-blue-300 transition-colors text-lg">
            →
          </span>
        </div>
      </div>
    </div>
  )
}