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
      // First get all posts with user info
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users!post_creator (
            name,
            player_name
          )
        `)
        .order('post_date_time', { ascending: false })

      if (postsError) {
        console.error('Error fetching forum posts:', postsError)
        throw postsError
      }

      // Then get comment counts for each post
      const postIds = posts.map(p => p.post_id)
      const { data: commentCounts, error: countError } = await supabase
        .from('forum_comments')
        .select('post_id')
        .in('post_id', postIds)

      if (countError) {
        console.error('Error fetching comment counts:', countError)
      }

      // Count comments per post
      const countsMap = new Map<string, number>()
      commentCounts?.forEach(comment => {
        countsMap.set(comment.post_id, (countsMap.get(comment.post_id) || 0) + 1)
      })

      // Merge the counts with posts
      return posts.map(post => ({
        ...post,
        comments_count: countsMap.get(post.post_id) || 0
      }))
    },
    staleTime: 30 * 1000,
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

      // First check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error checking user role:', userError)
        throw userError
      }

      // Build the delete query
      let query = supabase
        .from('forum_posts')
        .delete()
        .eq('post_id', postId)

      // Only add creator check if not admin
      if (userData?.role !== 'admin') {
        query = query.eq('post_creator', user.id)
      }

      const { error } = await query

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