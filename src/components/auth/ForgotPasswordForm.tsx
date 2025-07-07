// src/components/auth/ForgotPasswordForm.tsx - Futuristic theme with enhanced effects
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'

// Futuristic SVG icons
const Mail = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
)

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
)

interface ForgotPasswordFormData {
  email: string
}

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: ''
    }
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('🔄 Sending password reset request to:', data.email)

      // Use our custom API endpoint
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Password reset request failed:', result.error)
        
        if (response.status === 429) {
          setError('Parooli lähtestamise link on juba saadetud. Palun kontrolli oma e-maili või oota 1 tund.')
        } else {
          setError(result.error || 'E-maili saatmine ebaõnnestus. Palun proovi uuesti.')
        }
        return
      }

      console.log('✅ Password reset request sent successfully')
      setSuccess(true)
      
      // Clear form
      form.reset()

    } catch (err: any) {
      console.error('❌ Password reset exception:', err)
      setError('Ootamatu viga. Palun proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  // Success state with futuristic design
  if (success) {
    return (
      <div className="space-y-6">
        {/* Success Icon with pulsing effect */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-3 uppercase tracking-wider">
            E-mail saadetud!
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Saatsime parooli lähtestamise lingi sinu e-mailile. 
            Kontrolli oma postkasti ja järgi juhiseid parooli muutmiseks.
          </p>
        </div>

        {/* Info Box with futuristic styling */}
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"></div>
          
          {/* Border effect */}
          <div className="absolute inset-0 rounded-xl border border-blue-500/30"></div>
          
          <div className="relative p-4">
            <div className="flex items-start space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur animate-pulse"></div>
                <div className="relative w-10 h-10 bg-blue-600/50 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-300" />
                </div>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-semibold mb-1">
                  Ei leia e-maili?
                </p>
                <p className="text-xs text-blue-200/80">
                  Kontrolli oma rämpsposti kausta. Link kehtib 24 tundi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button with futuristic design */}
        <button
          onClick={onBackToLogin}
          className="relative w-full group overflow-hidden rounded-xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 transition-all duration-300 group-hover:from-gray-700 group-hover:to-gray-600"></div>
          
          {/* Border effect */}
          <div className="absolute inset-0 rounded-xl border border-gray-600/50 group-hover:border-gray-500/50 transition-colors duration-300"></div>
          
          {/* Content */}
          <div className="relative px-4 py-3 flex items-center justify-center space-x-2">
            <ArrowLeft className="w-5 h-5 text-white" />
            <span className="font-['Orbitron'] font-bold text-white tracking-wider">TAGASI SISSELOGIMISE JUURDE</span>
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </div>
    )
  }

  // Form state with futuristic design
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">

        <p className="text-gray-400 text-sm">
          Sisesta oma e-maili aadress ja saadame sulle parooli lähtestamise lingi.
        </p>
      </div>

      {/* Error Message with futuristic design */}
      {error && (
        <div className="relative p-4 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 animate-pulse"></div>
          
          {/* Border effect */}
          <div className="absolute inset-0 rounded-xl border border-red-500/50"></div>
          
          <div className="relative flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Email Field with futuristic styling */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
          <input
            {...form.register('email', {
              required: 'E-maili aadress on kohustuslik',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Palun sisesta kehtiv e-maili aadress'
              }
            })}
            type="email"
            autoComplete="email"
            disabled={loading}
            placeholder="Sisesta oma e-maili aadress"
            className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {form.formState.errors.email && (
            <p className="text-red-400 text-sm mt-2">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button with futuristic design */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full group overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:scale-105"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-xl">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="relative px-4 py-3 flex items-center justify-center space-x-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="font-['Orbitron'] font-bold text-white tracking-wider">SAADAN...</span>
              </>
            ) : (
              <span className="font-['Orbitron'] font-bold text-white tracking-wider">SAADA LÄHTESTAMISE LINK</span>
            )}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </form>

      {/* Back to Login with enhanced styling */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          disabled={loading}
          className="relative text-gray-400 hover:text-red-400 text-sm transition-all duration-300 disabled:opacity-50 group"
        >
          <span className="relative z-10">Tagasi sisselogimise juurde</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
        </button>
      </div>

      {/* Security Note with futuristic styling */}
      <div className="relative mt-6 pt-6">
        {/* Top border with gradient */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 mt-0.5 flex-shrink-0">
            <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">
            Turvalisuse tagamiseks saadetakse link ainult registreeritud e-maili aadressidele.
          </p>
        </div>
      </div>
    </div>
  )
}