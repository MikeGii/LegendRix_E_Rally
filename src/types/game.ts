// src/types/game.ts - Universal Game Types
export interface Game {
  id: string
  name: string
  developer: string
  platform: string
  release_year: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameType {
  id: string
  game_id: string
  name: string
  description?: string
  max_participants?: number
  min_participants: number
  duration_minutes?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameEvent {
  id: string
  game_id: string
  name: string
  location: string
  description?: string
  event_date: string
  max_participants?: number
  registration_deadline: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameClass {
  id: string
  game_id: string
  name: string
  description?: string
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  car_requirements?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventTrack {
  id: string
  event_id: string
  name: string
  stage_number: number
  distance_km: number
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  surface_type: string
  special_notes?: string
  created_at: string
  updated_at: string
}

// Form data types
export interface GameFormData {
  name: string
  developer: string
  platform: string
  release_year: number
  description?: string
}

export interface GameTypeFormData {
  game_id: string
  name: string
  description?: string
  max_participants?: number
  min_participants: number
  duration_minutes?: number
}

export interface GameEventFormData {
  game_id: string
  name: string
  location: string
  description?: string
  event_date: string
  max_participants?: number
  registration_deadline: string
}

export interface GameClassFormData {
  game_id: string
  name: string
  description?: string
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  car_requirements?: string
}