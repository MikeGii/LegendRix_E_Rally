'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

type AuthView = 'login' | 'register'

export default function Home() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

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