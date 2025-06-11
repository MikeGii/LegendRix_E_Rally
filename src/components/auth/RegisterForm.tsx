'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToRules: boolean
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
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
        agreeToRules: data.agreeToRules
      })

      // Pass parameters in correct order: email, password, name
      const result = await registerUser(data.email, data.password, data.name)
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Registration successful! Check your email to verify your account.'
        })
        // Clear form after successful registration
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Registration failed'
        })
      }
    } catch (error) {
      console.error('Registration submission error:', error)
      setMessage({
        type: 'error',
        text: 'Registration failed. Please try again.'
      })
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {message && (
        <div className={`p-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/50 border-green-700 text-green-300' 
            : 'bg-red-900/50 border-red-700 text-red-300'
        }`}>
          <p className="text-sm text-center">{message.text}</p>
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Full name"
          disabled={isLoading}
          autoComplete="name"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

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
          autoComplete="new-password"
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

      <div>
        <input
          type="password"
          placeholder="Confirm password"
          disabled={isLoading}
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match'
          })}
          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 focus:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Rules Agreement Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <h3 className="text-base font-semibold text-white mb-3">
          Kasutajakonto loomisega kinnitan et olen tutvunud veebisaidi reeglitega:
        </h3>
        
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">1.</span>
            <p>Võistlustel osalemiseks pean ennast eelnevalt registreerima kasutades selleks registreerimisvormi, mis asub töölaual.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">2.</span>
            <p>Võistlustele registreerides ja vähemalt 3 korral mitte osaledes ennast registreerimisnimekirjast kustutamast võidakse minu konto jäädavalt blokeerida.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">3.</span>
            <p>Võistlustel võib olla piiratud koht arvi ja kehtib reegel, et esimesena registreerunud pääsevad võistlema.</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">4.</span>
            <p>Võistlustel osaledes olen viisakas ja järgin vastava mängu reegleid. Mistahes viisil mängu enda reeglite rikkumisel võidakse minu konto jäädavalt blokeerida.</p>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-3 pt-3 border-t border-slate-700/50">
          <input
            type="checkbox"
            id="agreeToRules"
            disabled={isLoading}
            {...register('agreeToRules', {
              required: 'Peate nõustuma reeglitega kontot luua saamiseks'
            })}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
          />
          <label htmlFor="agreeToRules" className="text-sm text-slate-300 cursor-pointer select-none">
            Kinnitan, et olen reeglitega tutvunud
          </label>
        </div>
        
        {errors.agreeToRules && (
          <p className="text-sm text-red-400 mt-2">{errors.agreeToRules.message}</p>
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
            Creating account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Switch to Login */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  )
}