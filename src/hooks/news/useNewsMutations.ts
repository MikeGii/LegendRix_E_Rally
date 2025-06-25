// src/hooks/news/useNewsMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CreateNewsInput, UpdateNewsInput, NewsArticle } from '@/types/index'
import { newsKeys } from './useNewsQueries'

// Transform supabase response to proper NewsArticle format
const transformNewsData = (data: any): NewsArticle => ({
  ...data,
  author_name: Array.isArray(data.users) && data.users.length > 0 
    ? data.users[0].name 
    : undefined,
  users: undefined, // Remove nested object
})

export function useCreateNews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newsData: CreateNewsInput): Promise<NewsArticle> => {
      console.log('🔄 Creating news article:', newsData.title)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare data for insertion
      const insertData = {
        title: newsData.title,
        content: newsData.content,
        cover_image_url: newsData.cover_image_url || null,
        cover_image_alt: newsData.cover_image_alt || null,
        is_published: newsData.is_published || false,
        is_featured: newsData.is_featured || false,
        created_by: user.id,
        // Set published_at only if publishing
        published_at: newsData.is_published ? new Date().toISOString() : null,
      }

      console.log('📝 Insert data:', insertData)

      const { data, error } = await supabase
        .from('news')
        .insert([insertData])
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)
        .single()

      if (error) {
        console.error('❌ Error creating news article:', error)
        throw new Error(`Failed to create news: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from news creation')
      }

      const transformedData = transformNewsData(data)
      console.log('✅ News article created successfully:', transformedData.title)
      return transformedData
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after news creation')
      // Invalidate all news queries to refresh data
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      // Set the new data in cache
      queryClient.setQueryData(newsKeys.detail(data.id), data)
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
      console.log('🔄 Updating news article:', id, updateData)

      // Prepare update data
      const updatePayload: any = {
        ...updateData,
        updated_at: new Date().toISOString()
      }

      // Set published_at when first publishing (if not already set)
      if (updateData.is_published) {
        // Get current article to check if it's already published
        const { data: currentData } = await supabase
          .from('news')
          .select('published_at')
          .eq('id', id)
          .single()

        // Only set published_at if it's not already set
        if (currentData && !currentData.published_at) {
          updatePayload.published_at = new Date().toISOString()
        }
      }

      console.log('📝 Update payload:', updatePayload)

      const { data, error } = await supabase
        .from('news')
        .update(updatePayload)
        .eq('id', id)
        .select(`
          *,
          users!news_created_by_fkey(name)
        `)
        .single()

      if (error) {
        console.error('❌ Error updating news article:', error)
        throw new Error(`Failed to update news: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from news update')
      }

      const transformedData = transformNewsData(data)
      console.log('✅ News article updated successfully:', transformedData.title)
      return transformedData
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after news update')
      // Invalidate all news queries
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      // Update specific article in cache
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
        console.error('❌ Error deleting news article:', error)
        throw new Error(`Failed to delete news: ${error.message}`)
      }

      console.log('✅ News article deleted successfully')
    },
    onSuccess: (_, deletedId) => {
      console.log('🔄 Invalidating queries after news deletion')
      // Invalidate all news queries and remove from cache
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      queryClient.removeQueries({ queryKey: newsKeys.detail(deletedId) })
    },
    onError: (error) => {
      console.error('❌ News deletion failed:', error)
    }
  })
}

// Bulk operations
export function useBulkUpdateNews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: { id: string; updates: Partial<CreateNewsInput> }[]): Promise<NewsArticle[]> => {
      console.log('🔄 Bulk updating news articles:', updates.length)

      const results: NewsArticle[] = []

      for (const { id, updates: updateData } of updates) {
        const updatePayload = {
          ...updateData,
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('news')
          .update(updatePayload)
          .eq('id', id)
          .select(`
            *,
            users!news_created_by_fkey(name)
          `)
          .single()

        if (error) {
          console.error(`❌ Error updating news article ${id}:`, error)
          throw new Error(`Failed to update news ${id}: ${error.message}`)
        }

        if (data) {
          results.push(transformNewsData(data))
        }
      }

      console.log('✅ Bulk update completed:', results.length)
      return results
    },
    onSuccess: () => {
      console.log('🔄 Invalidating all queries after bulk update')
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
    },
    onError: (error) => {
      console.error('❌ Bulk update failed:', error)
    }
  })
}

export function useBulkDeleteNews() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      console.log('🔄 Bulk deleting news articles:', ids)

      const { error } = await supabase
        .from('news')
        .delete()
        .in('id', ids)

      if (error) {
        console.error('❌ Error bulk deleting news articles:', error)
        throw new Error(`Failed to bulk delete news: ${error.message}`)
      }

      console.log('✅ Bulk delete completed')
    },
    onSuccess: (_, deletedIds) => {
      console.log('🔄 Invalidating queries after bulk deletion')
      // Invalidate all news queries
      queryClient.invalidateQueries({ queryKey: newsKeys.all })
      // Remove specific articles from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: newsKeys.detail(id) })
      })
    },
    onError: (error) => {
      console.error('❌ Bulk deletion failed:', error)
    }
  })
}