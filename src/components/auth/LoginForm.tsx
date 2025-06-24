// src/components/auth/LoginForm.tsx - Clean form that sends errors to parent for toast display
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
  onLoginStart?: () => void
  onLoginError?: (error: string) => void
  onLoginSuccess?: () => void
}

export function LoginForm({ 
  onSwitchToRegister, 
  onSwitchToForgotPassword,
  onLoginStart = () => {}, 
  onLoginError = () => {},
  onLoginSuccess = () => {}
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Basic validation before sending request
    if (!email.trim() || !password.trim()) {
      onLoginError('Palun täida kõik väljad.')
      return
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      onLoginError('Palun sisesta kehtiv e-maili aadress.')
      return
    }
    
    // Call login start callback
    onLoginStart()
    setLoading(true)

    console.log('🔐 Login form submitted for:', email)

    try {
      // Attempt login
      const result = await login(email.trim(), password)
      
      if (!result.success) {
        // Send error to parent for toast display
        onLoginError(result.error || 'Login failed')
        console.log('❌ Login failed:', result.error)
        return // Stay on form
      }

      console.log('✅ Login successful')
      
      // Clear form on success
      setEmail('')
      setPassword('')
      
      // Call success callback - parent will handle modal closing and success toast
      onLoginSuccess()

    } catch (err: any) {
      // Send exception to parent for toast display
      onLoginError(err.message || 'Login failed')
      console.error('❌ Login exception:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* No error display here - errors shown as toast notifications */}
      
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

      {/* Submit Button - Changed to type="button" to prevent form refresh */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !email.trim() || !password.trim()}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Sisselogimine...</span>
          </div>
        ) : (
          'Logi sisse'
        )}
      </button>

      {/* Register Link */}
      <div className="text-center pt-4 border-t border-gray-700/50">
        <p className="text-sm text-gray-400">
          Pole veel kontot?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 font-medium underline-offset-2 hover:underline"
          >
            Registreeru siin
          </button>
        </p>
      </div>
    </form>
  )
}