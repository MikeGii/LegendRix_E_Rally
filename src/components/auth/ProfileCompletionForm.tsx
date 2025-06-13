// src/components/auth/ProfileCompletionForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'

interface ProfileCompletionData {
  name: string
  playerName: string
}

interface ProfileCompletionFormProps {
  user: any
  onComplete: () => void
}

export function ProfileCompletionForm({ user, onComplete }: ProfileCompletionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileCompletionData>({
    defaultValues: {
      name: user?.name || '',
      playerName: ''
    }
  })

  const onSubmit = async (data: ProfileCompletionData) => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      console.log('🔄 Updating user profile completion:', {
        userId: user.id,
        name: data.name,
        playerName: data.playerName
      })

      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name.trim(),
          player_name: data.playerName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ Profile update error:', error)
        setMessage({
          type: 'error',
          text: 'Failed to update profile. Please try again.'
        })
        setIsLoading(false)
        return
      }

      console.log('✅ Profile updated successfully')
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      })

      // Wait a moment to show success message, then complete
      setTimeout(() => {
        onComplete()
      }, 1500)
      
    } catch (error) {
      console.error('❌ Profile completion error:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎮</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Täienda oma profiili
          </h1>
          <p className="text-slate-300 text-sm">
            Palun täienda oma konto andmeid, et jätkata
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-900/50 border-green-700 text-green-300' 
                  : 'bg-red-900/50 border-red-700 text-red-300'
              }`}>
                <p className="text-sm text-center font-medium">{message.text}</p>
              </div>
            )}

            {/* Account Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nimi *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Sinu täisnimi"
                disabled={isLoading}
                autoComplete="name"
                {...register('name', {
                  required: 'Nimi on kohustuslik',
                  minLength: {
                    value: 2,
                    message: 'Nimi peab olema vähemalt 2 tähemärki'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Nimi ei tohi olla pikem kui 100 tähemärki'
                  }
                })}
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Player Name Field */}
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-slate-300 mb-2">
                Mängija nimi *
              </label>
              <input
                id="playerName"
                type="text"
                placeholder="Steam, Xbox, PS mängija nimi"
                disabled={isLoading}
                autoComplete="username"
                {...register('playerName', {
                  required: 'Mängija nimi on kohustuslik',
                  minLength: {
                    value: 3,
                    message: 'Mängija nimi peab olema vähemalt 3 tähemärki'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Mängija nimi ei tohi olla pikem kui 100 tähemärki'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_\-\.]+$/,
                    message: 'Mängija nimi võib sisaldada ainult tähti, numbreid, alakriipse, kriipse ja punkte'
                  }
                })}
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.playerName && (
                <p className="mt-2 text-sm text-red-400">{errors.playerName.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Sisesta oma mänguplatvormi kasutajanimi (Steam, Xbox, PlayStation, jne.)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 text-lg">ℹ️</span>
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Miks me seda vajame?</p>
                  <p className="text-xs leading-relaxed">
                    Mängija nimi on vajalik võistlustel osalemiseks ja tulemuste jälgimiseks. 
                    Palun kasuta sama nime, mida kasutad oma mänguplatvormi kontol.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uuendan...</span>
                </>
              ) : (
                <>
                  <span>Salvesta andmed</span>
                  <span>💾</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-xs">
            See vorm kuvatakse ainult üks kord olemasolevate kasutajate jaoks
          </p>
        </div>
      </div>
    </div>
  )
}