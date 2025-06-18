// src/components/news-management/NewsFormModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, FormGrid, FormActions } from '@/components/shared/FormComponents'
import { useCreateNews, useUpdateNews } from '@/hooks/useNewsManagement'
import { NewsArticle, CreateNewsInput, UpdateNewsInput } from '@/types/news'

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
  const [imageUploadLoading, setImageUploadLoading] = useState(false)

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Pealkiri on kohustuslik'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Pealkiri ei tohi olla pikem kui 255 tähemärki'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Sisu on kohustuslik'
    }

    if (formData.cover_image_url && !isValidUrl(formData.cover_image_url)) {
      newErrors.cover_image_url = 'Palun sisesta kehtiv URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setActiveTab('form') // Switch back to form tab to show errors
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
      setErrors({ cover_image_url: 'Palun vali PNG, JPG või JPEG faili' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ cover_image_url: 'Faili suurus ei tohi olla suurem kui 5MB' })
      return
    }

    setImageUploadLoading(true)
    
    try {
      // Here you would typically upload to your storage service
      // For now, we'll use a placeholder implementation
      // You can implement Supabase storage upload here
      
      // Simulated upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, we'll use a data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        handleInputChange('cover_image_url', imageUrl)
        handleInputChange('cover_image_alt', formData.title || 'Uudise pilt')
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Image upload failed:', error)
      setErrors({ cover_image_url: 'Pildi üleslaadimine ebaõnnestus' })
    } finally {
      setImageUploadLoading(false)
    }
  }

  const isLoading = createNewsMutation.isPending || updateNewsMutation.isPending

  // News preview component
  const NewsPreview = () => (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white">Eelvaade</h3>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Kuidas see välja näeb avalikul lehel</span>
        </div>
      </div>

      {/* Mock News Card (similar to landing page) */}
      <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {formData.cover_image_url ? (
            <img
              src={formData.cover_image_url}
              alt={formData.cover_image_alt || formData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
              <span className="text-6xl opacity-50">📰</span>
            </div>
          )}
          
          {/* Date Badge */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white border border-white/20">
            just now
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">
            {formData.title || 'Uudise pealkiri...'}
          </h3>
          
          <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
            {formData.content 
              ? formData.content.length > 100 
                ? formData.content.substring(0, 100) + '...'
                : formData.content
              : 'Uudise sisu...'
            }
          </p>

          {/* Read More Indicator */}
          <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
            <span>Loe edasi</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">Staatus:</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            formData.is_published 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {formData.is_published ? 'Avaldatud' : 'Mustand'}
          </span>
        </div>
        
        {formData.is_featured && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Esiletõstetud:</span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium">
              Jah
            </span>
          </div>
        )}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={editingNews ? 'Muuda Uudist' : 'Lisa Uus Uudis'}
    >
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-slate-700/30 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
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
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
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
            {/* Form Error */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
                {errors.submit}
              </div>
            )}

            <FormGrid columns={1}>
              {/* Title */}
              <Input
                label="Pealkiri"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                placeholder="Sisesta uudise pealkiri..."
                required
                maxLength={255}
              />

              {/* Content */}
              <Textarea
                label="Sisu"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                error={errors.content}
                placeholder="Kirjuta uudise sisu siia..."
                required
                rows={8}
              />

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Kaanepilt
                  <span className="text-slate-500 font-normal"> (valikuline)</span>
                </label>
                
                {/* Image Upload */}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="cover-image-upload"
                    disabled={imageUploadLoading}
                  />
                  <label
                    htmlFor="cover-image-upload"
                    className={`
                      px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors border border-slate-600
                      ${imageUploadLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {imageUploadLoading ? 'Laen üles...' : '📁 Vali Pilt'}
                  </label>
                  <span className="text-sm text-slate-400">
                    PNG, JPG või JPEG, max 5MB
                  </span>
                </div>

                {/* Manual URL Input */}
                <div className="text-sm text-slate-400 mb-2">või</div>
                <Input
                  label="Pildi URL"
                  value={formData.cover_image_url}
                  onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                  error={errors.cover_image_url}
                  placeholder="https://näide.ee/pilt.jpg"
                />

                {/* Alt Text */}
                {formData.cover_image_url && (
                  <Input
                    label="Pildi kirjeldus (alt tekst)"
                    value={formData.cover_image_alt}
                    onChange={(e) => handleInputChange('cover_image_alt', e.target.value)}
                    placeholder="Kirjelda pilti ligipääsetavuse jaoks..."
                  />
                )}

                {/* Image Preview */}
                {formData.cover_image_url && (
                  <div className="w-full h-32 bg-slate-700/50 rounded-lg overflow-hidden">
                    <img
                      src={formData.cover_image_url}
                      alt={formData.cover_image_alt || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-slate-300">
                    Tõsta esile
                    <span className="text-slate-500 block text-xs">
                      Esiletõstetud uudised kuvatakse prominentselt
                    </span>
                  </label>
                </div>
              </div>
            </FormGrid>

            {/* Form Actions */}
            <FormActions>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                disabled={isLoading}
              >
                Tühista
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvestamine...</span>
                  </div>
                ) : (
                  editingNews ? 'Uuenda Uudist' : 'Loo Uudis'
                )}
              </button>
            </FormActions>
          </form>
        ) : (
          <NewsPreview />
        )}
      </div>
    </Modal>
  )
}