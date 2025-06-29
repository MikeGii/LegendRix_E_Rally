// src/hooks/useProfileCompletion.ts - Fixed with type assertions
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

export function useProfileCompletion() {
  const { user, loading } = useAuth()
  const [needsCompletion, setNeedsCompletion] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [checkComplete, setCheckComplete] = useState(false)

  useEffect(() => {
    if (!loading && user && !checkComplete) {
      // Check if user needs to complete profile - using type assertion
      const playerName = (user as any).player_name
      const needsUpdate = !playerName || playerName.trim() === ''
      setNeedsCompletion(needsUpdate)
      setCheckComplete(true)
      
      console.log('🔍 Profile completion check:', {
        userId: user.id,
        needsUpdate,
        currentPlayerName: playerName
      })
    }
  }, [user, loading, checkComplete])

  const updateProfile = async (name: string, playerName: string) => {
    if (!user) {
      throw new Error('No user found')
    }

    setIsUpdating(true)
    
    try {
      console.log('🔄 Updating user profile:', { userId: user.id, name, playerName })
      
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          player_name: playerName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      console.log('✅ Profile updated successfully')
      setNeedsCompletion(false)
      
      // Don't reload the page - the auth state will update naturally
      // This prevents the page refresh
      
      return { success: true }
      
    } catch (error: any) {
      console.error('❌ Profile update failed:', error)
      return { success: false, error: error.message }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    needsCompletion,
    isUpdating,
    updateProfile,
    user
  }
}