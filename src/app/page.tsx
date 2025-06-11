'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

type AuthView = 'login' | 'register'

export default function Home() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)
  
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for verification success
    if (searchParams.get('verified') === 'true') {
      setVerificationMessage('Email verified successfully! You can now sign in.')
      setAuthView('login')
      
      // Clear the URL parameter after 5 seconds
      setTimeout(() => {
        setVerificationMessage(null)
        window.history.replaceState({}, '', '/')
      }, 5000)
    }

    // Check for auth errors
    if (searchParams.get('error') === 'auth_error') {
      setVerificationMessage('There was an error with email verification. Please try again.')
      
      // Clear the URL parameter after 5 seconds
      setTimeout(() => {
        setVerificationMessage(null)
        window.history.replaceState({}, '', '/')
      }, 5000)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-xl p-8 shadow-2xl">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8 animate-float">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          {/* Verification Message */}
          {verificationMessage && (
            <div className="mb-6 p-4 rounded-lg border bg-green-900/50 border-green-700 text-green-300">
              <div className="flex items-center space-x-3">
                <span className="text-lg">✅</span>
                <p className="font-medium">{verificationMessage}</p>
              </div>
            </div>
          )}

          {/* Form Title */}
          <h2 className="text-center text-2xl font-bold text-white mb-6">
            {authView === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          {authView === 'login' ? (
            <LoginForm 
              onSwitchToRegister={() => setAuthView('register')}
              onLoginStart={() => setIsLoggingIn(true)}
              onLoginError={() => setIsLoggingIn(false)}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}