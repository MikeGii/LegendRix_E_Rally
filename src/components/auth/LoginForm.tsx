// src/components/auth/LoginForm.tsx - Futuristic theme with enhanced effects
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { mapAuthError, shouldShowForgotPassword } from '@/utils/authErrors'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
  onLoginSuccess?: () => void
  onClose?: () => void
}

export function LoginForm({ 
  onSwitchToRegister, 
  onSwitchToForgotPassword,
  onLoginSuccess = () => {},
  onClose = () => {}
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  
  const { login } = useAuth()

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Clear previous errors
    setError(null)
    setShowHelp(false)

    // Basic validation before sending request
    if (!email.trim() || !password.trim()) {
      setError('Palun täida kõik väljad.')
      return
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Palun sisesta kehtiv e-maili aadress.')
      return
    }
    
    setLoading(true)
    console.log('🔐 Login form submitted for:', email)

    try {
      // Call the clean API method
      const result = await login(email.trim(), password)
      
      if (!result.success) {
        // Handle error using our error mapping utility
        const currentAttempt = attemptCount + 1
        setAttemptCount(currentAttempt)
        
        const authError = mapAuthError(result.error || 'Login failed')
        setError(authError.message)
        
        // Show help after multiple attempts
        if (currentAttempt >= 2) {
          setShowHelp(true)
        }
        
        console.log('❌ Login failed:', result.error)
        return // Stay on form with error displayed
      }

      console.log('✅ Login successful')
      
      // Clear form on success
      setEmail('')
      setPassword('')
      setError(null)
      setAttemptCount(0)
      
      // Call success callback - this should close modal and show success message
      onLoginSuccess()

    } catch (err: any) {
      // Handle unexpected errors
      const currentAttempt = attemptCount + 1
      setAttemptCount(currentAttempt)
      
      setError('Sisselogimine ebaõnnestus. Palun proovi uuesti.')
      
      if (currentAttempt >= 2) {
        setShowHelp(true)
      }
      
      console.error('❌ Login exception:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo with futuristic effects */}
      <div className="flex justify-center mb-12">
        <div className="relative group">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-orange-500 rounded-2xl blur-2xl opacity-50 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-red-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          
          {/* Logo container */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-500/50 bg-gradient-to-br from-red-600/20 to-purple-600/20 backdrop-blur-sm p-2 group-hover:ring-red-500/70 transition-all neon-glow">
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              <Image
                src="/image/rally-cover.png"
                alt="LegendRix Rally"
                fill
                className="object-cover"
                priority
                sizes="96px"
              />
            </div>
          </div>
          
          {/* Orbiting particles effect */}
          <div className="absolute -inset-4" style={{ animation: 'spin 8s linear infinite' }}>
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
            <div className="absolute bottom-0 right-1/2 w-1 h-1 bg-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Error Message with futuristic design */}
      {error && (
        <div className="relative p-4 rounded-lg overflow-hidden">
          {/* Background with animated border */}
          <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 animate-pulse"></div>
          
          {/* Border effect */}
          <div className="absolute inset-0 rounded-lg border border-red-500/50"></div>
          <div className="absolute -inset-px rounded-lg border border-red-500/20"></div>
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                  <div className="relative w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">!</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-red-200 font-medium">{error}</p>
                
                {/* Help tips after multiple attempts */}
                {showHelp && attemptCount >= 2 && (
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <p className="text-red-300/80 text-sm font-semibold mb-2">Võimalikud lahendused:</p>
                    <ul className="space-y-1 text-red-300/70 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400 mt-0.5">▸</span>
                        <span>Kontrolli, kas kasutad õiget e-maili aadressi</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400 mt-0.5">▸</span>
                        <span>Veendu, et parool on õigesti sisestatud</span>
                      </li>
                      {attemptCount >= 3 && (
                        <li className="flex items-start space-x-2">
                          <span className="text-red-400 mt-0.5">▸</span>
                          <span>Kui probleem püsib, proovi parooli lähtestamist</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field with futuristic styling */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
          <input
            type="email"
            placeholder="E-maili aadress"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
            className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password Field with futuristic styling */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
          <input
            type="password"
            placeholder="Parool"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
            className="relative w-full px-4 py-3 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Forgot Password Link with futuristic hover effect */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            disabled={loading}
            className="relative text-sm text-gray-400 hover:text-red-400 transition-all duration-300 disabled:opacity-50 group"
          >
            <span className="relative z-10">Unustasid parooli?</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>

        {/* Submit Button with futuristic design */}
        <button
          type="submit"
          disabled={loading}
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
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="font-['Orbitron'] font-bold text-white tracking-wider">SISSELOGIMINE...</span>
              </>
            ) : (
              <span className="font-['Orbitron'] font-bold text-white tracking-wider">LOGI SISSE</span>
            )}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>

        {/* Switch to Register with enhanced styling */}
        <div className="text-center text-sm">
          <span className="text-gray-500">Pole veel kontot?</span>{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loading}
            className="relative text-red-400 hover:text-red-300 font-medium transition-all duration-300 disabled:opacity-50 group"
          >
            <span className="relative z-10">Registreeru siin</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>
      </form>

      {/* Tech decoration lines */}
      <div className="relative mt-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500/50 rounded-full"></div>
      </div>
    </div>
  )
}