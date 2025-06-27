// src/components/results/components/PublicToggle.tsx
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Globe, Lock } from 'lucide-react'

interface PublicToggleProps {
  rallyId: string
  initialIsPublic: boolean
}

export function PublicToggle({ rallyId, initialIsPublic }: PublicToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const queryClient = useQueryClient()

  const togglePublicMutation = useMutation({
    mutationFn: async (newIsPublic: boolean) => {
      const { error } = await supabase
        .from('rally_results_status')
        .update({ 
          is_public: newIsPublic,
          updated_at: new Date().toISOString()
        })
        .eq('rally_id', rallyId)

      if (error) throw error
      return newIsPublic
    },
    onSuccess: (newIsPublic) => {
      setIsPublic(newIsPublic)
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rally-results-status', rallyId] })
      queryClient.invalidateQueries({ queryKey: ['rally-is-public', rallyId] })
      queryClient.invalidateQueries({ queryKey: ['public-approved-rallies'] })
    },
    onError: (error) => {
      console.error('Error toggling public status:', error)
      alert('Viga avaliku staatuse muutmisel. Palun proovige uuesti.')
    }
  })

  const handleToggle = () => {
    const newIsPublic = !isPublic
    togglePublicMutation.mutate(newIsPublic)
  }

  return (
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {isPublic ? (
              <Globe className="text-purple-400" size={20} />
            ) : (
              <Lock className="text-purple-400" size={20} />
            )}
          </div>
          <div>
            <p className="text-purple-400 font-medium">Tulemused pealehel</p>
            <p className="text-purple-300/80 text-sm">
              {isPublic 
                ? 'Tulemused on avalikult nähtavad edetabelis'
                : 'Tulemused on peidetud avalikust edetabelist'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={togglePublicMutation.isPending}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isPublic ? 'bg-purple-600' : 'bg-slate-600'}
            ${togglePublicMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="sr-only">Toggle public visibility</span>
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isPublic ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  )
}