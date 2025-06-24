// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void // New prop
  onLoginStart?: () => void
  onLoginError?: () => void
  onLoginSuccess?: () => void
}

export function LoginForm({ 
  onSwitchToRegister, 
  onSwitchToForgotPassword, // New prop
  onLoginStart = () => {}, 
  onLoginError = () => {},
  onLoginSuccess = () => {}
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onLoginStart()
    setLoading(true)
    setError('')

    console.log('🔐 Login form submitted')

    try {
      // Step 1: Attempt login
      const result = await login(email, password)
      
      if (!result.success) {
        setError(result.error || 'Login failed')
        onLoginError()
        return
      }

      console.log('✅ Login successful, staying on landing page')
      
      // Clear form
      setEmail('')
      setPassword('')
      
      // Call success callback to close modal
      onLoginSuccess()

    } catch (err: any) {
      setError(err.message || 'Login failed')
      onLoginError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg border bg-red-900/50 border-red-700 text-red-300">
          <p className="text-sm text-center">{error}</p>
        </div>
      )}

      <div>
        <input
          type="email"
          placeholder="E-maili aadress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50"
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Parool"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
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

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="text-center text-sm text-gray-400">
        Pole veel kontot?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 font-medium"
        >
          Registreeru siin
        </button>
      </div>
    </form>
  )
}