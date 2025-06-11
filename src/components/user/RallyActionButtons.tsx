// src/components/user/RallyActionButtons.tsx
interface RallyActionButtonsProps {
  canAccessRallies: boolean
}

export function RallyActionButtons({ canAccessRallies }: RallyActionButtonsProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h2 className="text-2xl font-semibold text-white mb-8 text-center">Rally Dashboard</h2>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        
        {/* Register for Rally Button */}
        <button 
          disabled={!canAccessRallies}
          onClick={() => canAccessRallies && (window.location.href = '/registration')}
          className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${
            canAccessRallies 
              ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-lg hover:shadow-green-500/25 hover:scale-105 cursor-pointer' 
              : 'bg-slate-700/50 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="relative z-10 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              canAccessRallies ? 'bg-white/20' : 'bg-slate-600/30'
            }`}>
              <span className="text-3xl">🏁</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Register for Rally</h3>
            <p className={`text-sm ${canAccessRallies ? 'text-green-100' : 'text-slate-400'}`}>
              {canAccessRallies 
                ? 'Join upcoming championships and compete with drivers worldwide'
                : 'Complete account verification to access rally registration'
              }
            </p>
          </div>
          
          {/* Animated background effect for enabled button */}
          {canAccessRallies && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
        </button>

        {/* Results Table Button */}
        <button 
          disabled={!canAccessRallies}
          className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 ${
            canAccessRallies 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 hover:scale-105 cursor-pointer' 
              : 'bg-slate-700/50 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="relative z-10 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              canAccessRallies ? 'bg-white/20' : 'bg-slate-600/30'
            }`}>
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Results & Stats</h3>
            <p className={`text-sm ${canAccessRallies ? 'text-blue-100' : 'text-slate-400'}`}>
              {canAccessRallies 
                ? 'View championship results, rankings, and your performance history'
                : 'Results and statistics will be available after account approval'
              }
            </p>
          </div>
          
          {/* Animated background effect for enabled button */}
          {canAccessRallies && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
        </button>
      </div>
    </div>
  )
}