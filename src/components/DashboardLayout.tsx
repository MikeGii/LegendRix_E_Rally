// src/components/DashboardLayout.tsx - Updated with Unified Header Design
'use client'

import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { useView } from './ViewProvider'
import { BurgerMenu } from './navigation/BurgerMenu'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { currentView, setCurrentView, canSwitchView } = useView()

  const handleLogout = async () => {
    console.log('🚪 Dashboard logout initiated...')
    
    try {
      // Clear all auth state first
      await logout()
      
      // Clear any remaining session data completely
      if (typeof window !== 'undefined') {
        // Clear all localStorage
        window.localStorage.clear()
        // Clear sessionStorage  
        window.sessionStorage.clear()
        // Clear specific supabase auth keys
        window.localStorage.removeItem('supabase.auth.token')
        window.localStorage.removeItem('sb-localhost-auth-token')
        window.localStorage.removeItem('sb-' + window.location.hostname + '-auth-token')
      }
      
      console.log('✅ Dashboard logout completed, redirecting to main page...')
      
      // Redirect to main page with a hard navigation to ensure clean state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Dashboard logout error:', error)
      // Force redirect even if logout fails
      window.location.href = '/'
    }
  }

  // FIXED: Handle view switching with actual routing
  const handleViewSwitch = (view: 'admin' | 'user') => {
    if (view === 'admin') {
      // Navigate to admin dashboard
      window.location.href = '/admin-dashboard'
    } else {
      // Navigate to user dashboard
      window.location.href = '/user-dashboard'
    }
  }

  // FIXED: Determine current view based on current URL with proper defaults
  const getCurrentView = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      
      // List of all admin pages that should show "Admin" in the view switcher
      const adminPages = [
        '/admin-dashboard',
        '/user-management', 
        '/game-management',
        '/rally-management',
        '/news-management', // ← ADD NEWS MANAGEMENT PAGE
        '/championships',
        '/results',
        '/participant-linking',
        '/sponsors'
      ]
      
      // Check if current path is any admin page
      if (adminPages.some(page => pathname.includes(page))) {
        return 'admin'
      } else {
        // Default to 'user' for user-dashboard and other pages
        return 'user'
      }
    }
    return 'user' // Default to user view
  }

  const actualCurrentView = getCurrentView()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      {/* Enhanced Navigation Header - NOW WITH UNIFIED DESIGN */}
      <nav className="sticky top-0 z-30">
        {/* Background with blur effect - matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/80 to-transparent backdrop-blur-2xl border-b border-white/5 shadow-2xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-20 py-6">
            {/* Left Section: Logo - EXACTLY LIKE LANDING PAGE */}
            <div className="flex items-center space-x-4">
              <a 
                href="/"
                className="flex items-center space-x-4 group"
              >
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-1 group-hover:ring-white/30 transition-all">
                  <div className="w-full h-full rounded-xl overflow-hidden relative">
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
              </a>
            </div>
            
            {/* Right Section: View Switcher + Burger Menu */}
            <div className="flex items-center space-x-4">
              {/* View Switcher for Admins */}
              {canSwitchView && (
                <div className="hidden md:flex bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    onClick={() => handleViewSwitch('user')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      actualCurrentView === 'user'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>🏁</span>
                      <span>Driver</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleViewSwitch('admin')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      actualCurrentView === 'admin'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>👑</span>
                      <span>Admin</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Mobile View Switcher */}
              {canSwitchView && (
                <div className="md:hidden">
                  <button
                    onClick={() => handleViewSwitch(actualCurrentView === 'admin' ? 'user' : 'admin')}
                    className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    {actualCurrentView === 'admin' ? '🏁' : '👑'}
                  </button>
                </div>
              )}

              {/* Burger Menu */}
              <BurgerMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  )
}