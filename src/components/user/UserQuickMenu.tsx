// src/components/user/UserQuickMenu.tsx
'use client'

import { useRouter } from 'next/navigation'

interface QuickMenuItem {
  label: string
  icon: string
  path: string
  description: string
}

export function UserQuickMenu() {
  const router = useRouter()

  const menuItems: QuickMenuItem[] = [
    {
      label: 'Pealeht',
      icon: '🏠',
      path: '/',
      description: 'Tagasi pealehele'
    },
    {
      label: 'Rallid',
      icon: '🏁',
      path: '/registration',
      description: 'Vaata võistlusi'
    },
    {
      label: 'Tiimid',
      icon: '👥',
      path: '/teams',
      description: 'Vaata ja halda tiime'
    },
    {
      label: 'Kasutaja sätted',
      icon: '⚙️',
      path: '/user-settings',
      description: 'Muuda oma profiili'
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className="group relative p-3 bg-slate-900/50 hover:bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 text-left"
          >
            {/* Icon and Label */}
            <div className="flex items-center space-x-2">
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                  {item.label}
                </h4>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:block">
                  {item.description}
                </p>
              </div>
            </div>
            
            {/* Hover effect arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}