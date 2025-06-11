'use client'

import { useState, Suspense, useEffect } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { VerificationMessage } from '@/components/auth/VerificationMessage'

type AuthView = 'login' | 'register'

function HomeContent() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleOpenAuth = () => {
    setShowAuthModal(true)
  }

  const handleCloseAuth = () => {
    setShowAuthModal(false)
    setAuthView('login') // Reset to login when closing
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Cover Image */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder for cover image - replace with your actual image */}
        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-800 to-purple-900 relative">
          {/* Image placeholder box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-700/30 border-2 border-dashed border-slate-500 rounded-xl p-12 text-center max-w-md">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Cover Image Placeholder</h3>
              <p className="text-slate-300 text-sm">Replace this with your rally cover photo</p>
              <p className="text-slate-400 text-xs mt-2">
                Recommended: 1920x1080px or higher
              </p>
            </div>
          </div>
          
          {/* Example: How to use actual image when ready */}
          {/* 
          <img 
            src="/images/rally-cover.jpg" 
            alt="LegendRix E-Rally" 
            className="w-full h-full object-cover"
          />
          */}
        </div>
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🏁</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">LegendRix E-Rally</h1>
              <p className="text-sm text-slate-200/80 drop-shadow">Championship Series</p>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleOpenAuth}
            className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen -mt-24 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Welcome to the
            <span className="block text-blue-400">Championship</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-8 drop-shadow-lg">
            Experience the thrill of virtual rally racing. Compete with drivers worldwide.
          </p>
          <button
            onClick={handleOpenAuth}
            className="px-8 py-4 bg-blue-600/80 backdrop-blur-sm hover:bg-blue-500/90 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
          >
            Join the Championship
          </button>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseAuth}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md">
            <div className="glass-panel rounded-xl p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={handleCloseAuth}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
              >
                ✕
              </button>

              {/* Logo - Using emoji instead of SVG to fix hydration */}
              <div className="flex justify-center mb-8 animate-float">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">⚡</span>
                </div>
              </div>

              {/* Verification Message - wrapped in Suspense */}
              <Suspense fallback={null}>
                <VerificationMessage />
              </Suspense>

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
      )}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}