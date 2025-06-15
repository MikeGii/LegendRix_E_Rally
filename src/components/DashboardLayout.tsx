'use client'

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
      '/results',        // ← ADD THIS LINE
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
      {/* Enhanced Navigation Header */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left Section: Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl backdrop-blur-sm flex items-center justify-center border border-blue-400/20">
                <span className="text-blue-400 font-bold text-lg">🏁</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white tracking-wide">LegendRix E-Rally</h1>
                <p className="text-xs text-slate-400 -mt-1">
                  {actualCurrentView === 'admin' ? 'Admin Panel' : 'Kasutaja Töölaud'}
                </p>
              </div>
            </div>
            
            {/* Right Section: View Switcher + Burger Menu */}
            <div className="flex items-center space-x-4">
              {/* View Switcher for Admins */}
              {canSwitchView && (
                <div className="hidden md:flex bg-slate-700/50 rounded-xl p-1">
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
                    className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
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