// src/components/auth/ForgotPasswordForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'

// Simple icons matching your project patterns
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

  // Success state
  if (success) {
    return (
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-3">
            E-mail saadetud!
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Saatsime parooli lähtestamise lingi sinu e-mailile. 
            Kontrolli oma postkasti ja järgi juhiseid parooli muutmiseks.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium mb-1">
                Ei leia e-maili?
              </p>
              <p className="text-xs text-blue-200/80">
                Kontrolli oma rämpsposti kausta. Link kehtib 24 tundi.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tagasi sisselogimise juurde</span>
        </button>
      </div>
    )
  }

  // Form state
  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg border bg-red-900/50 border-red-700 text-red-300">
          <p className="text-sm text-center">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
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
            className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50"
          />
          {form.formState.errors.email && (
            <p className="text-red-400 text-sm mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saadan...</span>
            </div>
          ) : (
            'Saada lähtestamise link'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          disabled={loading}
          className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Tagasi sisselogimise juurde
        </button>
      </div>

      {/* Security Note */}
      <div className="pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Turvalisuse tagamiseks saadetakse link ainult registreeritud e-maili aadressidele.
        </p>
      </div>
    </div>
  )
}