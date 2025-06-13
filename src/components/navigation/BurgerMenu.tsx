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

  const menuItems = [
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
      icon: '🏁',
      label: 'Registreeri Rallile',
      description: 'Uue ralli registreerimine',
      action: () => navigateTo('/registration'),
      priority: 'secondary'
    },
    {
      icon: '⚙️',
      label: 'Kasutaja Sätted',
      description: 'Profiili ja eelistuste haldamine',
      action: () => navigateTo('/user-settings'),
      priority: 'secondary'
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      {/* Burger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center
          ${isOpen 
            ? 'bg-blue-600/20 border-blue-400/40 shadow-lg shadow-blue-500/25' 
            : 'bg-slate-700/50 hover:bg-slate-600/70 border-slate-600/50'
          }
          backdrop-blur-xl border hover:scale-105 group
        `}
        aria-label="Navigation menu"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`
            block w-5 h-0.5 bg-white rounded-sm transition-all duration-300 transform origin-center
            ${isOpen ? 'rotate-45 translate-y-1.5' : ''}
          `} />
          <span className={`
            block w-5 h-0.5 bg-white rounded-sm transition-all duration-300 mt-1
            ${isOpen ? 'opacity-0 scale-0' : ''}
          `} />
          <span className={`
            block w-5 h-0.5 bg-white rounded-sm transition-all duration-300 transform origin-center mt-1
            ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}
          `} />
        </div>
      </button>

      {/* Menu Overlay - REMOVED: Now header stays normal and clickable */}

      {/* Menu Panel */}
      <div className={`
        absolute top-14 right-0 w-80 transition-all duration-300 transform z-50
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }
      `}>
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user.name}</p>
                <p className="text-slate-400 text-xs">
                  {user.player_name && `🎮 ${user.player_name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="py-2">
            {/* Primary Items */}
            {menuItems.filter(item => item.priority === 'primary').map((item, index) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full px-6 py-4 text-left hover:bg-slate-800/50 transition-all duration-200 group flex items-center space-x-4"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {item.description}
                  </p>
                </div>
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                  →
                </span>
              </button>
            ))}

            {/* Divider */}
            <div className="mx-6 my-2 border-t border-slate-700/50" />
            <div className="px-6 py-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Seaded
              </p>
            </div>

            {/* Secondary Items */}
            {menuItems.filter(item => item.priority === 'secondary').map((item, index) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full px-6 py-3 text-left hover:bg-slate-800/50 transition-all duration-200 group flex items-center space-x-4"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-slate-300 font-medium group-hover:text-white transition-colors">
                    {item.label}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {item.description}
                  </p>
                </div>
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                  →
                </span>
              </button>
            ))}

            {/* Logout */}
            <div className="mx-6 my-2 border-t border-slate-700/50" />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-6 py-4 text-left hover:bg-red-600/10 transition-all duration-200 group flex items-center space-x-4 disabled:opacity-50"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                🚪
              </span>
              <div className="flex-1">
                <p className="text-red-400 font-medium group-hover:text-red-300 transition-colors">
                  {isLoggingOut ? 'Välja logimas...' : 'Logi välja'}
                </p>
                <p className="text-slate-500 text-xs">
                  Lõpeta sessioon
                </p>
              </div>
              {isLoggingOut && (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}