// src/app/reset-password/page.tsx
'use client'

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

export default function ResetPasswordPage() {
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
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Check for error in URL first
        const urlError = urlParams.get('error')
        const errorCode = urlParams.get('error_code')
        const errorDescription = urlParams.get('error_description')
        
        if (urlError) {
          console.error('❌ URL contains error:', { urlError, errorCode, errorDescription })
          
          let errorMessage = 'Parooli lähtestamise link on aegunud või vigane. Palun taotle uus link.'
          
          if (errorCode === 'otp_expired' || urlError === 'access_denied') {
            errorMessage = 'Parooli lähtestamise link on aegunud. Palun taotle uus parooli lähtestamise link.'
          }
          
          setError(errorMessage)
          setValidating(false)
          return
        }
        
        // Check for code parameter (Supabase's standard recovery flow)
        const code = urlParams.get('code')
        if (code) {
          console.log('🔄 Found recovery code, exchanging for session...')
          
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
              console.error('❌ Code exchange error:', error.message)
              setError('Parooli lähtestamise link on aegunud või vigane. Palun taotle uus link.')
              setValidating(false)
              return
            }
            
            if (data.session) {
              console.log('✅ Recovery session created successfully')
              // Clean up URL to remove the code parameter
              window.history.replaceState({}, document.title, '/reset-password')
              setValidating(false)
              return
            }
          } catch (exchangeError) {
            console.error('❌ Code exchange exception:', exchangeError)
            setError('Parooli lähtestamise lingi töötlemine ebaõnnestus.')
            setValidating(false)
            return
          }
        }
        
        // Check for access token in hash (alternative Supabase behavior)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')
        
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('🔄 Found recovery tokens in URL hash, setting session...')
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            console.error('❌ Session creation error:', sessionError.message)
            setError('Parooli lähtestamise lingi töötlemine ebaõnnestus.')
            setValidating(false)
            return
          }
          
          if (sessionData.session) {
            console.log('✅ Recovery session created successfully')
            // Clean up URL
            window.history.replaceState({}, document.title, '/reset-password')
            setValidating(false)
            return
          }
        }
        
        // Check for existing session
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError.message)
          setError('Sessiooni kontrollimisel tekkis viga.')
          setValidating(false)
          return
        }

        if (data.session) {
          console.log('✅ Valid session found')
          setValidating(false)
          return
        }

        // No valid session, code, or tokens found
        console.error('❌ No valid session, code, or recovery tokens found')
        setError('Parooli lähtestamise sessioon on aegunud. Palun taotle uus parooli lähtestamise link.')
        setValidating(false)
        
      } catch (err) {
        console.error('❌ Password reset error:', err)
        setError('Ootamatu viga. Palun proovi uuesti.')
        setValidating(false)
      }
    }

    handlePasswordReset()
  }, [])

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Paroolid ei ühti')
      return
    }

    if (passwordStrength < 4) {
      setError('Parool on liiga nõrk. Palun vali tugevam parool.')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔄 Updating user password...')

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) {
        console.error('❌ Password update error:', updateError.message)
        setError('Parooli uuendamine ebaõnnestus. Palun proovi uuesti.')
        return
      }

      console.log('✅ Password updated successfully')
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
              <p className="text-gray-300 mb-6">
                {error}
              </p>
              
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium"
              >
                Tagasi avalehele
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main reset form
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

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Uue parooli seadistamine
            </h2>
            <p className="text-gray-300">
              Sisesta oma uus parool allpool
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border bg-red-900/50 border-red-700 text-red-300">
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Uus parool
              </label>
              <div className="relative">
                <input
                  {...form.register('password', {
                    required: 'Parool on kohustuslik',
                    minLength: {
                      value: 8,
                      message: 'Parool peab olema vähemalt 8 tähemärki pikk'
                    },
                    validate: {
                      hasUppercase: (value) => /[A-Z]/.test(value) || 'Parool peab sisaldama vähemalt üht suurtähte',
                      hasLowercase: (value) => /[a-z]/.test(value) || 'Parool peab sisaldama vähemalt üht väiketähte',
                      hasNumber: (value) => /[0-9]/.test(value) || 'Parool peab sisaldama vähemalt üht numbrit'
                    }
                  })}
                  type={showPasswords.password ? 'text' : 'password'}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  placeholder="Sisesta uus parool"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPasswords.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-slate-400">Parooli tugevus:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-400' : 
                      passwordStrength <= 4 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {form.formState.errors.password && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Kinnita uus parool
              </label>
              <div className="relative">
                <input
                  {...form.register('confirmPassword', {
                    required: 'Palun kinnita oma parooli',
                    validate: (value) => {
                      const password = form.getValues('password')
                      return value === password || 'Paroolid ei ühti'
                    }
                  })}
                  type={showPasswords.confirm ? 'text' : 'password'}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  placeholder="Kinnita uus parool"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordStrength < 4}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Parooli uuendamine...</span>
                </div>
              ) : (
                'Uuenda parool'
              )}
            </button>
          </form>

          {/* Back to home */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Tagasi avalehele
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Password strength utilities
const calculatePasswordStrength = (password: string): number => {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const getPasswordStrengthColor = (strength: number): string => {
  if (strength <= 2) return 'bg-red-500'
  if (strength <= 4) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getPasswordStrengthText = (strength: number): string => {
  if (strength <= 2) return 'Nõrk'
  if (strength <= 4) return 'Keskmine'
  return 'Tugev'
}