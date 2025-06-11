'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSwitchToRegister: () => void
  onLoginStart: () => void
  onLoginError: () => void
}

export function LoginForm({ onSwitchToRegister, onLoginStart, onLoginError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
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

  const { login } = auth
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setMessage('')
    onLoginStart()
    
    try {
      console.log('Login form data:', {
        email: data.email,
        password: '***hidden***'
      })

      const result = await login(data.email, data.password)
      
      if (result.success) {
        // Redirect to appropriate dashboard
        router.push('/user-dashboard')
      } else {
        setMessage(result.error || 'Login failed')
        onLoginError()
      }
    } catch (error) {
      console.error('Login submission error:', error)
      setMessage('Login failed. Please try again.')
      onLoginError()
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {message && (
        <div className="p-3 rounded-lg border bg-red-900/50 border-red-700 text-red-300">
          <p className="text-sm text-center">{message}</p>
        </div>
      )}

      <div>
        <input
          type="email"
          placeholder="Email address"
          disabled={isLoading}
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          disabled={isLoading}
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Switch to Register */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  )
}