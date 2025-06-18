// src/components/NewsManagement.tsx
'use client'

import { useState } from 'react'
import { useAllNewsArticles, useDeleteNews } from '@/hooks/useNewsManagement'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { NewsFormModal } from './news-management/NewsFormModal'
import { NewsFlowTester } from '@/components/testing/NewsFlowTester'
import { NewsArticle } from '@/types/news'

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

        {/* Development Testing Helper - Remove in production */}
        {process.env.NODE_ENV === 'development' && allNews.length === 0 && (
          <div className="mt-6">
            <NewsFlowTester />
          </div>
        )}

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
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📰</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ühtegi uudist ei ole</h3>
                <p className="text-slate-400 mb-6">Alusta esimese uudise loomisega</p>
                <button
                  onClick={handleCreateNews}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Lisa Esimene Uudis
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Pealkiri</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Staatus</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Autor</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Kuupäev</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Tegevused</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {allNews.map((news) => (
                      <tr key={news.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            {news.cover_image_url ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700/50 flex-shrink-0">
                                <img
                                  src={news.cover_image_url}
                                  alt={news.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-slate-400">📰</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-white font-medium truncate">{news.title}</h3>
                              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                                {news.content.substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(news)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300 text-sm">
                            {news.author_name || 'Tundmatu'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-slate-300">
                              {formatDate(news.created_at)}
                            </div>
                            {news.published_at && news.published_at !== news.created_at && (
                              <div className="text-slate-500 text-xs">
                                Avaldatud: {formatDate(news.published_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditNews(news)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Muuda"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteNews(news.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Kustuta"
                            >
                              🗑️
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

        {/* Create/Edit Modal */}
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
          title="Kustuta Uudis"
          message="Kas oled kindel, et soovid selle uudise kustutada? Seda tegevust ei saa tagasi võtta."
          confirmText="Jah, Kustuta"
          cancelText="Tühista"
          confirmColor="red"
          isLoading={deleteNewsMutation.isPending}
        />
      </div>
    </div>
  )
}