// src/components/shared/index.tsx - Working shared components for UserManagement

import { ReactNode } from 'react'

// ============= Simple Page Header =============
interface PageHeaderProps {
  title: string
  description: string
  backUrl?: string
  backLabel?: string
  stats?: Array<{ label: string; value: number; color?: string }>
}

export function PageHeader({ title, description, backUrl, backLabel = 'Back', stats }: PageHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            {backUrl && (
              <button
                onClick={() => window.location.href = backUrl}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <span>←</span>
                <span>{backLabel}</span>
              </button>
            )}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          <p className="text-slate-400">{description}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============= Simple Search Bar =============
interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  resultsCount: number
  onRefresh?: () => void
  isLoading?: boolean
}

export function SearchBar({ searchTerm, onSearchChange, resultsCount, onRefresh, isLoading }: SearchBarProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-slate-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-slate-400 text-sm">
          {resultsCount} users found
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '↻'} Refresh
          </button>
        )}
      </div>
    </div>
  )
}

// ============= Simple User Table =============
interface UserTableProps {
  users: any[]
  isLoading?: boolean
  onAction?: (type: string, user: any) => void
  actionLoading?: string | null
  showApprovalActions?: boolean
}

export function UserTable({ users, isLoading, onAction, actionLoading, showApprovalActions }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
        <p className="text-slate-400">No users match your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">User</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Role</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Status</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Created</th>
              <th className="text-left p-4 font-medium text-slate-300 bg-slate-800/30">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                index={index}
                onAction={onAction}
                actionLoading={actionLoading}
                showApprovalActions={showApprovalActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============= User Table Row =============
function UserTableRow({ user, index, onAction, actionLoading, showApprovalActions }: any) {
  return (
    <tr className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-all duration-200 ${
      index % 2 === 0 ? 'bg-slate-800/10' : ''
    }`}>
      {/* User Info */}
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
        </span>
      </td>

      {/* Status */}
      <td className="p-4">
        <div className="flex flex-col space-y-1">
          <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${
            user.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            user.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            user.status === 'pending_approval' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {user.status.replace('_', ' ').toUpperCase()}
          </span>
          {!user.email_verified && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded w-fit">
              Email Pending
            </span>
          )}
        </div>
      </td>

      {/* Created Date */}
      <td className="p-4">
        <span className="text-slate-300 text-sm">
          {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </td>

      {/* Actions */}
      <td className="p-4">
        {showApprovalActions && user.status === 'pending_approval' && user.email_verified ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onAction?.('approve', user)}
              disabled={actionLoading === user.id}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              {actionLoading === user.id ? '⏳' : '✅'} Approve
            </button>
            <button
              onClick={() => onAction?.('reject', user)}
              disabled={actionLoading === user.id}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              {actionLoading === user.id ? '⏳' : '❌'} Reject
            </button>
          </div>
        ) : showApprovalActions && !user.email_verified ? (
          <button
            disabled
            className="px-3 py-1 bg-gray-600 text-gray-400 rounded text-sm font-medium cursor-not-allowed opacity-50"
            title="User must verify email first"
          >
            📧 Email Required
          </button>
        ) : (
          <UserActions user={user} onAction={onAction} actionLoading={actionLoading} />
        )}
      </td>
    </tr>
  )
}

// ============= User Actions Dropdown =============
function UserActions({ user, onAction, actionLoading }: any) {
  return (
    <div className="relative group">
      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
        ⋯
      </button>
      
      <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[160px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        {user.role !== 'admin' && (
          <button
            onClick={() => onAction?.('make_admin', user)}
            disabled={actionLoading === user.id}
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            👑 Make Admin
          </button>
        )}
        <button
          onClick={() => onAction?.('delete', user)}
          disabled={actionLoading === user.id}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
        >
          🗑️ Delete Account
        </button>
      </div>
    </div>
  )
}

// ============= Simple Confirmation Modal =============
interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function SimpleModal({ isOpen, onClose, title, children }: SimpleModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}