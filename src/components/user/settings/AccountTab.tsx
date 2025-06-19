// src/components/user/settings/AccountTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

interface AccountFormData {
  name: string
  player_name: string
  email: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface AccountTabProps {
  onMessage?: (message: Message | null) => void
}

export function AccountTab({ onMessage }: AccountTabProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Account form
  const accountForm = useForm<AccountFormData>({
    defaultValues: {
      name: '',
      player_name: '',
      email: ''
    }
  })

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      accountForm.reset({
        name: user.name || '',
        player_name: user.player_name || '',
        email: user.email || ''
      })
    }
  }, [user, accountForm])

  const handleAccountUpdate = async (data: AccountFormData) => {
    if (!user) return

    setLoading(true)
    onMessage?.(null)

    try {
      console.log('🔄 Updating account info:', {
        userId: user.id,
        name: data.name,
        player_name: data.player_name,
        email: data.email
      })

      // Update user profile in database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: data.name.trim(),
          player_name: data.player_name.trim(),
          email: data.email.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (dbError) {
        console.error('❌ Database update error:', dbError)
        onMessage?.({
          type: 'error',
          text: 'Konto andmete uuendamine ebaõnnestus. Palun proovi uuesti.'
        })
        return
      }

      // If email changed, update Supabase auth email
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email
        })

        if (authError) {
          console.error('❌ Auth email update error:', authError)
          onMessage?.({
            type: 'error',
            text: 'Konto uuendatud, kuid e-maili muutmine nõuab kinnitust. Kontrolli oma uut e-maili.'
          })
          return
        }
      }

      console.log('✅ Account updated successfully')
      onMessage?.({
        type: 'success',
        text: 'Konto informatsioon edukalt uuendatud!'
      })

    } catch (error) {
      console.error('❌ Account update error:', error)
      onMessage?.({
        type: 'error',
        text: 'Konto uuendamisel tekkis viga.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Kasutaja andmed</h3>
      <form onSubmit={accountForm.handleSubmit(handleAccountUpdate)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Täisnimi
          </label>
          <input
            {...accountForm.register('name', { required: 'Nimi on kohustuslik' })}
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Sisesta oma täisnimi"
          />
          {accountForm.formState.errors.name && (
            <p className="text-red-400 text-sm mt-1">{accountForm.formState.errors.name.message}</p>
          )}
        </div>

        {/* Player Name Field */}
        <div>
          <label htmlFor="player_name" className="block text-sm font-medium text-slate-300 mb-2">
            Mängijanimi
          </label>
          <input
            {...accountForm.register('player_name', { required: 'Mängijanimi on kohustuslik' })}
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Sisesta oma mängijanimi"
          />
          {accountForm.formState.errors.player_name && (
            <p className="text-red-400 text-sm mt-1">{accountForm.formState.errors.player_name.message}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            See nimi kuvatakse avalikult ralli tulemustes ja tabelites.
          </p>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            E-mail
          </label>
          <input
            {...accountForm.register('email', { 
              required: 'E-mail on kohustuslik',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Palun sisesta kehtiv e-maili aadress'
              }
            })}
            type="email"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Sisesta oma e-maili aadress"
          />
          {accountForm.formState.errors.email && (
            <p className="text-red-400 text-sm mt-1">{accountForm.formState.errors.email.message}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            E-maili muutmisel saadetakse kinnituskiri.
          </p>
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Salvestamine...</span>
              </div>
            ) : (
              'Salvesta muudatused'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}