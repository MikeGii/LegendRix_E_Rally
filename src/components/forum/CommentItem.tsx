'use client'

import { useState, useEffect } from 'react'
import { ForumComment, useUserCommentLikes, useIsCommentLiked, useToggleCommentLike, useCommentLikesCount } from '@/hooks/useForumComments'
import { useAuth } from '@/components/AuthProvider'

interface CommentItemProps {
  comment: ForumComment
  onEdit: (comment: ForumComment) => void
  onDelete: (commentId: string) => void
  postId: string  // Add this
}

export function CommentItem({ comment, onEdit, onDelete, postId }: CommentItemProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.comment_text)
  
  // Get like state and count
  const { data: isLiked = false } = useIsCommentLiked(comment.comment_id)
  const { data: likesCount = 0 } = useCommentLikesCount(comment.comment_id)
  const toggleLikeMutation = useToggleCommentLike()

  

    const handleLike = async () => {
        if (!user) {
            // Handle non-authenticated user (maybe show a message)
            return
        }
        
        try {
            await toggleLikeMutation.mutateAsync(comment.comment_id)
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} min tagasi`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h tagasi`
    } else {
      return date.toLocaleDateString('et-EE', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== comment.comment_text) {
      onEdit({ ...comment, comment_text: editText })
    }
    setIsEditing(false)
  }

  const canModify = user && (user.id === comment.user_id || user.role === 'admin')

  return (
    <div className="bg-gray-900/30 rounded-lg p-4 space-y-3">
      {/* Comment Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium text-gray-300">
            {comment.users?.player_name || comment.users?.name || 'Tundmatu'}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">{formatDate(comment.comment_creation_time)}</span>
          {comment.is_edited && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 italic">muudetud</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {canModify && !isEditing && (
          <div className="flex items-center space-x-1">
            {user.id === comment.user_id && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-gray-800 transition-colors group"
                title="Muuda kommentaari"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDelete(comment.comment_id)}
              className="p-1 rounded hover:bg-gray-800 transition-colors group"
              title="Kustuta kommentaar"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 resize-none"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditText(comment.comment_text)
              }}
              className="px-3 py-1 text-gray-400 hover:text-white text-sm"
            >
              Tühista
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
            >
              Salvesta
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 text-sm whitespace-pre-wrap">
          {comment.comment_text}
        </p>
      )}

      {/* Like Button */}
      <div className="flex items-center">
        <button
            onClick={() => toggleLikeMutation.mutate(comment.comment_id)}
            disabled={toggleLikeMutation.isPending}
          className={`flex items-center space-x-1 transition-colors group ${
            isLiked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-400 hover:text-red-400'
          } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <svg 
            className="w-4 h-4" 
            fill={isLiked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">{likesCount}</span>
        </button>
      </div>
    </div>
  )
}