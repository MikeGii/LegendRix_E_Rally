// src/components/admin/AdminQuickActions.tsx - WITH CHAMPIONSHIPS ADDED
export function AdminQuickActions() {
  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Kiirtegevused</h2>
        <p className="text-slate-400">Ligi pääs peamistele haldus funktsioonidele</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First Row - Primary Actions */}
        <button
          onClick={() => handleNavigation('/user-management')}
          className="group p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Kasutajate haldamine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda kasutajakontosid ja õigusi
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleNavigation('/game-management')}
          className="group p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 hover:border-green-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🎮</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Mängude haldamine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda mänge, riike ja radasid
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleNavigation('/rally-management')}
          className="group p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🏁</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Ralli haldamine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Loo ja halda ralli sündmusi
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        {/* Second Row - NEW CHAMPIONSHIPS + Additional Actions */}
        <button
          onClick={() => handleNavigation('/championships')}
          className="group p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-xl border border-yellow-500/30 hover:border-yellow-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Meistrivõistlused
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda meistrivõistlusi ja tulemusi
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleNavigation('/results')}
          className="group p-6 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/30 hover:border-red-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Tulemuste haldamine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Sisesta ja halda ralli tulemusi
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleNavigation('/sponsors')}
          className="group p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Sponsorite haldamine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda sponsoreid ja toetajaid
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}