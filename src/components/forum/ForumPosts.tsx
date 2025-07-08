'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import '@/styles/futuristic-theme.css'

interface ForumPost {
  post_id: string
  post_title: string
  post_text: string
  post_creator: string
  post_date_time: string
  users?: {
    name: string
    player_name: string | null
  }
}

export function ForumPosts() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
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

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('et-EE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('et-EE', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  if (loading) {
    return (
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin postitusi...</p>
        </div>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {posts.map((post) => (
              <tr
                key={post.post_id}
                className="hover:bg-gray-900/50 transition-colors duration-200 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div>
                    <h3 className="text-white font-medium text-sm sm:text-base">
                      {post.post_title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 sm:hidden">
                      {post.users?.player_name || post.users?.name || 'Tundmatu'}
                    </p>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}