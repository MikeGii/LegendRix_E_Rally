// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onLoginStart?: () => void       // Make these optional with ?
  onLoginError?: () => void       // if they're not always required
}

export function LoginForm({ 
  onSwitchToRegister, 
  onLoginStart = () => {}, 
  onLoginError = () => {} 
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onLoginStart() // Call this first
    setLoading(true)
    setError('')

    console.log('🔐 Login form submitted')

    try {
      // Step 1: Attempt login
      const result = await login(email, password)
      
      if (!result.success) {
        setError(result.error || 'Login failed')
        onLoginError() // Call on error
        return
      }

      // Force a hard refresh to ensure auth state is fully loaded
      window.location.href = result.user?.role === 'admin' 
      ? '/admin-dashboard' 
      : '/user-dashboard'

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
          placeholder="Email address"
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  )
}