'use client'

import { useState, useEffect } from 'react'
import { ForumPost } from '@/hooks/useForumPosts'
import { useAuth } from '@/components/AuthProvider'
import { usePostComments, useUpdateComment, useDeleteComment, useToggleCommentLike, useUserCommentLikes } from '@/hooks/useForumComments'
import { CommentItem } from './CommentItem'
import { ForumComment } from '@/hooks/useForumComments'
import '@/styles/futuristic-theme.css'

interface PostViewModalProps {
  isOpen: boolean
  onClose: () => void
  post: ForumPost | null
  onComment: (postId: string, commentText: string) => void
}

export function PostViewModal({ isOpen, onClose, post, onComment }: PostViewModalProps) {
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  
  const { data: comments = [], isLoading: loadingComments, refetch: refetchComments } = usePostComments(post?.post_id || '')
  const updateCommentMutation = useUpdateComment()
  const deleteCommentMutation = useDeleteComment()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCommentText('')
      setCommentError('')
    }
  }, [isOpen])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 1000) {
      setCommentText(value)
      setCommentError('')
    }
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentText.trim()) {
      setCommentError('Kommentaar on kohustuslik')
      return
    }

    if (!user) {
      setCommentError('Kommenteerimiseks pead olema sisse loginud')
      return
    }

    if (post) {
      onComment(post.post_id, commentText.trim())
      setCommentText('')
    }
  }

    const handleEditComment = async (comment: any) => {
    try {
        await updateCommentMutation.mutateAsync({
        commentId: comment.comment_id,
        commentText: comment.comment_text
        })
    } catch (error) {
        console.error('Error updating comment:', error)
    }
    }

    const handleDeleteComment = async (commentId: string) => {
    if (confirm('Kas olete kindel, et soovite selle kommentaari kustutada?')) {
        try {
        await deleteCommentMutation.mutateAsync({
            commentId,
            postId: post!.post_id
        })
        } catch (error) {
        console.error('Error deleting comment:', error)
        }
    }
    }

  if (!isOpen || !post) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-900/30 to-gray-900/30 border-b border-gray-800 px-6 py-4">
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] uppercase tracking-wider">
              {post.post_title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-red-400 group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-2 mb-4 text-sm text-gray-400">
              <span className="font-medium text-gray-300">
                {post.users?.player_name || post.users?.name || 'Tundmatu'}
              </span>
              <span>•</span>
              <span>{formatDate(post.post_date_time)}</span>
            </div>
            <div className="text-white whitespace-pre-wrap">
              {post.post_text}
            </div>
          </div>
        </div>


        {/* Comments Section */}
        <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-['Orbitron'] uppercase tracking-wider">
            Kommentaarid ({comments.length})
        </h3>
        
        {loadingComments ? (
            <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            </div>
        ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
            Ole esimene, kes kommenteerib!
            </p>
        ) : (
            <div className="space-y-4">
            {comments.map((comment) => (
            <CommentItem
                key={comment.comment_id}
                comment={comment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                postId={post.post_id}  // Add this
            />
            ))}
            </div>
        )}
        </div>

        {/* Comment Form - Fixed at bottom */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="border-t border-gray-800 p-6">
            <div className="space-y-3">
              <textarea
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Lisa kommentaar..."
                rows={3}
                className={`w-full px-4 py-3 bg-gray-900/80 border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none transition-all duration-300 resize-none ${
                  commentError 
                    ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]' 
                    : 'border-gray-700/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]'
                }`}
              />
              <div className="flex justify-between items-center">
                <span className={`text-xs ${commentError ? 'text-red-400' : 'text-gray-500'}`}>
                  {commentError || `${commentText.length}/1000 tähemärki`}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-xs font-bold transition-all duration-300 hover:from-red-700 hover:to-red-800"
                >
                  Postita kommentaar
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-800 p-6 text-center text-gray-500">
            Kommenteerimiseks pead olema sisse loginud
          </div>
        )}
      </div>
    </div>
  )
}