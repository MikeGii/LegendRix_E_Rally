// src/components/user/FeaturedRalliesSection.tsx - Estonian Translation
import { RealRally } from '@/hooks/useOptimizedRallies'
import { RallyDisplay } from '@/components/rally/RallyDisplay'

interface FeaturedRalliesSectionProps {
  rallies: RealRally[]
  isLoading: boolean
  canAccessRallies: boolean
}

export function FeaturedRalliesSection({ rallies, isLoading, canAccessRallies }: FeaturedRalliesSectionProps) {
  if (!canAccessRallies || rallies.length === 0) return null

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <span>⭐</span>
          <span>Esiletõstetud rallid</span>
        </h2>
        
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-3 py-1">
          <span className="text-yellow-300 text-sm font-medium">Premium üritused</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin esiletõstetud rallisid...</p>
          </div>
        </div>
      ) : (
        <RallyDisplay 
          rallies={rallies}
          showRegistration={true}
          onRegister={(rally) => {
            console.log('Register for rally:', rally.name)
            alert(`Registreerimine "${rally.name}" jaoks tuleb varsti!`)
          }}
        />
      )}
    </div>
  )
}