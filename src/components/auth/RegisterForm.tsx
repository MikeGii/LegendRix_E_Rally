// src/components/auth/RegisterForm.tsx - Futuristic theme with enhanced effects
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  playerName: string
  agreeToRules: boolean
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Add error boundary for useAuth
  let auth;
  try {
    auth = useAuth()
  } catch (error) {
    console.error('Auth context error:', error)
    return (
      <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
        <p className="text-red-300">Authentication system not available. Please refresh the page.</p>
      </div>
    )
  }

  const { register: registerUser } = auth
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      console.log('Registration form data:', {
        name: data.name,
        email: data.email,
        password: '***hidden***',
        playerName: data.playerName,
        agreeToRules: data.agreeToRules
      })

      // Pass parameters in correct order: email, password, name, playerName
      const result = await registerUser(data.email, data.password, data.name, data.playerName)
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Registreerimine õnnestus! Kontrolli oma e-maili konto kinnitamiseks.'
        })
        // Clear form after successful registration
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Registreerimine ebaõnnestus'
        })
      }
    } catch (error) {
      console.error('Registration submission error:', error)
      setMessage({
        type: 'error',
        text: 'Registreerimine ebaõnnestus. Palun proovi uuesti.'
      })
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Message display with futuristic styling */}
      {message && (
        <div className={`relative p-4 rounded-xl overflow-hidden ${
          message.type === 'success' 
            ? 'bg-green-900/20' 
            : 'bg-red-900/20'
        }`}>
          {/* Animated background gradient */}
          <div className={`absolute inset-0 ${
            message.type === 'success'
              ? 'bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0'
              : 'bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0'
          } animate-pulse`}></div>
          
          {/* Border effect */}
          <div className={`absolute inset-0 rounded-xl border ${
            message.type === 'success'
              ? 'border-green-500/50'
              : 'border-red-500/50'
          }`}></div>
          
          {/* Content */}
          <div className="relative flex items-start space-x-3">
            <div className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.type === 'success' ? '✓' : '!'}
            </div>
            <p className={`${
              message.type === 'success' ? 'text-green-200' : 'text-red-200'
            } font-medium`}>{message.text}</p>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
        <input
          type="text"
          placeholder="Nimi"
          disabled={isLoading}
          autoComplete="name"
          {...register('name', {
            required: 'Nimi on kohustuslik',
            minLength: {
              value: 2,
              message: 'Nimi peab olema vähemalt 2 tähte pikk'
            }
          })}
          className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
        <input
          type="email"
          placeholder="E-maili aadress"
          disabled={isLoading}
          autoComplete="email"
          {...register('email', {
            required: 'E-maili aadress on kohustuslik',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Palun sisesta kehtiv e-maili aadress'
            }
          })}
          className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Player Name Field */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
        <input
          type="text"
          placeholder="Mängija nimi"
          disabled={isLoading}
          autoComplete="username"
          {...register('playerName', {
            required: 'Mängija nimi on kohustuslik',
            minLength: {
              value: 3,
              message: 'Mängija nimi peab olema vähemalt 3 tähte pikk'
            },
            maxLength: {
              value: 20,
              message: 'Mängija nimi ei tohi olla pikem kui 20 tähte'
            },
            pattern: {
              value: /^[a-zA-Z0-9_\-\.]+$/,
              message: 'Mängija nimi võib sisaldada ainult tähti, numbreid, alakriipse, sidekriipse ja punkte'
            }
          })}
          className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.playerName && (
          <p className="mt-2 text-sm text-red-400">{errors.playerName.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Sisesta oma mänguplatvormi kasutajanimi (Steam, Xbox, PlayStation, jne)
        </p>
      </div>

      {/* Password Field */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
        <input
          type="password"
          placeholder="Parool"
          disabled={isLoading}
          autoComplete="new-password"
          {...register('password', {
            required: 'Parool on kohustuslik',
            minLength: {
              value: 6,
              message: 'Parool peab olema vähemalt 6 tähemärki pikk'
            }
          })}
          className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
        <input
          type="password"
          placeholder="Kinnita parool"
          disabled={isLoading}
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Palun kinnita oma parool',
            validate: (value) => value === password || 'Paroolid ei kattu'
          })}
          className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Rules Section with futuristic styling */}
      <div className="relative bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 space-y-4">
        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/50"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/50"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/50"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/50"></div>
        
        <h3 className="font-['Orbitron'] font-bold text-red-400 uppercase tracking-wider mb-3">Reeglid</h3>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">1.</span>
            <p>EWRC on sõbralik keskkond, kus pole kohta vihkamisele, kiusamisele ja rassismile.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">2.</span>
            <p>EWRC meeskonnal on õigus tühistada konto, mis rikub reegleid.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">3.</span>
            <p>Iga võistleja vastutab oma andmete, paroolide ja konto turvalisuse eest.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">4.</span>
            <p>Võistlustel sõitmiseks peab olema EWRC konto ja olema võistlusele registreeritud.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">5.</span>
            <p>Võistlustel peab kasutama sama mängija nime, mis on registreerimise juures märgitud.</p>
          </div>
          
        </div>

        <div className="flex items-start space-x-3 pt-3 border-t border-gray-800">
          <input
            type="checkbox"
            id="agreeToRules"
            disabled={isLoading}
            {...register('agreeToRules', {
              required: 'Reeglitega nõustumine on kohustuslik'
            })}
            className="mt-1 w-4 h-4 bg-black/60 border-gray-700 rounded text-red-500 focus:ring-red-500/50 focus:ring-2 disabled:opacity-50"
          />
          <label htmlFor="agreeToRules" className="text-sm text-gray-300 cursor-pointer">
            Olen tutvunud ja nõustun eelnimetatud reeglitega
          </label>
        </div>
        {errors.agreeToRules && (
          <p className="mt-2 text-sm text-red-400">{errors.agreeToRules.message}</p>
        )}
      </div>

      {/* Submit Button with futuristic design */}
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full group overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 transition-all duration-300 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-xl">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative px-4 py-3 flex items-center justify-center space-x-2">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="font-['Orbitron'] font-bold text-white tracking-wider">REGISTREERIMINE...</span>
            </>
          ) : (
            <span className="font-['Orbitron'] font-bold text-white tracking-wider">LOO KONTO</span>
          )}
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </button>

      {/* Switch to Login with enhanced styling */}
      <div className="text-center">
        <span className="text-gray-500 text-sm">Juba on konto?</span>{' '}
        <button 
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="relative text-red-400 hover:text-red-300 font-medium transition-all duration-300 disabled:opacity-50 group"
        >
          <span className="relative z-10">Logi sisse</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
        </button>
      </div>
    </form>
  )
}