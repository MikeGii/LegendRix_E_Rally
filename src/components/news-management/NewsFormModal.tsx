// Fixed version of your NewsFormModal.tsx

// src/components/news-management/NewsFormModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useCreateNews, useUpdateNews } from '@/hooks/news'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, FormGrid } from '@/components/shared/FormComponents'
import { EnhancedImageUpload } from './shared/EnhancedImageUpload'
import { validateNewsForm } from '@/utils/news-utils'
import { CreateNewsInput, UpdateNewsInput, NewsArticle } from '@/types'
import { RichTextEditor } from '@/components/shared/RichTextEditor'


interface NewsFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingNews?: NewsArticle | null
}

type TabType = 'form' | 'preview'

export function NewsFormModal({ isOpen, onClose, editingNews }: NewsFormModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('form')
  const [formData, setFormData] = useState<CreateNewsInput>({
    title: '',
    content: '',
    cover_image_url: '',
    cover_image_alt: '',
    is_published: false,
    is_featured: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const createNewsMutation = useCreateNews()
  const updateNewsMutation = useUpdateNews()

  // Reset form when modal opens/closes or editing news changes
  useEffect(() => {
    if (isOpen) {
      if (editingNews) {
        setFormData({
          title: editingNews.title,
          content: editingNews.content,
          cover_image_url: editingNews.cover_image_url || '',
          cover_image_alt: editingNews.cover_image_alt || '',
          is_published: editingNews.is_published,
          is_featured: editingNews.is_featured,
        })
      } else {
        setFormData({
          title: '',
          content: '',
          cover_image_url: '',
          cover_image_alt: '',
          is_published: false,
          is_featured: false,
        })
      }
      setActiveTab('form')
      setErrors({})
    }
  }, [isOpen, editingNews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use the utility function from utils instead of local validateForm
    const validation = validateNewsForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setActiveTab('form')
      return
    }

    try {
      if (editingNews) {
        const updateData: UpdateNewsInput = {
          id: editingNews.id,
          ...formData
        }
        await updateNewsMutation.mutateAsync(updateData)
      } else {
        await createNewsMutation.mutateAsync(formData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save news:', error)
      setErrors({ submit: 'Uudise salvestamine ebaõnnestus. Palun proovi uuesti.' })
      setActiveTab('form')
    }
  }

  const handleInputChange = (field: keyof CreateNewsInput, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const isLoading = createNewsMutation.isPending || updateNewsMutation.isPending

  // News preview component
  const NewsPreview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white">Eelvaade</h3>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Kuidas see välja näeb avalikul lehel</span>
        </div>
      </div>

      <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          {formData.cover_image_url ? (
            <img
              src={formData.cover_image_url}
              alt={formData.cover_image_alt || 'Preview'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-700/50 flex items-center justify-center">
              <span className="text-slate-400">Pilti pole valitud</span>
            </div>
          )}
          {formData.is_featured && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                Esiletõstetud
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">
            {formData.title || 'Uudise pealkiri'}
          </h3>
          <div className="text-slate-300 text-sm mb-4">
            {new Date().toLocaleDateString('et-EE')} • {formData.is_published ? 'Avaldatud' : 'Mustand'}
          </div>
          <p className="text-slate-300 line-clamp-3 whitespace-pre-wrap">
            {formData.content || 'Uudise sisu...'}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNews ? 'Muuda uudist' : 'Lisa uus uudis'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700/30 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
            }`}
          >
            📝 Vorm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
            }`}
          >
            👁️ Eelvaade
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
                {errors.submit}
              </div>
            )}

            <FormGrid columns={1}>
              <Input
                label="Pealkiri"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                placeholder="Sisesta uudise pealkiri..."
                required
                maxLength={255}
              />

              {/* Rich Text Editor instead of Textarea */}
              <RichTextEditor
                label="Sisu"
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                error={errors.content}
                placeholder="Kirjuta uudise sisu siia..."
                required
                minHeight={250}
                toolbar="basic"
                hint={undefined}
              />

              {/* Optimized Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kaanepilt <span className="text-slate-500">(valikuline)</span>
                </label>
                <EnhancedImageUpload
                  onImageUpload={(url, alt) => {
                    handleInputChange('cover_image_url', url)
                    handleInputChange('cover_image_alt', alt || formData.title || 'Uudise pilt')
                  }}
                  onError={(error) => setErrors({ cover_image_url: error })}
                  currentImageUrl={formData.cover_image_url}
                  placeholder="Vali või lohista pilt"
                  optimizationOptions={{
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.9,
                    format: 'jpeg'
                  }}
                />
                {errors.cover_image_url && (
                  <p className="mt-1 text-sm text-red-400">{errors.cover_image_url}</p>
                )}
                
                {/* Optional: Manual URL input as fallback */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="text-sm">
                    <Input
                      label="Või sisesta pildi URL käsitsi"
                      value={formData.cover_image_url}
                      onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                      placeholder="https://näide.ee/pilt.jpg"
                    />
                  </div>
                  
                  {formData.cover_image_url && (
                    <div className="text-sm mt-2">
                      <Input
                        label="Pildi kirjeldus (alt tekst)"
                        value={formData.cover_image_alt}
                        onChange={(e) => handleInputChange('cover_image_alt', e.target.value)}
                        placeholder="Kirjelda pilti ligipääsetavuse jaoks..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => handleInputChange('is_published', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-slate-300">
                    Avalda kohe
                    <span className="text-slate-500 block text-xs">
                      Kui märkimata, salvestatakse mustandina
                    </span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-slate-300">
                    Tõsta esile
                    <span className="text-slate-500 block text-xs">
                      Kuvatakse erilisel kohal avalikul lehel
                    </span>
                  </label>
                </div>
              </div>
            </FormGrid>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-colors"
              >
                Tühista
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvestamine...</span>
                  </div>
                ) : (
                  editingNews ? 'Uuenda uudist' : 'Loo uudis'
                )}
              </button>
            </div>
          </form>
        ) : (
          <NewsPreview />
        )}
      </div>
    </Modal>
  )
}