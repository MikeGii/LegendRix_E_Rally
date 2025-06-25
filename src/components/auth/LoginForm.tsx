// src/components/auth/LoginForm.tsx - Form handles its own error logic
'use client'

import { useState } from 'react'
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

  const shouldShowForgotPasswordLink = error && shouldShowForgotPassword(error)

  return (
    <div className="space-y-5">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-lg">❌</span>
            <div className="flex-1">
              <p className="text-red-300 font-medium">{error}</p>
              
              {/* Forgot Password suggestion */}
              {shouldShowForgotPasswordLink && (
                <div className="mt-2 pt-2 border-t border-red-700/50">
                  <p className="text-red-200 text-sm">
                    Kas unustasid parooli?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToForgotPassword}
                      className="underline hover:no-underline font-medium text-red-100"
                    >
                      Taasta parool siin
                    </button>
                  </p>
                </div>
              )}
              
              {/* Help tips after multiple attempts */}
              {showHelp && attemptCount >= 2 && (
                <div className="mt-3 pt-2 border-t border-red-700/50">
                  <p className="text-red-200 text-sm mb-2">💡 Abiks:</p>
                  <ul className="text-red-200/80 text-sm space-y-1">
                    <li className="flex items-start space-x-1">
                      <span className="mt-0.5 opacity-60">•</span>
                      <span>Kontrolli, et sisestasid õige e-maili aadressi</span>
                    </li>
                    <li className="flex items-start space-x-1">
                      <span className="mt-0.5 opacity-60">•</span>
                      <span>Veendu, et parool on õigesti sisestatud</span>
                    </li>
                    {attemptCount >= 3 && (
                      <li className="flex items-start space-x-1">
                        <span className="mt-0.5 opacity-60">•</span>
                        <span>Kui probleem püsib, proovi parooli lähtestamist</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <input
            type="email"
            placeholder="E-maili aadress"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50"
          />
        </div>

        {/* Password Field */}
        <div>
          <input
            type="password"
            placeholder="Parool"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50"
          />
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            disabled={loading}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
          >
            Unustasid parooli?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sisselogimine...</span>
            </>
          ) : (
            <span>Logi sisse</span>
          )}
        </button>

        {/* Switch to Register */}
        <div className="text-center text-sm text-gray-400">
          Pole veel kontot?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
          >
            Registreeru siin
          </button>
        </div>
      </form>
    </div>
  )
}