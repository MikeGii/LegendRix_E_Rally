// src/types/index.ts - CLEANED VERSION - Remove all unwanted properties

import { ReactNode } from 'react'

// ============= User Types =============
export interface User {
  id: string
  name: string
  email: string
  player_name?: string
  role: 'user' | 'admin'
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
  verification_token?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface UserStats {
  totalUsers: number
  pendingEmail: number
  pendingApproval: number
  approved: number
  rejected: number
}

// ============= Game Management Types - CLEANED =============
export interface Game {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameType {
  id: string
  game_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameEvent {
  id: string
  game_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventTrack {
  id: string
  event_id: string
  name: string
  length_km?: number
  surface_type?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameClass {
  id: string
  game_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============= Rally Types - CLEANED =============
export interface Rally {
  id: string
  name: string
  description?: string
  game_id: string
  game_type_id: string
  competition_date: string
  registration_deadline: string
  max_participants?: number
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
  rules?: string
  is_featured: boolean
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  // Computed/joined fields
  game_name?: string
  game_type_name?: string
  registered_participants?: number
  total_events?: number
  total_tracks?: number
}

export interface RallyRegistration {
  id: string
  rally_id: string
  user_id: string
  class_id: string
  registration_date: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'disqualified' | 'completed'
  created_at: string
  updated_at: string
  // Joined fields
  user_name?: string
  user_email?: string
  user_player_name?: string
  class_name?: string
  rally_name?: string
}

export interface RallyEventDetail {
  id: string
  event_id: string
  event_name: string
  event_order: number
  tracks: RallyTrackDetail[]
}

export interface RallyTrackDetail {
  id: string
  track_id: string
  track_name: string
  track_order: number
  length_km?: number
  surface_type?: string
}

export interface RallyClassDetail {
  id: string
  class_id: string
  class_name: string
  max_participants?: number
  registered_count?: number
}

// ============= API Response Types =============
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============= Form Types =============
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  playerName: string
  agreeToRules: boolean
}

export interface UserActionParams {
  userId: string
  action: 'approve' | 'reject' | 'delete' | 'make_admin'
  reason?: string
}

// ============= UI Component Types =============
export interface StatusMessage {
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
  icon: string
  color: 'green' | 'yellow' | 'blue' | 'red'
}

export interface Tab {
  id: string
  label: string
  icon: string
  count?: number
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  children?: ReactNode
}

export interface FormComponentProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

// ============= View Types =============
export type ViewMode = 'admin' | 'user'

export interface DashboardLayoutProps {
  children: ReactNode
}

// ============= Query and Database Types =============
export interface QueryKeys {
  all: readonly string[]
  lists: () => readonly string[]
  list: (filters?: any) => readonly (string | any)[]
  details: () => readonly string[]
  detail: (id: string) => readonly string[]
}

export type DatabaseTable = 
  | 'users' 
  | 'rallies' 
  | 'games' 
  | 'game_types' 
  | 'game_events' 
  | 'event_tracks' 
  | 'game_classes' 
  | 'rally_registrations'

export type OrderDirection = 'asc' | 'desc'
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in'

export interface SortConfig {
  field: string
  direction: OrderDirection
}

export interface FilterConfig {
  field: string
  operator: FilterOperator
  value: any
}

// ============= Constants - CLEANED =============
export const ROUTES = {
  HOME: '/',
  ADMIN_DASHBOARD: '/admin-dashboard',
  USER_DASHBOARD: '/user-dashboard',
  USER_MANAGEMENT: '/user-management',
  GAME_MANAGEMENT: '/game-management',
  RALLY_MANAGEMENT: '/rally-management',
  DEBUG_AUTH: '/debug-auth'
} as const

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const

export const USER_STATUSES = {
  PENDING_EMAIL: 'pending_email',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const RALLY_STATUSES = {
  UPCOMING: 'upcoming',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const REGISTRATION_STATUSES = {
  REGISTERED: 'registered',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  DISQUALIFIED: 'disqualified',
  COMPLETED: 'completed'
} as const