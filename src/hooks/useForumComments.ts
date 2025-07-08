import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { forumKeys } from './useForumPosts'

export interface ForumComment {
  comment_id: string
  user_id: string
  post_id: string
  comment_text: string
  comment_creation_time: string
  likes_count: number
  is_edited: boolean
  edit_time: string | null
  users?: {
    name: string
    player_name: string | null
  }
}

export interface CreateCommentInput {
  postId: string
  commentText: string
}

export interface CommentLike {
  id: string
  user_id: string
  comment_id: string
}

// Query Keys
export const commentKeys = {
  all: ['forum_comments'] as const,
  post: (postId: string) => [...commentKeys.all, 'post', postId] as const,
  likes: (userId: string) => ['comment-likes', userId] as const,
}

// Fetch comments for a specific post
export function usePostComments(postId: string) {
  return useQuery({
    queryKey: commentKeys.post(postId),
    queryFn: async (): Promise<ForumComment[]> => {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          users!user_id (
            name,
            player_name
          )
        `)
        .eq('post_id', postId)
        .order('comment_creation_time', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        throw error
      }

      return data || []
    },
    staleTime: 30 * 1000,
    enabled: !!postId,
  })
}

// Create new comment
export function useCreateComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ postId, commentText }: CreateCommentInput) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to create comments')
      }

      const { data, error } = await supabase
        .from('forum_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          comment_text: commentText
        }])
        .select(`
          *,
          users!user_id (
            name,
            player_name
          )
        `)
        .single()

      if (error) {
        console.error('Error creating comment:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({ queryKey: commentKeys.post(data.post_id) })
      // Invalidate forum posts to update comments count
      queryClient.invalidateQueries({ queryKey: forumKeys.all })
    }
  })
}

// Update comment
export function useUpdateComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ commentId, commentText }: { commentId: string; commentText: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to update comments')
      }

      const { data, error } = await supabase
        .from('forum_comments')
        .update({
          comment_text: commentText,
          is_edited: true
        })
        .eq('comment_id', commentId)
        .eq('user_id', user.id) // Security check
        .select(`
          *,
          users!user_id (
            name,
            player_name
          )
        `)
        .single()

      if (error) {
        console.error('Error updating comment:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.post(data.post_id) })
    }
  })
}

// Delete comment
export function useDeleteComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to delete comments')
      }

      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('comment_id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        throw error
      }

      return { commentId, postId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.post(data.postId) })
      queryClient.invalidateQueries({ queryKey: forumKeys.all })
    }
  })
}

export function useUserCommentLikes(postId: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['comment_likes', postId, user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user?.id || !postId) return new Set()

      // First get all comment IDs for this post
      const { data: comments } = await supabase
        .from('forum_comments')
        .select('comment_id')
        .eq('post_id', postId)

      if (!comments || comments.length === 0) return new Set()

      // Then get user's likes for these comments
      const commentIds = comments.map(c => c.comment_id)
      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds)

      if (error) {
        console.error('Error fetching user likes:', error)
        return new Set()
      }

      return new Set(data?.map(like => like.comment_id) || [])
    },
    enabled: !!user?.id && !!postId,
    staleTime: 30 * 1000,
  })
}

// Toggle like mutation
export function useToggleCommentLike() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .rpc('toggle_comment_like', { p_comment_id: commentId })
      
      if (error) {
        console.error('Error toggling like:', error)
        throw error
      }
      
      return data
    },
    onSuccess: (data, commentId) => {
    // Invalidate anything with 'comment' in the key
    queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString().includes('comment')
    })
    }
  })
}

export function useCommentLikesCount(commentId: string) {
  return useQuery({
    queryKey: ['comment_likes_count', commentId],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId)

      if (error) {
        console.error('Error fetching likes count:', error)
        return 0
      }

      return count || 0
    },
    enabled: !!commentId,
    refetchInterval: 1000, // Refetch every second for real-time feel
  })
}

export function useIsCommentLiked(commentId: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['comment-liked', commentId, user?.id || ''],  // Use a direct array instead of commentKeys
    queryFn: async () => {
      if (!user?.id) return false
      
      const { data, error } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle()
      
      return !!data
    },
    enabled: !!user?.id && !!commentId,
    staleTime: 30 * 1000,
  })
}