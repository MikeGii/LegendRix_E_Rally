// src/components/teams/TeamHeaderSection.tsx
'use client'

import { useUserTeamStatus } from '@/hooks/useTeams'

export function TeamHeaderSection() {
  const { data: teamStatus, isLoading } = useUserTeamStatus()

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin tiimi andmeid...</p>
          </div>
        </div>
      </div>
    )
  }

  // User has no team
  if (!teamStatus?.hasTeam) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Sa ei ole veel seotud ühegi tiimiga
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Liitu mõne olemasoleva tiimiga või loo oma tiim, et hakata võistlema koos teistega.
          </p>
        </div>
      </div>
    )
  }

  // User has a team
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
      <div className="text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Sa kuulud tiimi
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Siin saad varsti näha oma tiimi detaile ja statistikat.
        </p>
      </div>
    </div>
  )
}