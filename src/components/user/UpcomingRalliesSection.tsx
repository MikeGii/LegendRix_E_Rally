// src/components/user/UpcomingRalliesSection.tsx
import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { RallyDisplay } from '@/components/rally/RallyDisplay'

interface UpcomingRalliesSectionProps {
  rallies: TransformedRally[]
  isLoading: boolean
  canAccessRallies: boolean
}

export function UpcomingRalliesSection({ rallies, isLoading, canAccessRallies }: UpcomingRalliesSectionProps) {
  if (!canAccessRallies) return null

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <span>🏁</span>
          <span>Upcoming Rallies</span>
        </h2>
        
        {rallies.length > 0 && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
            View All Rallies
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading upcoming rallies...</p>
          </div>
        </div>
      ) : (
        <RallyDisplay 
          rallies={rallies}
          showLimit={3}
        />
      )}
    </div>
  )
}
