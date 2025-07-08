'use client'

import { ReactNode } from 'react'
import '@/styles/futuristic-theme.css'

interface ForumLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function ForumLayout({ children, sidebar }: ForumLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      {sidebar && (
        <aside className="hidden lg:block lg:w-80">
          {sidebar}
        </aside>
      )}
    </div>
  )
}