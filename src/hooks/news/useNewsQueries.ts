// src/hooks/news/useNewsQueries.ts - UPDATED FOR DATABASE SCHEMA
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NewsArticle } from '@/types/index'

// Centralized query keys
export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (filters?: any) => [...newsKeys.lists(), { filters }] as const,
  detail: (id: string) => [...newsKeys.all, 'detail', id] as const,
  public: () => [...newsKeys.all, 'public'] as const,
  latest: (limit?: number) => [...newsKeys.public(), 'latest', limit] as const,
}

// Transform supabase response to proper NewsArticle format
const transformNewsData = (data: any): NewsArticle => ({
  ...data,
  author_name: Array.isArray(data.users) && data.users.length > 0 
    ? data.users[0].name 
    : undefined,
  users: undefined, // Remove nested object
})

// ============================================================================
// PUBLIC QUERIES (for landing page)
// ============================================================================

export function usePublicLatestNews(limit: number = 3) {
  return useQuery({
    queryKey: newsKeys.latest(limit),
    queryFn: async (): Promise<NewsArticle[]> => {
      console.log(`🔄 Loading latest ${limit} published news articles...`)
      
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title,
          content,
          cover_image_url,
          cover_image_alt,
          is_published,
          is_featured,
          created_by,
          created_at,
          updated_at,
          published_at,
          users!news_created_by_fkey(name)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false }) // Fallback sort
        .limit(limit)

      if (error) {
        console.error('❌ Error loading latest news:', error)
        throw new Error(`Failed to load latest news: ${error.message}`)
      }

      const transformedData = (data || []).map(transformNewsData)
      console.log(`✅ Loaded ${transformedData.length} published news articles`)
      return transformedData
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: async (): Promise<NewsArticle | null> => {
      console.log(`🔄 Loading news article: ${id}`)
      
      if (!id) {
        return null
      }
      
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)
        .eq('id', id)
        .eq('is_published', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📰 News article not found:', id)
          return null // Article not found
        }
        console.error('❌ Error loading news article:', error)
        throw new Error(`Failed to load news article: ${error.message}`)
      }

      if (!data) {
        return null
      }

      const transformedData = transformNewsData(data)
      console.log(`✅ Loaded news article: ${transformedData.title}`)
      return transformedData
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual articles
  })
}

// ============================================================================
// ADMIN QUERIES (for admin panel)
// ============================================================================

export function useAllNewsArticles() {
  return useQuery({
    queryKey: newsKeys.list(),
    queryFn: async (): Promise<NewsArticle[]> => {
      console.log('🔄 Loading all news articles for admin...')
      
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading all news:', error)
        throw new Error(`Failed to load news articles: ${error.message}`)
      }

      const transformedData = (data || []).map(transformNewsData)
      console.log(`✅ Loaded ${transformedData.length} news articles for admin`)
      return transformedData
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin list
  })
}

// Optional: Filtered news query for admin with search/filter capabilities
export function useFilteredNewsArticles(filters?: {
  status?: 'all' | 'published' | 'draft' | 'featured'
  search?: string
  author?: string
}) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: async (): Promise<NewsArticle[]> => {
      console.log('🔄 Loading filtered news articles...', filters)
      
      let query = supabase
        .from('news')
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        switch (filters.status) {
          case 'published':
            query = query.eq('is_published', true).eq('is_featured', false)
            break
          case 'draft':
            query = query.eq('is_published', false)
            break
          case 'featured':
            query = query.eq('is_featured', true).eq('is_published', true)
            break
        }
      }

      // Apply author filter
      if (filters?.author) {
        query = query.eq('created_by', filters.author)
      }

      // Apply search filter (search in title and content)
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('❌ Error loading filtered news:', error)
        throw new Error(`Failed to load filtered news: ${error.message}`)
      }

      const transformedData = (data || []).map(transformNewsData)
      console.log(`✅ Loaded ${transformedData.length} filtered news articles`)
      return transformedData
    },
    enabled: true,
    staleTime: 1 * 60 * 1000, // 1 minute for filtered results
  })
}

// Stats query for dashboard
export function useNewsStats() {
  return useQuery({
    queryKey: [...newsKeys.all, 'stats'],
    queryFn: async () => {
      console.log('🔄 Loading news statistics...')
      
      const { data, error } = await supabase
        .from('news')
        .select('id, is_published, is_featured, created_at')

      if (error) {
        console.error('❌ Error loading news stats:', error)
        throw new Error(`Failed to load news stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        published: data?.filter(n => n.is_published && !n.is_featured).length || 0,
        draft: data?.filter(n => !n.is_published).length || 0,
        featured: data?.filter(n => n.is_featured && n.is_published).length || 0,
        thisMonth: data?.filter(n => {
          const created = new Date(n.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        }).length || 0
      }

      console.log('✅ Loaded news statistics:', stats)
      return stats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}