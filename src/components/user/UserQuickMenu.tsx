// src/components/user/UserQuickMenu.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface QuickMenuItem {
  label: string
  icon: string
  path: string
  description: string
  color: 'red' | 'gray' | 'gradient'
}

export function UserQuickMenu() {
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const menuItems: QuickMenuItem[] = [
    {
      label: 'Pealeht',
      icon: '🏠',
      path: '/',
      description: 'Tagasi pealehele',
      color: 'gradient'
    },
    {
      label: 'Rallid',
      icon: '🏁',
      path: '/registration',
      description: 'Vaata võistlusi',
      color: 'red'
    },
    {
      label: 'Tiimid',
      icon: '👥',
      path: '/teams',
      description: 'Vaata ja halda tiime',
      color: 'gray'
    },
    {
      label: 'Kasutaja sätted',
      icon: '⚙️',
      path: '/user-settings',
      description: 'Muuda oma profiili',
      color: 'gray'
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const getCardStyle = (color: string, isHovered: boolean) => {
    const baseStyle = "group relative p-4 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer transform"
    
    switch (color) {
      case 'red':
        return `${baseStyle} bg-gradient-to-br from-gray-900/50 to-red-900/20 border-gray-800 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] hover:scale-105`
      case 'gradient':
        return `${baseStyle} bg-gradient-to-br from-red-900/20 to-gray-900/50 border-gray-800 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(255,0,64,0.4)] hover:scale-105`
      default:
        return `${baseStyle} bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-800 hover:border-gray-600 hover:shadow-[0_0_15px_rgba(156,163,175,0.2)] hover:scale-105`
    }
  }

  return (
    <div className="user-quick-menu-container">
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl p-6 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orb for depth */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {menuItems.map((item, index) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            className={getCardStyle(item.color, hoveredItem === item.path)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Animated sweep effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
            
            {/* Glow effect for special items */}
            {item.color === 'red' && (
              <div className="absolute inset-0 bg-red-600/5 rounded-xl blur-md group-hover:bg-red-600/10 transition-all duration-300 pointer-events-none"></div>
            )}
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon with animation */}
              <div className="mb-3 relative">
                <span className="text-3xl block group-hover:scale-125 transition-transform duration-300">
                  {item.icon}
                </span>
                {hoveredItem === item.path && (
                  <div className="absolute inset-0 animate-ping">
                    <span className="text-3xl block opacity-40">
                      {item.icon}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Text content */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors font-['Orbitron'] uppercase tracking-wider">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors hidden sm:block">
                  {item.description}
                </p>
              </div>
            </div>
            
            {/* Hover indicator arrow */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            {/* Corner accent for gradient cards */}
            {item.color === 'gradient' && (
              <>
                <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-red-500 to-transparent opacity-50"></div>
                <div className="absolute top-0 left-0 h-8 w-px bg-gradient-to-b from-red-500 to-transparent opacity-50"></div>
              </>
            )}
          </button>
        ))}
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
    </div>
    </div>
  )
}