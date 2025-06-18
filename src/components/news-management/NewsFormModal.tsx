// src/components/news-management/NewsFormModal.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCreateNews, useUpdateNews } from '@/hooks/useNewsManagement'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, FormGrid } from '@/components/shared/FormComponents'
import { CreateNewsInput, UpdateNewsInput, NewsArticle } from '@/types/news'

interface NewsFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingNews?: NewsArticle | null
}

type TabType = 'form' | 'preview'

interface CropData {
  x: number
  y: number
  width: number
  height: number
}

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
  
  // Image cropping states
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [originalImage, setOriginalImage] = useState<string>('')
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const cropperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

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
      setShowImageCropper(false)
      setOriginalImage('')
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
    // Allow empty URLs
    if (!url) return true
    
    // Allow relative paths (our uploaded images)
    if (url.startsWith('/')) return true
    
    // Validate full URLs
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
      setErrors({ cover_image_url: 'Palun vali PNG, JPG, JPEG või WebP faili' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ cover_image_url: 'Faili suurus ei tohi olla suurem kui 5MB' })
      return
    }

    setImageUploadLoading(true)
    
    try {
      // First, read the file for cropping preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setOriginalImage(imageUrl)
        setShowImageCropper(true)
        // Reset crop to center of image
        setCropData({ x: 25, y: 25, width: 50, height: 30 })
        setImageUploadLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image processing failed:', error)
      setErrors({ cover_image_url: 'Pildi töötlemine ebaõnnestus' })
      setImageUploadLoading(false)
    }
  }

  // Image cropping functions
  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault()
    const rect = cropperRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (action === 'drag') {
      setIsDragging(true)
      setDragStart({ x: x - cropData.x, y: y - cropData.y })
    } else {
      setIsResizing(true)
      setDragStart({ x, y })
    }
  }, [cropData])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return
    
    const rect = cropperRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (isDragging) {
      const newX = Math.max(0, Math.min(100 - cropData.width, x - dragStart.x))
      const newY = Math.max(0, Math.min(100 - cropData.height, y - dragStart.y))
      setCropData(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing) {
      const newWidth = Math.max(10, Math.min(100 - cropData.x, x - cropData.x))
      const newHeight = Math.max(10, Math.min(100 - cropData.y, y - cropData.y))
      setCropData(prev => ({ ...prev, width: newWidth, height: newHeight }))
    }
  }, [isDragging, isResizing, dragStart, cropData])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  const applyCrop = async () => {
    if (!originalImage || !imageRef.current) return

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = imageRef.current
      
      // Calculate actual crop dimensions
      const cropX = (cropData.x / 100) * img.naturalWidth
      const cropY = (cropData.y / 100) * img.naturalHeight
      const cropWidth = (cropData.width / 100) * img.naturalWidth
      const cropHeight = (cropData.height / 100) * img.naturalHeight

      // Set canvas size to match crop
      canvas.width = cropWidth
      canvas.height = cropHeight

      // Draw cropped image
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      )

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setErrors({ cover_image_url: 'Pildi lõikamine ebaõnnestus' })
          return
        }

        try {
          // Upload the cropped image
          const uploadFormData = new FormData()
          uploadFormData.append('file', blob, 'cropped_news_image.jpg')

          console.log('🔄 Uploading cropped image...')
          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: uploadFormData,
          })

          console.log('📨 Upload response status:', response.status)
          const result = await response.json()
          console.log('📄 Upload response data:', result)

          if (response.ok) {
            console.log('✅ Upload successful, URL:', result.url)
            // Use the uploaded image URL
            handleInputChange('cover_image_url', result.url)
            handleInputChange('cover_image_alt', formData.title || 'Uudise pilt')
            setShowImageCropper(false)
          } else {
            console.error('❌ Upload failed:', result)
            setErrors({ cover_image_url: result.error || 'Pildi üleslaadimine ebaõnnestus' })
          }
        } catch (uploadError) {
          console.error('❌ Upload request failed:', uploadError)
          setErrors({ cover_image_url: 'Pildi üleslaadimine serverisse ebaõnnestus' })
        }
      }, 'image/jpeg', 0.9)

    } catch (error) {
      console.error('Crop failed:', error)
      setErrors({ cover_image_url: 'Pildi lõikamine ebaõnnestus' })
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
          <p className="text-slate-300 line-clamp-3">
            {formData.content || 'Uudise sisu...'}
          </p>
        </div>
      </div>
    </div>
  )

  // Image Cropper Modal
  const ImageCropper = () => (
    <Modal
      isOpen={showImageCropper}
      onClose={() => setShowImageCropper(false)}
      title="Lõika pilti"
      size="lg"
    >
      <div className="space-y-6">
        <p className="text-slate-400">
          Lohista kasti, et valida pildi osa. Muuda suurust alumisest paremast nurgast.
        </p>
        
        <div 
          ref={cropperRef}
          className="relative bg-slate-900 rounded-lg overflow-hidden"
          style={{ aspectRatio: '16/10' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={originalImage}
            alt="Crop preview"
            className="w-full h-full object-contain"
            draggable={false}
          />
          
          {/* Crop overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Crop selection */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 cursor-move"
            style={{
              left: `${cropData.x}%`,
              top: `${cropData.y}%`,
              width: `${cropData.width}%`,
              height: `${cropData.height}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize -mb-2 -mr-2"
              onMouseDown={(e) => {
                e.stopPropagation()
                handleMouseDown(e, 'resize')
              }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">X positsioon</label>
            <div className="text-white">{Math.round(cropData.x)}%</div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Y positsioon</label>
            <div className="text-white">{Math.round(cropData.y)}%</div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Laius</label>
            <div className="text-white">{Math.round(cropData.width)}%</div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Kõrgus</label>
            <div className="text-white">{Math.round(cropData.height)}%</div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowImageCropper(false)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Tühista
          </button>
          <button
            type="button"
            onClick={applyCrop}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ✂️ Rakenda lõige
          </button>
        </div>
      </div>
    </Modal>
  )

  return (
    <>
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

                <Textarea
                  label="Sisu"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  error={errors.content}
                  placeholder="Kirjuta uudise sisu siia..."
                  required
                  rows={8}
                />

                {/* Enhanced Cover Image Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Kaanepilt
                    <span className="text-slate-500 font-normal"> (valikuline)</span>
                  </label>
                  
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
                      className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors border border-slate-600 ${
                        imageUploadLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {imageUploadLoading ? 'Töötlemine...' : '📁 Vali & Lõika Pilt'}
                    </label>
                    <span className="text-sm text-slate-400">
                      PNG, JPG või JPEG, max 5MB
                    </span>
                  </div>

                  <div className="text-sm text-slate-400 mb-2">või</div>
                  <Input
                    label="Pildi URL"
                    value={formData.cover_image_url}
                    onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                    error={errors.cover_image_url}
                    placeholder="https://näide.ee/pilt.jpg"
                  />

                  {formData.cover_image_url && (
                    <Input
                      label="Pildi kirjeldus (alt tekst)"
                      value={formData.cover_image_alt}
                      onChange={(e) => handleInputChange('cover_image_alt', e.target.value)}
                      placeholder="Kirjelda pilti ligipääsetavuse jaoks..."
                    />
                  )}

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

      <ImageCropper />
    </>
  )
}