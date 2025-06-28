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
      <h3 className="text-2xl font-black text-white mb-8 font-['Orbitron'] uppercase tracking-wider">
        <span className="text-purple-500">◈</span> Kasutaja andmed
      </h3>
      
      <form onSubmit={accountForm.handleSubmit(handleAccountUpdate)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-red-500">⬢</span> Täisnimi
          </label>
          <input
            {...accountForm.register('name', { required: 'Nimi on kohustuslik' })}
            type="text"
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 font-medium"
            placeholder="Sisesta oma täisnimi"
          />
          {accountForm.formState.errors.name && (
            <p className="text-red-400 text-sm mt-2 font-['Orbitron']">{accountForm.formState.errors.name.message}</p>
          )}
        </div>

        {/* Player Name Field */}
        <div>
          <label htmlFor="player_name" className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-purple-500">◉</span> Mängijanimi
          </label>
          <input
            {...accountForm.register('player_name', { required: 'Mängijanimi on kohustuslik' })}
            type="text"
            className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-medium"
            placeholder="Sisesta oma mängijanimi"
          />
          {accountForm.formState.errors.player_name && (
            <p className="text-red-400 text-sm mt-2 font-['Orbitron']">{accountForm.formState.errors.player_name.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2 font-['Orbitron'] uppercase tracking-wider">
            See nimi kuvatakse avalikult ralli tulemustes ja tabelites
          </p>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-orange-500">◆</span> E-mail
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
            className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-medium"
            placeholder="Sisesta oma e-maili aadress"
          />
          {accountForm.formState.errors.email && (
            <p className="text-red-400 text-sm mt-2 font-['Orbitron']">{accountForm.formState.errors.email.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2 font-['Orbitron'] uppercase tracking-wider">
            E-maili muutmisel saadetakse kinnituskiri
          </p>
        </div>

        {/* Info Card */}
        <div className="tech-border rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-black/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl text-purple-500">ℹ️</span>
            <div>
              <h4 className="font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wider">
                Kasutajaandmete muutmine
              </h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Nime muudatused rakenduvad kohe</li>
                <li>• Mängijanime muudatused mõjutavad kõiki tulemusi</li>
                <li>• E-maili muutmisel pead kinnitama uue aadressi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 futuristic-btn futuristic-btn-secondary rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Salvestamine...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <span>◈</span>
                <span>Salvesta muudatused</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}