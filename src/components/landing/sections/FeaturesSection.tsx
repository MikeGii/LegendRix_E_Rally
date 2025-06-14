// src/components/landing/sections/FeaturesSection.tsx
'use client'

interface FeaturesSectionProps {
  onOpenCompetitions: () => void
}

export function FeaturesSection({ onOpenCompetitions }: FeaturesSectionProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-20">
      {/* Võistlused - CLICKABLE */}
      <button
        onClick={onOpenCompetitions}
        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-10 text-center hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer group"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-2 ring-blue-500/20 group-hover:ring-blue-400/30 transition-all duration-300">
          <span className="text-4xl">🏁</span>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">Võistlused</h3>
        <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
          Osalege regulaarsetes turniirides ja meistrivõistlustes erinevates ralli mängudes.
        </p>
      </button>

      {/* Edetabel */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-10 text-center hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-2 ring-green-500/20">
          <span className="text-4xl">🏆</span>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">Edetabel</h3>
        <p className="text-slate-400 leading-relaxed">
          Vaadake oma positsiooni edetabelis ja jälgige parimaid sõitjaid.
        </p>
      </div>

      {/* Auhinnad */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-10 text-center hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-2 ring-purple-500/20">
          <span className="text-4xl">🏆</span>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">Auhinnad</h3>
        <p className="text-slate-400 leading-relaxed">
          Võitke põnevaid auhindu ja tunnustust oma saavutuste eest.
        </p>
      </div>
    </div>
  )
}