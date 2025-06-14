// src/types/game.ts - CLEANED VERSION - Remove all unwanted properties
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

export interface GameClass {
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

// Form data types - CLEANED
export interface GameFormData {
  name: string
}

export interface GameTypeFormData {
  game_id: string
  name: string
}

export interface GameEventFormData {
  game_id: string
  name: string
}

export interface GameClassFormData {
  game_id: string
  name: string
}

export interface EventTrackFormData {
  event_id: string
  name: string
  length_km?: number
  surface_type?: string
}