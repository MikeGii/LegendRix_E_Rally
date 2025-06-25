// src/components/NewsManagement.tsx
'use client'

import { useState } from 'react'
import { useAllNewsArticles, useDeleteNews } from '@/hooks/news'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { NewsFormModal } from './news-management/NewsFormModal'
import { NewsArticle } from '@/types/index'

export function NewsManagement() {
  const { data: allNews = [], isLoading, refetch } = useAllNewsArticles()
  const deleteNewsMutation = useDeleteNews()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null)
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null)

  // Calculate stats
  const publishedCount = allNews.filter(n => n.is_published).length
  const draftCount = allNews.filter(n => !n.is_published).length
  const featuredCount = allNews.filter(n => n.is_featured && n.is_published).length

  const handleCreateNews = () => {
    setEditingNews(null)
    setIsCreateModalOpen(true)
  }

  const handleEditNews = (news: NewsArticle) => {
    setEditingNews(news)
    setIsCreateModalOpen(true)
  }

  const handleDeleteNews = (newsId: string) => {
    setDeletingNewsId(newsId)
  }

  const confirmDeleteNews = async () => {
    if (!deletingNewsId) return
    
    try {
      await deleteNewsMutation.mutateAsync(deletingNewsId)
      setDeletingNewsId(null)
    } catch (error) {
      console.error('Failed to delete news:', error)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingNews(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (news: NewsArticle) => {
    if (!news.is_published) {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-medium">
          Mustand
        </span>
      )
    }
    if (news.is_featured) {
      return (
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium">
          Esiletõstetud
        </span>
      )
    }
    return (
      <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium">
        Avaldatud
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <AdminPageHeader
          title="Uudiste Haldus"
          description="Halda kõiki uudiseid ja teateid, mis kuvatakse avalikul lehel"
          icon="📰"
          stats={[
            { label: 'Avaldatud uudised', value: publishedCount, color: 'green' },
            { label: 'Mustandid', value: draftCount, color: 'yellow' },
            { label: 'Esiletõstetud', value: featuredCount, color: 'blue' }
          ]}
          actions={[
            {
              label: 'Lisa Uus Uudis',
              onClick: handleCreateNews,
              variant: 'primary',
              icon: '➕'
            }
          ]}
          onRefresh={refetch}
          isLoading={isLoading}
        />

        {/* News Table */}
        <div className="mt-8">
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400">Laen uudiseid...</span>
              </div>
            ) : allNews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📰</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Uudiseid pole veel loodud
                </h3>
                <p className="text-slate-400 mb-6">
                  Alusta oma esimese uudise loomisega
                </p>
                <button
                  onClick={handleCreateNews}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  ➕ Lisa Esimene Uudis
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Uudis
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Staatus
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Kuupäev
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Autor
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Tegevused
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {allNews.map((news) => (
                      <tr key={news.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {news.cover_image_url && (
                              <img
                                src={news.cover_image_url}
                                alt={news.cover_image_alt || ''}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">
                                {news.title}
                              </div>
                              <div className="text-sm text-slate-400 line-clamp-1">
                                {news.content.substring(0, 80)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(news)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatDate(news.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {news.author_name || 'Tundmatu'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditNews(news)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                            >
                              ✏️ Muuda
                            </button>
                            <button
                              onClick={() => handleDeleteNews(news.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                            >
                              🗑️ Kustuta
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News Form Modal */}
      <NewsFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        editingNews={editingNews}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingNewsId}
        onClose={() => setDeletingNewsId(null)}
        onConfirm={confirmDeleteNews}
        title="Kustuta uudis"
        message="Kas oled kindel, et soovid selle uudise kustutada? Seda tegevust ei saa tagasi võtta."
        confirmText="Jah, kustuta"
        cancelText="Tühista"
        confirmColor="red"
        isLoading={deleteNewsMutation.isPending}
      />
    </div>
  )
}