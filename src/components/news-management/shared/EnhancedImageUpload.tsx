// src/components/news-management/shared/EnhancedImageUpload.tsx
// COMPLETE FILE with proper imports

import React, { useState, useRef } from 'react'
import { 
  optimizeImageBeforeUpload, 
  validateImageForOptimization, 
  getImageMetadata,
  cropImageBeforeOptimization 
} from '@/lib/image-optimization'

interface CropData {
  x: number
  y: number
  width: number
  height: number
}

interface EnhancedImageUploadProps {
  onImageUpload: (url: string, alt?: string) => void
  onError: (error: string) => void
  currentImageUrl?: string
  placeholder?: string
  className?: string
  optimizationOptions?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'webp' | 'png'
  }
}

export function EnhancedImageUpload({ 
  onImageUpload, 
  onError, 
  currentImageUrl,
  placeholder = "Vali pilt...",
  className = "",
  optimizationOptions = {}
}: EnhancedImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [optimizationStats, setOptimizationStats] = useState<any>(null)
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false)
  
  // Image editing states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, width: 100, height: 100 })
  const [imageMetadata, setImageMetadata] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragMode, setDragMode] = useState<'select' | 'move'>('select')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const defaultOptions = {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'jpeg' as const,
    ...optimizationOptions
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📁 File selected:', file.name, file.type, `${Math.round(file.size / 1024)}KB`)

    // Validate file
    const validation = validateImageForOptimization(file)
    if (!validation.isValid) {
      onError(validation.errors[0])
      return
    }

    try {
      // Get metadata
      const metadata = await getImageMetadata(file)
      setImageMetadata(metadata)
      
      // Create preview
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
      setSelectedFile(file)
      
      // Show editor for cropping/editing
      setShowImageEditor(true)
      
      // Reset crop to full image
      setCropData({ x: 0, y: 0, width: 100, height: 100 })
      
    } catch (error) {
      onError('Pildi laadimine ebaõnnestus')
    }
  }

  const processAndUploadImage = async (useCurrentCrop: boolean = false) => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(10)
    setOptimizationStats(null)

    try {
      let fileToOptimize = selectedFile

      // Step 1: Apply cropping if needed
      if (useCurrentCrop && (cropData.x > 0 || cropData.y > 0 || cropData.width < 100 || cropData.height < 100)) {
        console.log('✂️ Applying crop:', cropData)
        fileToOptimize = await cropImageBeforeOptimization(selectedFile, cropData)
        setUploadProgress(30)
      }

      // Step 2: Optimize
      console.log('🎯 Optimizing image...')
      const optimizationResult = await optimizeImageBeforeUpload(fileToOptimize, defaultOptions)
      setOptimizationStats(optimizationResult)
      setUploadProgress(60)

      // Step 3: Upload
      console.log('📤 Uploading...')
      const formData = new FormData()
      formData.append('file', optimizationResult.optimizedFile)
      setUploadProgress(75)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      setUploadProgress(90)

      if (response.ok) {
        console.log('✅ Upload successful!')
        onImageUpload(result.url, `Optimized image - ${selectedFile.name}`)
        setUploadProgress(100)
        
        // Close editor and cleanup
        setShowImageEditor(false)
        cleanupEditor()
        
        // Show optimization details
        setShowOptimizationDetails(true)
        setTimeout(() => setShowOptimizationDetails(false), 5000)
      } else {
        onError(result.error || 'Pildi üleslaadimine ebaõnnestus')
      }
    } catch (error) {
      console.error('❌ Upload process failed:', error)
      onError(error instanceof Error ? error.message : 'Pildi töötlemine ebaõnnestus')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const cleanupEditor = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl('')
    setImageMetadata(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const cancelEdit = () => {
    setShowImageEditor(false)
    cleanupEditor()
  }

  const removeImage = () => {
    onImageUpload('', '')
    setOptimizationStats(null)
    setShowOptimizationDetails(false)
  }

  // Handle drag to select crop area or move existing crop
  const isInsideCropArea = (x: number, y: number) => {
    return x >= cropData.x && x <= cropData.x + cropData.width &&
           y >= cropData.y && y <= cropData.y + cropData.height
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Check if clicking inside existing crop area
    const hasCrop = cropData.width < 100 || cropData.height < 100 || cropData.x > 0 || cropData.y > 0
    
    if (hasCrop && isInsideCropArea(x, y)) {
      // Move existing crop
      setDragMode('move')
    } else {
      // Create new crop
      setDragMode('select')
      setCropData({ x, y, width: 0, height: 0 })
    }
    
    setIsDragging(true)
    setDragStart({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const currentX = ((e.clientX - rect.left) / rect.width) * 100
    const currentY = ((e.clientY - rect.top) / rect.height) * 100
    
    if (dragMode === 'select') {
      // Creating new crop area
      const width = Math.abs(currentX - dragStart.x)
      const height = Math.abs(currentY - dragStart.y)
      const x = Math.min(dragStart.x, currentX)
      const y = Math.min(dragStart.y, currentY)
      
      setCropData({
        x: Math.max(0, Math.min(100 - width, x)),
        y: Math.max(0, Math.min(100 - height, y)),
        width: Math.max(5, Math.min(100, width)),
        height: Math.max(5, Math.min(100, height))
      })
    } else if (dragMode === 'move') {
      // Moving existing crop area
      const deltaX = currentX - dragStart.x
      const deltaY = currentY - dragStart.y
      
      setCropData(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY))
      }))
      
      // Update drag start for continuous movement
      setDragStart({ x: currentX, y: currentY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
    setDragMode('select')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      {!showImageEditor && (
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="enhanced-image-upload"
            disabled={isUploading}
          />
          
          <label
            htmlFor="enhanced-image-upload"
            className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors border border-slate-600 flex items-center space-x-2 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Töötlen...</span>
              </>
            ) : (
              <>
                <span>📸</span>
                <span>{placeholder}</span>
              </>
            )}
          </label>

          {currentImageUrl && (
            <div className="text-sm text-green-400 flex items-center space-x-2">
              <span>✅ Pilt on üles laaditud</span>
              {optimizationStats && (
                <button
                  onClick={() => setShowOptimizationDetails(!showOptimizationDetails)}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  ({optimizationStats.compressionRatio}% väiksem)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>
              {uploadProgress < 30 ? 'Lõikan pilti...' :
               uploadProgress < 60 ? 'Optimeerin pilti...' : 
               uploadProgress < 90 ? 'Laen üles...' : 'Valmis!'}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* IMAGE EDITOR MODAL */}
      {showImageEditor && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelEdit()
            }
          }}
        >
          <div 
            className="bg-slate-800 rounded-2xl border border-slate-600 max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Editor Header */}
            <div className="p-4 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">✂️ Pildi Lõikamine</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      cancelEdit()
                    }}
                    className="px-3 py-1 text-slate-400 hover:text-white transition-colors"
                  >
                    Tühista
                  </button>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Left Panel - Simple Info */}
              <div className="w-80 p-4 border-r border-slate-600 bg-slate-900/50">
                {/* Header */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white">✂️ Pildi Lõikamine</h4>
                  <p className="text-sm text-slate-400 mt-1">Lohista pildil ala valimiseks või liiguta valitud ala</p>
                </div>

                {/* Image Info */}
                {imageMetadata && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded-lg text-sm">
                    <div className="text-slate-300 font-medium mb-2">📊 Pildi andmed</div>
                    <div className="space-y-1 text-slate-400">
                      <div>Suurus: {imageMetadata.width}×{imageMetadata.height}</div>
                      <div>Faili suurus: {Math.round(imageMetadata.size / 1024)}KB</div>
                      <div>Proportsioon: {imageMetadata.aspectRatio.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="p-3 bg-slate-700/30 rounded-lg text-sm text-slate-300">
                  <div className="font-medium mb-2">🖱️ Juhised:</div>
                  <ul className="space-y-1 text-slate-400">
                    <li>• Lohista tühjal alal uue ala loomiseks</li>
                    <li>• Lohista valitud alal selle liigutamiseks</li>
                    <li>• Vali ala ja salvesta pilt</li>
                  </ul>
                </div>
              </div>

              {/* Right Panel - Image Preview with Drag */}
              <div className="flex-1 p-4 flex flex-col">
                <div 
                  className={`relative w-full flex-1 min-h-[400px] bg-slate-900/50 rounded-lg overflow-hidden ${
                    dragMode === 'move' ? 'cursor-move' : 'cursor-crosshair'
                  }`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: 'none' }}
                >
                  {previewUrl && (
                    <>
                      <img
                        ref={imageRef}
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain pointer-events-none select-none"
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                      
                      {/* Crop Overlay */}
                      {(cropData.width < 100 || cropData.height < 100 || cropData.x > 0 || cropData.y > 0) && (
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `
                              linear-gradient(to right, 
                                rgba(0,0,0,0.7) ${cropData.x}%, 
                                transparent ${cropData.x}%, 
                                transparent ${cropData.x + cropData.width}%, 
                                rgba(0,0,0,0.7) ${cropData.x + cropData.width}%
                              ),
                              linear-gradient(to bottom, 
                                rgba(0,0,0,0.7) ${cropData.y}%, 
                                transparent ${cropData.y}%, 
                                transparent ${cropData.y + cropData.height}%, 
                                rgba(0,0,0,0.7) ${cropData.y + cropData.height}%
                              )
                            `
                          }}
                        >
                          <div 
                            className={`absolute border-2 border-dashed transition-colors ${
                              isDragging ? 'border-blue-300' : 'border-blue-400'
                            }`}
                            style={{
                              left: `${cropData.x}%`,
                              top: `${cropData.y}%`,
                              width: `${cropData.width}%`,
                              height: `${cropData.height}%`
                            }}
                          >
                            {/* Corner handles for visual feedback */}
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Instructions overlay */}
                      {cropData.width === 100 && cropData.height === 100 && cropData.x === 0 && cropData.y === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                            🖱️ Lohista hiirga üle pildi lõikamiseks
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons - Fixed at bottom of right panel */}
                <div className="flex justify-center space-x-3 mt-4 pt-4 border-t border-slate-600">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      processAndUploadImage(true)
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                    disabled={isUploading}
                  >
                    <span>✂️</span>
                    <span>Salvesta pilt</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      processAndUploadImage(false)
                    }}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                    disabled={isUploading}
                  >
                    <span>📤</span>
                    <span>Salvesta originaal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Details (expandable) */}
      {showOptimizationDetails && optimizationStats && (
        <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-300">🎯 Optimiseeringu detailid</span>
            <button
              onClick={() => setShowOptimizationDetails(false)}
              className="text-slate-500 hover:text-slate-400"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Originaal:</span> {Math.round(optimizationStats.originalSize / 1024)}KB
            </div>
            <div>
              <span className="font-medium">Optimiseeritud:</span> {Math.round(optimizationStats.optimizedSize / 1024)}KB
            </div>
            <div>
              <span className="font-medium">Suurus:</span> {optimizationStats.metadata.width}×{optimizationStats.metadata.height}
            </div>
            <div>
              <span className="font-medium">Kvaliteet:</span> {Math.round(optimizationStats.metadata.quality * 100)}%
            </div>
            <div className="col-span-2">
              <span className="font-medium">Säästetud:</span> 
              <span className="text-green-400 ml-1">
                {optimizationStats.compressionRatio}% 
                ({Math.round((optimizationStats.originalSize - optimizationStats.optimizedSize) / 1024)}KB)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Image Preview */}
      {currentImageUrl && !showImageEditor && (
        <div className="relative w-full h-32 bg-slate-800 rounded-lg overflow-hidden group">
          <img
            src={currentImageUrl}
            alt="Praegune pilt"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={removeImage}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
            >
              🗑️ Eemalda
            </button>
          </div>
          
          {/* Quality indicator */}
          {optimizationStats && (
            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              Optimiseeritud
            </div>
          )}
        </div>
      )}

      {/* Optimization Settings Info */}
      <div className="text-xs text-slate-500 bg-slate-800/30 p-2 rounded border border-slate-700/50">
        <span className="font-medium">Automaatne optimeerimine:</span> Max {defaultOptions.maxWidth}×{defaultOptions.maxHeight}px, 
        {Math.round(defaultOptions.quality * 100)}% kvaliteet, {defaultOptions.format.toUpperCase()} formaat
      </div>
    </div>
  )
}