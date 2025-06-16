// src/app/page.tsx - PROPERLY INTEGRATED with all original features preserved
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { VerificationMessage } from '@/components/auth/VerificationMessage'
import { CompetitionsModal } from '@/components/landing/CompetitionsModal'
import { EdetabelModal } from '@/components/landing/EdetabelModal'
import { useUpcomingRallies } from '@/hooks/useOptimizedRallies'

// Import modular landing page components
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { SupportersSection } from '@/components/landing/supporters/SupportersSection'
import { SocialMediaSection } from '@/components/landing/sections/SocialMediaSection'
import { WelcomeMessage } from '@/components/landing/WelcomeMessage'

type AuthView = 'login' | 'register'

function HomeContent() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [authView, setAuthView] = useState<AuthView>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isCompetitionsModalOpen, setIsCompetitionsModalOpen] = useState(false)
  const [isEdetabelModalOpen, setIsEdetabelModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load upcoming rallies for competitions modal
  const { data: upcomingRallies = [], isLoading: isLoadingRallies } = useUpcomingRallies(10)

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
      // Both admin and user now go to user-dashboard by default
      // Admins can use the view switcher in the header to access admin features
      router.push('/user-dashboard')
    }
  }

  const handleLogout = async () => {
    console.log('🚪 Main page logout initiated...')
    
    try {
      // Clear all auth state first
      await logout()
      
      // Clear any remaining session data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        window.localStorage.clear()
        // Clear sessionStorage  
        window.sessionStorage.clear()
        // Clear any supabase specific storage
        window.localStorage.removeItem('supabase.auth.token')
        window.localStorage.removeItem('sb-localhost-auth-token')
      }
      
      console.log('✅ Logout completed, forcing page reload...')
      
      // Force a hard reload to completely reset the app state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force reload even if logout fails
      window.location.href = '/'
    }
  }

  const handleOpenCompetitions = () => {
    setIsCompetitionsModalOpen(true)
  }

  // NEW: Handle opening Edetabel modal
  const handleOpenEdetabel = () => {
    setIsEdetabelModalOpen(true)
  }

  // Simple loading state to prevent hydration issues
  if (!isMounted) {
    return null // Don't render anything on server
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      {/* Elegant Glassmorphism Header */}
      <header className="absolute top-0 left-0 right-0 z-30">
        {/* Background with gradient and blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/80 to-transparent backdrop-blur-2xl border-b border-white/5 shadow-2xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo with Rally Cover Image */}
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-1">
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
                <h1 className="text-2xl font-bold text-white drop-shadow-xl tracking-wide">LegendRix</h1>
                <p className="text-sm text-blue-300/90 drop-shadow-lg font-medium -mt-1">E-Spordikeskus</p>
              </div>
            </div>

            {/* Enhanced Header Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                // Logged In Buttons: Töölaud + Logi Välja
                <>
                  <button
                    onClick={handleDashboard}
                    className="group px-8 py-3 bg-gradient-to-r from-blue-600/15 to-blue-700/15 backdrop-blur-xl hover:from-blue-600/25 hover:to-blue-700/25 text-white rounded-2xl font-semibold transition-all duration-300 border border-blue-400/20 hover:border-blue-300/40 shadow-xl hover:shadow-blue-500/20 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📊</span>
                      <span>Töölaud</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={authLoading}
                    className="group px-8 py-3 bg-gradient-to-r from-red-600/15 to-red-700/15 backdrop-blur-xl hover:from-red-600/25 hover:to-red-700/25 text-white rounded-2xl font-semibold transition-all duration-300 border border-red-400/20 hover:border-red-300/40 shadow-xl hover:shadow-red-500/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">🚪</span>
                      <span>{authLoading ? 'Välja logimas...' : 'Logi Välja'}</span>
                    </div>
                  </button>
                </>
              ) : (
                // Sign In / Register Button (when not logged in)
                <button
                  onClick={handleOpenAuth}
                  className="group px-8 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/15 text-white rounded-2xl font-semibold transition-all duration-300 border border-white/15 hover:border-white/30 shadow-xl hover:shadow-white/10 hover:scale-105"
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

      {/* Enhanced Cover Photo Section with Better Positioning and Smooth Transition */}
      <div className="relative w-full" style={{ height: '35vh', marginTop: '100px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/cover-photo.png"
            alt="LegendRix E-Rally Cover"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 60%' }}
            priority
          />
          {/* Enhanced gradient overlay for professional look */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/20 to-slate-950/90"></div>
          
          {/* Subtle noise texture for premium feel */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Smooth transition to main content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Welcome Message for Logged In Users */}
          {user && (
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-xl">
                Tere tulemast, {user.name}!
              </h3>
              <p className="text-xl text-slate-300 drop-shadow-lg">
                Valmis uuteks väljakutseteks? Vaadake meie uusimaid võistlusi ja alustage oma rallikarjääri!
              </p>
            </div>
          )}

          {/* Hero Section */}
          <HeroSection 
            user={user}
            onOpenAuth={handleOpenAuth}
            onDashboard={handleDashboard}
          />

          {/* Features Section - NOW WITH EDETABEL */}
          <FeaturesSection
            onOpenCompetitions={() => setIsCompetitionsModalOpen(true)}
            showDynamicData={true} // Näitab reaalseid andmeid
            showEdetabelModal={true} // Käsitseb modali ise
          />

          {/* Supporters Section */}
          <SupportersSection />

          {/* Social Media Section */}
          <SocialMediaSection />
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

      {/* Competitions Modal */}
      <CompetitionsModal
        isOpen={isCompetitionsModalOpen}
        onClose={() => setIsCompetitionsModalOpen(false)}
        rallies={upcomingRallies}
        isLoading={isLoadingRallies}
      />

      {/* NEW: Edetabel Modal */}
      <EdetabelModal
        isOpen={isEdetabelModalOpen}
        onClose={() => setIsEdetabelModalOpen(false)}
      />
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}