'use client'

import { useState } from 'react'
import { useForumPosts, useUpdateForumPost, useDeleteForumPost, ForumPost } from '@/hooks/useForumPosts'
import { useAuth } from '@/components/AuthProvider'
import { EditPostModal } from './EditPostModal'
import '@/styles/futuristic-theme.css'

interface ForumPostsProps {
  onEdit: (post: ForumPost) => void
  onDelete: (postId: string) => void
  onViewPost?: (post: ForumPost) => void
  currentFolder?: string | null
  onFolderClick?: (folderName: string) => void
}

export function ForumPosts({ onEdit, onDelete, onViewPost, currentFolder, onFolderClick }: ForumPostsProps) {
  const { data: posts = [], isLoading, error } = useForumPosts()
  const { user } = useAuth()

  // Get unique folders from all posts
    const foldersMap = new Map<string, boolean>()
        posts.forEach(post => {
        if (post.sub_folder) {
            foldersMap.set(post.sub_folder, true)
        }
        })
        const allFolders: string[] = []
        foldersMap.forEach((_, folderName) => {
        allFolders.push(folderName)
    })
  
  // Filter posts based on current folder
const filteredPosts = currentFolder 
  ? posts.filter(post => post.sub_folder === currentFolder)
  : posts.filter(post => !post.sub_folder)

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
    <div className="space-y-6">
      {/* Folders Section - Only show when not in a specific folder */}
      {!currentFolder && allFolders.length > 0 && (
        <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-6">
          <h3 className="text-lg font-bold text-gray-300 font-['Orbitron'] uppercase tracking-wider mb-4">
            Kaustad
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allFolders.map((folderName) => {
              const folderPostCount = posts.filter(p => p.sub_folder === folderName).length
              return (
                <button
                  key={folderName}
                  onClick={() => onFolderClick?.(folderName!)}
                  className="group p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg hover:bg-gray-800/50 hover:border-red-500/50 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white font-['Orbitron'] text-center">
                      {folderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {folderPostCount} postitus{folderPostCount !== 1 ? 't' : ''}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Posts Table */}
      {filteredPosts.length === 0 ? (
        <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-8">
          <p className="text-gray-400 text-center">
            {currentFolder 
              ? `Kaustas "${currentFolder}" pole veel postitusi.`
              : 'Ühtegi postitust pole veel tehtud. Ole esimene!'
            }
          </p>
        </div>
      ) : (
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
                  {!currentFolder && (
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider hidden md:table-cell">
                      Kaust
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                    Kuupäev
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                    Tegevused
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.post_id}
                    className="hover:bg-gray-900/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                        <div>
                        <h3 
                            className="text-white font-medium text-sm sm:text-base cursor-pointer hover:text-red-400 transition-colors"
                            onClick={() => onViewPost?.(post)}
                        >
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
                    {!currentFolder && (
                      <td className="px-6 py-4 hidden md:table-cell">
                        {post.sub_folder && (
                          <button
                            onClick={() => onFolderClick?.(post.sub_folder!)}
                            className="text-xs px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                          >
                            📁 {post.sub_folder}
                          </button>
                        )}
                      </td>
                    )}
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
      )}
    </div>
  )
}