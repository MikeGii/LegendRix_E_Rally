// src/components/navigation/BurgerMenu.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
import React, { useState, useRef, useEffect } from 'react'

interface BurgerMenuProps {
  user: any
  onLogout: () => Promise<void>
}

export function BurgerMenu({ user, onLogout }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await onLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      setIsOpen(false)
    }
  }

  const navigateTo = (path: string) => {
    setIsOpen(false)
    window.location.href = path
  }

  // Base menu items for all users
  const baseMenuItems = [
    {
      icon: '🏠',
      label: 'Pealeht',
      description: 'Avalehele tagasi',
      action: () => navigateTo('/'),
      priority: 'primary'
    },
    {
      icon: '📊',
      label: 'Töölaud', 
      description: 'Kasutaja töölaud',
      action: () => navigateTo('/user-dashboard'),
      priority: 'primary'
    },
    {
      icon: '👥',
      label: 'Tiimid',
      description: 'Tiimide haldamine',
      action: () => navigateTo('/teams'),
      priority: 'primary'
    },
    {
      icon: '🏁',
      label: 'Registreeri Rallile',
      description: 'Uue ralli registreerimine',
      action: () => navigateTo('/registration'),
      priority: 'primary'
    },
    {
      icon: '📜',
      label: 'Reeglid',
      description: 'Platvormi reeglid ja tingimused',
      action: () => navigateTo('/rules'),
      priority: 'primary'
    },
    {
      icon: '💬',
      label: 'Foorum',
      description: 'Kogukonna arutelud',
      action: () => navigateTo('/forum'),
      priority: 'primary'
    },
    {
      icon: '⚙️',
      label: 'Kasutaja Sätted',
      description: 'Profiili ja eelistuste haldamine',
      action: () => navigateTo('/user-settings'),
      priority: 'secondary'
    }
  ]

  // Add admin-only items if user is admin
  const adminOnlyItems = user?.role === 'admin' ? [
    {
      icon: '🎲',
      label: 'Genereeri ralli!',
      description: 'Genereeri automaatselt uus ralli',
      action: () => navigateTo('/generate-rally'),
      priority: 'primary'
    }
  ] : []

  // Combine menu items - insert admin items after teams but before registration
  const menuItems = [
    ...baseMenuItems.slice(0, 3), // Home, Dashboard, Teams
    ...adminOnlyItems,
    ...baseMenuItems.slice(3) // Registration, Settings
  ]

  return (
    <div className="relative" ref={menuRef}>
      {/* Futuristic Burger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center
          ${isOpen 
            ? 'bg-red-600/20 border-2 border-red-500/50 shadow-[0_0_20px_rgba(255,0,64,0.5)]' 
            : 'bg-gray-900/50 hover:bg-gray-800/70 border border-gray-800 hover:border-red-500/30'
          }
          backdrop-blur-xl hover:scale-105 group
        `}
        aria-label="Navigation menu"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`
            block w-5 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-sm transition-all duration-300 transform origin-center
            ${isOpen ? 'rotate-45 translate-y-1.5' : ''}
          `} />
          <span className={`
            block w-5 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-sm transition-all duration-300 mt-1
            ${isOpen ? 'opacity-0 scale-0' : ''}
          `} />
          <span className={`
            block w-5 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-sm transition-all duration-300 transform origin-center mt-1
            ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}
          `} />
        </div>
      </button>

      {/* Futuristic Menu Panel */}
      <div className={`
        absolute top-14 right-0 w-80 transition-all duration-300 transform z-50
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }
      `}>
        <div className="tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden bg-black/95">
          {/* Header with User Info */}
          <div className="px-6 py-4 bg-gradient-to-r from-red-900/20 to-gray-900/20 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,64,0.4)]">
                <span className="text-white font-bold text-sm font-['Orbitron']">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm font-['Orbitron']">{user.name}</p>
                <p className="text-gray-400 text-xs">
                  {user.player_name && `🎮 ${user.player_name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="py-2">
            {/* Primary Items */}
            {menuItems.filter(item => item.priority === 'primary').map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full px-6 py-4 text-left hover:bg-gray-900/50 transition-all duration-200 group flex items-center space-x-4 border-b border-gray-900"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200 group-hover:animate-pulse">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-red-400 transition-colors font-['Orbitron'] uppercase tracking-wide text-sm">
                    {item.label}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.description}
                  </p>
                </div>
                <span className="text-gray-600 group-hover:text-red-400 transition-colors text-xl">
                  →
                </span>
              </button>
            ))}

            {/* Divider */}
            <div className="mx-6 my-2 border-t border-gray-800" />
            <div className="px-6 py-1">
              <p className="text-xs text-gray-600 uppercase tracking-wider font-['Orbitron']">
                Seaded
              </p>
            </div>

            {/* Secondary Items */}
            {menuItems.filter(item => item.priority === 'secondary').map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full px-6 py-3 text-left hover:bg-gray-900/50 transition-all duration-200 group flex items-center space-x-4"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-red-400 transition-colors font-['Orbitron'] uppercase tracking-wide text-sm">
                    {item.label}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.description}
                  </p>
                </div>
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
                  →
                </span>
              </button>
            ))}

            {/* Logout Button - Futuristic Style */}
            <div className="mx-6 my-2 border-t border-gray-800" />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-6 py-4 text-left hover:bg-red-900/20 transition-all duration-200 group flex items-center space-x-4 disabled:opacity-50 border-t border-gray-800"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200 text-red-400">
                🚪
              </span>
              <div className="flex-1">
                <p className="text-red-400 font-['Orbitron'] uppercase tracking-wide text-sm font-bold group-hover:text-red-300 transition-colors">
                  {isLoggingOut ? 'Väljun...' : 'Logi Välja'}
                </p>
                <p className="text-gray-600 text-xs">
                  Välju süsteemist
                </p>
              </div>
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-red-400 group-hover:text-red-300 transition-colors">
                  →
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}