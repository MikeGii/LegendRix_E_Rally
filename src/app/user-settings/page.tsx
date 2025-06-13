// src/app/user-settings/page.tsx - New settings page
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserSettings } from '@/components/user/UserSettings'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

export default function UserSettingsPage() {
  console.log('🔧 UserSettingsPage - Component loaded')
  
  const { user } = useAuth()

  const handleUpdateProfile = async (data: any) => {
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    try {
      console.log('🔄 Updating user profile:', data)
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          name: data.name,
          player_name: data.player_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile update error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Profile updated successfully:', updatedUser)
      return { success: true }
      
    } catch (error: any) {
      console.error('❌ Profile update exception:', error)
      return { success: false, error: error.message || 'Update failed' }
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserSettings user={user} onUpdateProfile={handleUpdateProfile} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}