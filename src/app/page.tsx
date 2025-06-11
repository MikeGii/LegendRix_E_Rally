'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { VerificationMessage } from '@/components/auth/VerificationMessage'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

type AuthView = 'login' | 'register'

function HomeContent() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const { user, loading, logout } = useAuth()
  const router = useRouter()

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

  const handleLoginSuccess = async () => {
    // Close the modal after successful login
    setShowAuthModal(false)
    setAuthView('login')
    
    // Wait for auth state to settle, then refresh
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('🔄 Forcing page refresh after successful login')
    window.location.reload()
  }

  const handleDashboard = () => {
    if (user) {
      const dashboardUrl = user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
      router.push(dashboardUrl)
    }
  }

  const handleLogout = async () => {
    await logout()
    // Refresh page to ensure clean state
    window.location.reload()
  }

  // Simple loading state to prevent hydration issues
  if (!isMounted) {
    return null // Don't render anything on server
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* UPDATED: Elegant Glassmorphism Header */}
      <header className="absolute top-0 left-0 right-0 z-30">
        {/* NEW: Background with gradient and blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/70 to-transparent backdrop-blur-xl border-b border-white/10 shadow-xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            {/* UPDATED: Enhanced Logo with Rally Cover Image */}
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/30 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm p-1">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src="/image/rally-cover.png"
                    alt="LegendRix Rally"
                    fill
                    className="object-cover"
                    priority
                    sizes="56px"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg tracking-wide">LegendRix</h1>
                <p className="text-sm text-blue-200/90 drop-shadow font-medium -mt-1">E-Rally Championship</p>
              </div>
            </div>

            {/* UPDATED: Enhanced Header Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                // Logged In Buttons: Töölaud + Logi Välja
                <>
                  <button
                    onClick={handleDashboard}
                    className="group px-8 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-md hover:from-blue-500/30 hover:to-blue-600/30 text-white rounded-2xl font-semibold transition-all duration-300 border border-blue-400/30 hover:border-blue-300/50 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📊</span>
                      <span>Töölaud</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="group px-8 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md hover:from-red-500/30 hover:to-red-600/30 text-white rounded-2xl font-semibold transition-all duration-300 border border-red-400/30 hover:border-red-300/50 shadow-lg hover:shadow-red-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">🚪</span>
                      <span>{loading ? 'Välja logimas...' : 'Logi Välja'}</span>
                    </div>
                  </button>
                </>
              ) : (
                // Sign In / Register Button (when not logged in)
                <button
                  onClick={handleOpenAuth}
                  className="group px-8 py-3 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md hover:from-white/25 hover:to-white/20 text-white rounded-2xl font-semibold transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-white/10 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">👤</span>
                    <span>Logi sisse / Registreeru</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cover Photo Section */}
      <div className="relative w-full" style={{ height: '30vh', marginTop: '100px' }}>
        <div className="absolute inset-0">
          <Image
            src="/cover-photo.png"
            alt="LegendRix E-Rally Cover"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Welcome Message for Logged In Users */}
          {user && (
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Tere tulemast, {user.name}!
              </h3>
            </div>
          )}

          {/* Main Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              Tere tulemas LegendRix
              <span className="block text-blue-400">E-Spordi keskusesse!</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 drop-shadow-lg max-w-4xl mx-auto">
              Kogege virtuaalse ralli põnevust. Võistlege sõitjatega üle maailma ja tõestage oma oskusi tipptasemel e-spordi keskkonnas.
            </p>
            
            {/* Call to Action - Changes based on login status */}
            {user ? (
              <button
                onClick={handleDashboard}
                className="px-8 py-4 bg-blue-600/80 backdrop-blur-sm hover:bg-blue-500/90 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                Ava Töölaud
              </button>
            ) : (
              <button
                onClick={handleOpenAuth}
                className="px-8 py-4 bg-blue-600/80 backdrop-blur-sm hover:bg-blue-500/90 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                Liitu Meie Tiimiga
              </button>
            )}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-panel rounded-xl p-8 text-center hover:bg-gray-800/60 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏁</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Võistlused</h3>
              <p className="text-slate-300">
                Osalege regulaarsetes turniirides ja meistrivõistlustes erinevates ralli mängudes.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-8 text-center hover:bg-gray-800/60 transition-all duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Statistika</h3>
              <p className="text-slate-300">
                Jälgige oma arengut detailsete statistikate ja edetabelitega.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-8 text-center hover:bg-gray-800/60 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Auhinnad</h3>
              <p className="text-slate-300">
                Võitke põnevaid auhindu ja tunnustust oma saavutuste eest.
              </p>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center">
            <div className="glass-panel rounded-2xl p-12 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">Valmis Alustama?</h3>
              <p className="text-xl text-slate-300 mb-8">
                Liituge LegendRix E-Rally kogukonnaga ja alustage oma teekonda e-spordi tippu!
              </p>
              {user ? (
                <div className="space-y-4">
                  <button
                    onClick={handleDashboard}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 mr-4"
                  >
                    Avage Töölaud
                  </button>
                  <p className="text-slate-400 text-sm">
                    Logged in as <span className="text-white font-medium">{user.name}</span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleOpenAuth}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
                >
                  Loo Konto
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal with 80% Dark Overlay - Only show when not logged in and modal is open */}
      {!user && showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 80% Dark Overlay - Much Darker */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleCloseAuth}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md animate-fadeIn">
            <div className="glass-panel rounded-xl p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={handleCloseAuth}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
              >
                ✕
              </button>

              {/* Rally Cover Logo */}
              <div className="flex justify-center mb-8 animate-float">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-2 border-blue-500/30 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src="/image/rally-cover.png"
                      alt="LegendRix Rally"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Verification Message */}
              <VerificationMessage />

              {/* Form Title */}
              <h2 className="text-center text-2xl font-bold text-white mb-6">
                {authView === 'login' ? 'Tere tulemast tagasi' : 'Loo uus konto'}
              </h2>

              {authView === 'login' ? (
                <LoginForm 
                  onSwitchToRegister={() => setAuthView('register')}
                  onLoginStart={() => {}}
                  onLoginError={() => {}}
                  onLoginSuccess={handleLoginSuccess}
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
  return <HomeContent />
}