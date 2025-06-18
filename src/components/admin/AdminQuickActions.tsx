// src/components/admin/AdminQuickActions.tsx - EXPANDED WITH ALL ADMIN PAGES
export function AdminQuickActions() {
  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Kiirtegevused</h2>
        <p className="text-slate-400">Ligipääs kõikidele halduse funktsioonidele</p>
      </div>

      {/* 3-Row Grid Layout for All Admin Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* First Row - Core Management */}
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
                Kasutajate Haldamine
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
                Mängude Haldamine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda mänge, tüüpe ja radasid
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
                Rallide Haldamine
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

        {/* Second Row - Content & Events Management */}
        <button
          onClick={() => handleNavigation('/news-management')}
          className="group p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 hover:border-orange-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">📰</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Uudiste Manageerimine
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda uudiseid ja avalikke teateid
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
                Halda hooaegasid ja meistritiitleid
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
          className="group p-6 bg-gradient-to-br from-teal-500/20 to-teal-600/20 backdrop-blur-xl border border-teal-500/30 hover:border-teal-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Tulemused
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda võistluste tulemusi ja edetabeleid  
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        {/* Third Row - Business & External */}
        <button
          onClick={() => handleNavigation('/sponsors')}
          className="group p-6 bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-xl border border-pink-500/30 hover:border-pink-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Sponsorid
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Halda partnereid ja sponsoreid
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <span className="text-xs text-white/70">→</span>
            </div>
          </div>
        </button>

        {/* Quick Settings Shortcuts */}
        <button
          onClick={() => handleNavigation('/user-dashboard')}
          className="group p-6 bg-gradient-to-br from-slate-500/20 to-slate-600/20 backdrop-blur-xl border border-slate-500/30 hover:border-slate-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🏠</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Kasutaja Vaade
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Lülitu kasutaja töölauale
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
          onClick={() => handleNavigation('/')}
          className="group p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🌐</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                Avalik Leht
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Mine avalikule kodulehele
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