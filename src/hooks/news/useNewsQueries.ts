// src/hooks/news/useNewsQueries.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NewsArticle } from '@/types/news'

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

export function usePublicLatestNews(limit: number = 3) {
  return useQuery({
    queryKey: newsKeys.latest(limit),
    queryFn: async (): Promise<NewsArticle[]> => {
      console.log(`🔄 Loading latest ${limit} news articles...`)
      
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
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error loading latest news:', error)
        throw error
      }

      const transformedData = (data || []).map(transformNewsData)
      console.log(`✅ Loaded ${transformedData.length} news articles`)
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
        if (error.code === 'PGRST116') return null // Not found
        console.error('Error loading news article:', error)
        throw error
      }

      return transformNewsData(data)
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual articles
  })
}

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
        console.error('Error loading all news:', error)
        throw error
      }

      const transformedData = (data || []).map(transformNewsData)
      console.log(`✅ Loaded ${transformedData.length} news articles for admin`)
      return transformedData
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin list
  })
}