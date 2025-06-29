// src/app/reset-password/page.tsx
'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// Simple icons
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
)

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

// Password strength calculator
function calculatePasswordStrength(password: string) {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return {
    score: strength,
    percentage: (strength / 6) * 100,
    label: strength <= 2 ? 'Nõrk' : strength <= 4 ? 'Keskmine' : 'Tugev'
  }
}

// Separate component for the main content that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(true)
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  })

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const password = form.watch('password')
  const passwordStrength = calculatePasswordStrength(password || '')

  // Validate reset session on mount
  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        
        // Check for error in URL first
        const urlError = urlParams.get('error')
        if (urlError) {
          console.error('❌ URL contains error:', urlError)
          setError('Parooli lähtestamise link on aegunud või vigane. Palun taotle uus link.')
          setValidating(false)
          return
        }

        // Get the token_hash from URL
        const tokenHash = urlParams.get('token_hash')
        const type = urlParams.get('type')
        
        console.log('🔄 Checking reset password params:', { 
          hasTokenHash: !!tokenHash, 
          type 
        })

        if (!tokenHash || type !== 'recovery') {
          console.error('❌ Missing or invalid reset parameters')
          setError('Vigane parooli lähtestamise link. Palun taotle uus link.')
          setValidating(false)
          return
        }

        // Store the token in session storage for later use
        sessionStorage.setItem('reset_token', tokenHash)

        console.log('✅ Reset password token validated and stored')
        setValidating(false)

      } catch (err: any) {
        console.error('❌ Reset password validation error:', err)
        setError('Parooli lähtestamise lingi kontrollimine ebaõnnestus.')
        setValidating(false)
      }
    }

    handlePasswordReset()
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      setError('Paroolid ei kattu. Palun kontrolli.')
      return
    }

    // Validate password strength
    if (passwordStrength.score < 3) {
      setError('Parool on liiga nõrk. Palun vali tugevam parool.')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔄 Updating password with custom token...')

      const token = sessionStorage.getItem('reset_token')
      if (!token) {
        setError('Parooli lähtestamise sessioon on aegunud. Palun taotle uus link.')
        setLoading(false)
        return
      }

      // Use our custom API to update password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Password reset failed:', result.error)
        setError(result.error || 'Parooli uuendamine ebaõnnestus. Palun proovi uuesti.')
        setLoading(false)
        return
      }

      console.log('✅ Password updated successfully')
      
      // Clean up session storage
      sessionStorage.removeItem('reset_token')
      
      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (err: any) {
      console.error('❌ Password reset exception:', err)
      setError('Ootamatu viga. Palun proovi uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Parooli lähtestamise lingi kontrollimine...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-3">
                Parool edukalt uuendatud!
              </h2>
              <p className="text-gray-300">
                Sinu parool on edukalt muudetud. Sind suunatakse automaatselt avalehele, kus saad uue parooliga sisse logida.
              </p>
            </div>

            {/* Auto redirect message */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center">
              <p className="text-blue-300 text-sm">
                Suunamine avalehele 3 sekundi pärast...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && validating === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-2 border-blue-500/30 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src="/image/rally-cover.png"
                    alt="LegendRix Rally"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-3">
                Link ei kehti
              </h2>
              <p className="text-gray-300 mb-6">{error}</p>
            </div>

            {/* Back to Home Button */}
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Tagasi avalehele
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Reset Password Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-2 border-blue-500/30 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src="/image/rally-cover.png"
                  alt="LegendRix Rally"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Uue parooli seadmine
            </h2>
            <p className="text-gray-400 text-sm">
              Sisesta oma uus parool
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Uus parool
              </label>
              <div className="relative">
                <input
                  type={showPasswords.password ? 'text' : 'password'}
                  {...form.register('password', { required: true })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 pr-12"
                  placeholder="Sisesta uus parool"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPasswords.password ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Parooli tugevus:</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-400' :
                      passwordStrength.score <= 4 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 4 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Korda parooli
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  {...form.register('confirmPassword', { required: true })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 pr-12"
                  placeholder="Sisesta parool uuesti"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                loading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uuendan parooli...
                </span>
              ) : (
                'Uuenda parool'
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Tagasi sisselogimise juurde
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Laadimine...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}