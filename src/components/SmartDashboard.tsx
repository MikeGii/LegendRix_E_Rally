'use client'

import { useAuth } from './AuthProvider'
import { useView } from './ViewProvider'
import { AdminDashboard } from './AdminDashboard'
import { UserDashboard } from './UserDashboard'

export function SmartDashboard() {
const { user, loading } = useAuth()
const { currentView } = useView()

if (loading || !user) {
    return <div>Loading...</div>
}

  // For regular users, always show user dashboard
  if (user.role === 'user') {
    return <UserDashboard />
  }

  // For admins, show dashboard based on current view
  if (user.role === 'admin') {
    if (currentView === 'admin') {
      return <AdminDashboard />
    } else {
      return <UserDashboard />
    }
  }

  // Fallback
  return <UserDashboard />
}