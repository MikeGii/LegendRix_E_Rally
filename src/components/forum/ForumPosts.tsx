'use client'

import { useState } from 'react'
import { useForumPosts, useUpdateForumPost, useDeleteForumPost, ForumPost } from '@/hooks/useForumPosts'
import { useAuth } from '@/components/AuthProvider'
import { EditPostModal } from './EditPostModal'
import '@/styles/futuristic-theme.css'

interface ForumPostsProps {
  onEdit: (post: ForumPost) => void
  onDelete: (postId: string) => void
}

export function ForumPosts({ onEdit, onDelete }: ForumPostsProps) {
  const { data: posts = [], isLoading, error } = useForumPosts()
  const { user } = useAuth()

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

  if (isLoading) {
    return (
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin postitusi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-8">
        <p className="text-red-400 text-center">
          Viga postituste laadimisel. Palun proovi hiljem uuesti.
        </p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-8">
        <p className="text-gray-400 text-center">
          Ühtegi postitust pole veel tehtud. Ole esimene!
        </p>
      </div>
    )
  }

  return (
    <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                Pealkiri
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider hidden sm:table-cell">
                Autor
              </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
            Kuupäev
            </th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
            Tegevused
            </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {posts.map((post) => (
                <tr
                key={post.post_id}
                className="hover:bg-gray-900/50 transition-colors duration-200"
                >
                <td className="px-6 py-4">
                    <div>
                    <h3 className="text-white font-medium text-sm sm:text-base">
                        {post.post_title}
                    </h3>
                    {/* Comments count */}
                    <div className="flex items-center space-x-3 mt-1">
                        <span className="text-gray-500 text-xs sm:hidden">
                        {post.users?.player_name || post.users?.name || 'Tundmatu'}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center">
                        <span className="mr-1">💬</span>
                        {post.comments_count || 0} kommentaari
                        </span>
                    </div>
                    </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="text-gray-300 text-sm">
                    {post.users?.player_name || post.users?.name || 'Tundmatu'}
                    </p>
                </td>
                <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm">
                    {formatDate(post.post_date_time)}
                    </p>
                </td>
                <td className="px-6 py-4">
                    {user && user.id === post.post_creator && (
                    <div className="flex items-center justify-center space-x-2">
                        <button
                        onClick={() => onEdit(post)}
                        className="p-1.5 rounded hover:bg-gray-800 transition-colors group"
                        title="Muuda postitust"
                        >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        </button>
                        <button
                        onClick={() => onDelete(post.post_id)}
                        className="p-1.5 rounded hover:bg-gray-800 transition-colors group"
                        title="Kustuta postitus"
                        >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>
                    )}
                </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}