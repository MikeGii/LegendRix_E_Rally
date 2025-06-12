// src/components/shared/Table.tsx - Reusable table components

import { ReactNode } from 'react'
import { getStatusColor, formatDateTime } from '@/lib/statusUtils'

// ============= Base Table Structure =============
interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
  className?: string
}

interface BaseTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function BaseTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = "No data available",
  emptyIcon = "📄",
  onRowClick,
  className = ""
}: BaseTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">{emptyIcon}</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Data</h3>
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className={`text-left p-4 font-medium text-slate-300 bg-slate-800/30 ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-slate-700/30 transition-all duration-200 ${
                  onRowClick ? 'hover:bg-slate-800/30 cursor-pointer' : 'hover:bg-slate-800/20'
                } ${index % 2 === 0 ? 'bg-slate-800/10' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={`p-4 ${column.className || ''}`}>
                    {column.render ? 
                      column.render(item, index) : 
                      getNestedValue(item, String(column.key))
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============= User Table =============
interface UserTableProps {
  users: any[]
  isLoading?: boolean
  onAction?: (type: string, user: any) => void
  actionLoading?: string | null
  showApprovalActions?: boolean
}

export function UserTable({ 
  users, 
  isLoading, 
  onAction, 
  actionLoading, 
  showApprovalActions = false 
}: UserTableProps) {
  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'User',
      render: (user) => (
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
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <div className="flex flex-col space-y-1">
          <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${getStatusColor(user.status, 'user')}`}>
            {user.status.replace('_', ' ').toUpperCase()}
          </span>
          {!user.email_verified && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded w-fit">
              Email Pending
            </span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (user) => (
        <span className="text-slate-300 text-sm">
          {formatDateTime(user.created_at, { includeTime: true })}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <UserActions 
          user={user} 
          onAction={onAction} 
          actionLoading={actionLoading}
          showApprovalActions={showApprovalActions}
        />
      )
    }
  ]

  return (
    <BaseTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No users found"
      emptyIcon="👤"
    />
  )
}

// ============= Rally Table =============
interface RallyTableProps {
  rallies: any[]
  isLoading?: boolean
  onEdit?: (rally: any) => void
  onDelete?: (rally: any) => void
}

export function RallyTable({ rallies, isLoading, onEdit, onDelete }: RallyTableProps) {
  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Rally',
      render: (rally) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <span className="text-green-300 text-xl">🏁</span>
          </div>
          <div>
            <h3 className="font-bold text-white">{rally.name}</h3>
            <p className="text-sm text-slate-400">{rally.game_name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (rally) => (
        <div className="space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status, 'rally')}`}>
            {rally.status.replace('_', ' ').toUpperCase()}
          </span>
          {rally.is_featured && (
            <span className="block px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium w-fit">
              ⭐ FEATURED
            </span>
          )}
        </div>
      )
    },
    {
      key: 'competition_date',
      header: 'Date',
      render: (rally) => (
        <div className="text-sm">
          <p className="text-white">{formatDateTime(rally.competition_date, { includeTime: true })}</p>
          <p className="text-slate-400">
            Reg: {formatDateTime(rally.registration_deadline, { short: true, includeTime: true })}
          </p>
        </div>
      )
    },
    {
      key: 'participants',
      header: 'Participants',
      render: (rally) => (
        <div className="text-sm">
          <p className="text-white">
            {rally.registered_participants || 0} / {rally.max_participants || '∞'}
          </p>
          <p className="text-slate-400">
            {rally.total_events || 0} events, {rally.total_tracks || 0} tracks
          </p>
        </div>
      )
    },
    {
      key: 'prize',
      header: 'Prize',
      render: (rally) => (
        <div className="text-sm">
          {rally.prize_pool && rally.prize_pool > 0 && (
            <p className="text-green-400 font-medium">€{rally.prize_pool}</p>
          )}
          {rally.entry_fee && rally.entry_fee > 0 && (
            <p className="text-slate-300">€{rally.entry_fee} entry</p>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rally) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(rally)
            }}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
            title="Edit Rally"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(rally)
            }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
            title="Delete Rally"
          >
            🗑️
          </button>
        </div>
      )
    }
  ]

  return (
    <BaseTable
      data={rallies}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No rallies found"
      emptyIcon="🏁"
      onRowClick={onEdit}
    />
  )
}

// ============= User Actions Component =============
interface UserActionsProps {
  user: any
  onAction?: (type: string, user: any) => void
  actionLoading?: string | null
  showApprovalActions?: boolean
}

function UserActions({ user, onAction, actionLoading, showApprovalActions }: UserActionsProps) {
  if (showApprovalActions && user.status === 'pending_approval' && user.email_verified) {
    return (
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
    )
  }

  if (showApprovalActions && !user.email_verified) {
    return (
      <button
        disabled
        className="px-3 py-1 bg-gray-600 text-gray-400 rounded text-sm font-medium cursor-not-allowed opacity-50"
        title="User must verify email first"
      >
        📧 Email Required
      </button>
    )
  }

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

// ============= Utility Functions =============
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}