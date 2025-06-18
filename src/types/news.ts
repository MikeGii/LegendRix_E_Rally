// src/types/news.ts

export interface NewsArticle {
  id: string
  title: string
  content: string
  cover_image_url?: string
  cover_image_alt?: string
  is_published: boolean
  is_featured: boolean
  created_by?: string
  created_at: string
  updated_at: string
  published_at?: string
  // Joined data from relations
  author_name?: string
  users?: any // For handling the nested user data from supabase joins
}

export interface CreateNewsInput {
  title: string
  content: string
  cover_image_url?: string
  cover_image_alt?: string
  is_published?: boolean
  is_featured?: boolean
}

export interface UpdateNewsInput extends Partial<CreateNewsInput> {
  id: string
}

export interface NewsPreview {
  title: string
  content: string
  cover_image_url?: string
  cover_image_alt?: string
}

// For landing page compact view
export interface NewsCompact {
  id: string
  title: string
  cover_image_url?: string
  created_at: string
}