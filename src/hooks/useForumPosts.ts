import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

export interface ForumPost {
  post_id: string
  post_title: string
  post_text: string
  post_creator: string
  post_date_time: string
  comments_count?: number
  users?: {
    name: string
    player_name: string | null
  }
}

export interface CreatePostInput {
  title: string
  content: string
}

// Query Keys
export const forumKeys = {
  all: ['forum_posts'] as const,
  lists: () => [...forumKeys.all, 'list'] as const,
  list: (filters?: any) => [...forumKeys.lists(), { filters }] as const,
  detail: (id: string) => [...forumKeys.all, 'detail', id] as const,
}

// Fetch all forum posts
export function useForumPosts() {
  return useQuery({
    queryKey: forumKeys.lists(),
    queryFn: async (): Promise<ForumPost[]> => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users!post_creator (
            name,
            player_name
          )
        `)
        .order('post_date_time', { ascending: false })

      if (error) {
        console.error('Error fetching forum posts:', error)
        throw error
      }

      return data || []
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

// Create new forum post
export function useCreateForumPost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ title, content }: CreatePostInput) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to create posts')
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          post_title: title,
          post_text: content,
          post_creator: user.id
        }])
        .select(`
          *,
          users!post_creator (
            name,
            player_name
          )
        `)
        .single()

      if (error) {
        console.error('Error creating forum post:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: forumKeys.all })
    }
  })
}

// Delete forum post
export function useDeleteForumPost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to delete posts')
      }

      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('post_id', postId)
        .eq('post_creator', user.id) // Security check

      if (error) {
        console.error('Error deleting forum post:', error)
        throw error
      }

      return postId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.all })
    }
  })
}

export function useUpdateForumPost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ postId, title, content }: { postId: string; title: string; content: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to update posts')
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .update({
          post_title: title,
          post_text: content
        })
        .eq('post_id', postId)
        .eq('post_creator', user.id) // Security check
        .select(`
          *,
          users!post_creator (
            name,
            player_name
          )
        `)
        .single()

      if (error) {
        console.error('Error updating forum post:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.all })
    }
  })
}