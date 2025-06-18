// src/hooks/useNewsManagement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NewsArticle, CreateNewsInput, UpdateNewsInput } from '@/types/news'

// Query keys for news management
export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (filters?: any) => [...newsKeys.lists(), { filters }] as const,
  detail: (id: string) => [...newsKeys.all, 'detail', id] as const,
  public: () => [...newsKeys.all, 'public'] as const,
  latest: (limit?: number) => [...newsKeys.public(), 'latest', limit] as const,
}

// ============================================================================
// PUBLIC QUERIES (for landing page)
// ============================================================================

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

      // Transform the data to include author name
      const transformedData: NewsArticle[] = (data || []).map(item => ({
        ...item,
        author_name: Array.isArray(item.users) && item.users.length > 0 ? item.users[0].name : undefined,
        users: undefined, // Remove the nested object
      }))

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
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        console.error('Error loading news article:', error)
        throw error
      }

      // Transform the data
      const transformedData: NewsArticle = {
        ...data,
        author_name: Array.isArray(data.users) && data.users.length > 0 ? data.users[0].name : undefined,
        users: undefined,
      }

      console.log(`✅ Loaded news article: ${transformedData.title}`)
      return transformedData
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// ADMIN QUERIES (for admin panel)
// ============================================================================

export function useAllNewsArticles() {
  return useQuery({
    queryKey: newsKeys.lists(),
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
        console.error('Error loading news articles:', error)
        throw error
      }

      // Transform the data
      const transformedData: NewsArticle[] = (data || []).map(item => ({
        ...item,
        author_name: Array.isArray(item.users) && item.users.length > 0 ? item.users[0].name : undefined,
        users: undefined,
      }))

      console.log(`✅ Loaded ${transformedData.length} news articles for admin`)
      return transformedData
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin
  })
}

// ============================================================================
// MUTATIONS (for admin panel)
// ============================================================================

export function useCreateNews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newsData: CreateNewsInput): Promise<NewsArticle> => {
      console.log('🔄 Creating news article:', newsData.title)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('news')
        .insert([{
          ...newsData,
          created_by: user.id,
          published_at: newsData.is_published ? new Date().toISOString() : null,
        }])
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Error creating news article:', error)
        throw error
      }

      const transformedData: NewsArticle = {
        ...data,
        author_name: Array.isArray(data.users) && data.users.length > 0 ? data.users[0].name : undefined,
        users: undefined,
      }

      console.log('✅ News article created:', transformedData.title)
      return transformedData
    },
    onSuccess: () => {
      // Invalidate all news queries to refresh data
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
    },
    onError: (error) => {
      console.error('❌ News creation failed:', error)
    }
  })
}

export function useUpdateNews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateNewsInput): Promise<NewsArticle> => {
      console.log('🔄 Updating news article:', id)

      const { data, error } = await supabase
        .from('news')
        .update({
          ...updateData,
          // Set published_at when first publishing
          ...(updateData.is_published && {
            published_at: new Date().toISOString()
          })
        })
        .eq('id', id)
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Error updating news article:', error)
        throw error
      }

      const transformedData: NewsArticle = {
        ...data,
        author_name: Array.isArray(data.users) && data.users.length > 0 ? data.users[0].name : undefined,
        users: undefined,
      }

      console.log('✅ News article updated:', transformedData.title)
      return transformedData
    },
    onSuccess: (data) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      queryClient.setQueryData(newsKeys.detail(data.id), data)
    },
    onError: (error) => {
      console.error('❌ News update failed:', error)
    }
  })
}

export function useDeleteNews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🔄 Deleting news article:', id)

      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting news article:', error)
        throw error
      }

      console.log('✅ News article deleted')
    },
    onSuccess: (_, deletedId) => {
      // Invalidate all news queries and remove from cache
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      queryClient.removeQueries({ queryKey: newsKeys.detail(deletedId) })
    },
    onError: (error) => {
      console.error('❌ News deletion failed:', error)
    }
  })
}