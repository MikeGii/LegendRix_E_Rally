'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useAuth } from './AuthProvider'

type ViewMode = 'admin' | 'user'

interface ViewContextType {
  currentView: ViewMode
  setCurrentView: (view: ViewMode) => void
  canSwitchView: boolean
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function ViewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<ViewMode>('admin')

  // Only admins can switch between views
  const canSwitchView = user?.role === 'admin'

  return (
    <ViewContext.Provider value={{
      currentView,
      setCurrentView,
      canSwitchView
    }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const context = useContext(ViewContext)
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider')
  }
  return context
}