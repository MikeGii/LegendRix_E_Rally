// src/components/user/settings/PasswordTab.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface PasswordTabProps {
  onMessage?: (message: Message | null) => void
}

export function PasswordTab({ onMessage }: PasswordTabProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    if (!user) return

    // Check if passwords match
    if (data.newPassword !== data.confirmPassword) {
      onMessage?.({
        type: 'error',
        text: 'Paroolid ei ühti.'
      })
      return
    }

    setLoading(true)
    onMessage?.(null)

    try {
      console.log('🔄 Starting password update process for user:', user.id)

      // Step 1: Verify current password by attempting to sign in
      console.log('🔐 Verifying current password...')
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword
      })

      if (verifyError) {
        console.error('❌ Current password verification failed:', verifyError)
        onMessage?.({
          type: 'error',
          text: 'Praegune parool on vale. Palun kontrolli ja proovi uuesti.'
        })
        setLoading(false)
        return
      }

      console.log('✅ Current password verified successfully')

      // Step 2: Update password (this will automatically log out all sessions)
      console.log('🔄 Updating password...')
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (updateError) {
        console.error('❌ Password update error:', updateError)
        onMessage?.({
          type: 'error',
          text: 'Parooli uuendamine ebaõnnestus. Palun proovi uuesti.'
        })
        setLoading(false)
        return
      }

      console.log('✅ Password updated successfully')

      // Step 3: Show success message briefly before logout
      onMessage?.({
        type: 'success',
        text: 'Parool edukalt uuendatud! Sind logitakse automaatselt välja...'
      })

      // Step 4: Clear form fields immediately for security
      passwordForm.setValue('currentPassword', '')
      passwordForm.setValue('newPassword', '')
      passwordForm.setValue('confirmPassword', '')
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Step 5: Wait a moment to ensure password change is fully processed
      console.log('⏳ Waiting for password change to be fully processed...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 6: Force logout and redirect to landing page
      console.log('🚪 Logging out and redirecting to landing page...')
      
      // Sign out from Supabase (this ensures clean logout)
      await supabase.auth.signOut()
      
      // Redirect to landing page
      window.location.href = '/'

    } catch (error) {
      console.error('❌ Password update error:', error)
      onMessage?.({
        type: 'error',
        text: 'Parooli uuendamisel tekkis viga.'
      })
      setLoading(false)
      
      // Security cleanup even on error
      setTimeout(() => {
        passwordForm.setValue('currentPassword', '')
        passwordForm.setValue('newPassword', '')
        passwordForm.setValue('confirmPassword', '')
      }, 100)
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Parooli muutmine</h3>
      <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
        {/* Hidden username field for accessibility and security */}
        <input
          type="text"
          name="username"
          value={user?.email || ''}
          autoComplete="username"
          style={{ display: 'none' }}
          readOnly
        />

        {/* Current Password Field */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Praegune parool
          </label>
          <input
            {...passwordForm.register('currentPassword', { 
              required: 'Praegune parool on kohustuslik turvalisuse tagamiseks' 
            })}
            type="password"
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Sisesta oma praegune parool"
          />
          {passwordForm.formState.errors.currentPassword && (
            <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Praeguse parooli sisestamine on kohustuslik turvalisuse tagamiseks.
          </p>
        </div>

        {/* New Password Field */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Uus parool
          </label>
          <input
            {...passwordForm.register('newPassword', { 
              required: 'Uus parool on kohustuslik',
              minLength: {
                value: 8,
                message: 'Parool peab olema vähemalt 8 tähemärki pikk'
              }
            })}
            type="password"
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Sisesta oma uus parool"
          />
          {passwordForm.formState.errors.newPassword && (
            <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Kinnita uus parool
          </label>
          <input
            {...passwordForm.register('confirmPassword', { 
              required: 'Palun kinnita oma uut parooli'
            })}
            type="password"
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Kinnita oma uus parool"
          />
          {passwordForm.formState.errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Password Requirements Info */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Parooli nõuded:</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Vähemalt 8 tähemärki pikk</li>
            <li>• Soovitatav kasutada suurtähti (A-Z)</li>
            <li>• Soovitatav kasutada väiketähti (a-z)</li>
            <li>• Soovitatav kasutada numbreid (0-9)</li>
            <li>• Soovitatav kasutada erimärke (!@#$%^&*)</li>
          </ul>
        </div>

        {/* Security Notice */}
        <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-400 text-xs">⚠️</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-orange-300 mb-1">Oluline turvalisuse märkus</h4>
              <p className="text-xs text-orange-200 mb-2">
                Parooli muutmisel logitakse sind automaatselt kõikidest seadmetest välja.
              </p>
              <p className="text-xs text-orange-200">
                Pärast parooli muutmist suunatakse sind tagasi avalehele ja pead uuesti sisse logima.
              </p>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uuendamine...</span>
              </div>
            ) : (
              'Uuenda parooli'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}