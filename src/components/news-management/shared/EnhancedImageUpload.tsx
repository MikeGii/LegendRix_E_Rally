// src/components/news-management/shared/EnhancedImageUpload.tsx
// This component optimizes images BEFORE sending to your existing upload API

import { useState, useRef } from 'react'
import { optimizeImageBeforeUpload, validateImageForOptimization, getImageMetadata } from '@/lib/image-optimization'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Step 1: Validate file (before optimization)
    const validation = validateImageForOptimization(file)
    if (!validation.isValid) {
      onError(validation.errors[0])
      return
    }

    setIsUploading(true)
    setUploadProgress(10)
    setOptimizationStats(null)

    try {
      // Step 2: Get original image metadata
      const originalMetadata = await getImageMetadata(file)
      setUploadProgress(20)

      console.log('📊 Original image metadata:', originalMetadata)

      // Step 3: Optimize image (this is the new layer!)
      const optimizationResult = await optimizeImageBeforeUpload(file, defaultOptions)
      setOptimizationStats(optimizationResult)
      setUploadProgress(50)

      console.log('🎯 Optimization complete:', {
        originalSize: `${Math.round(optimizationResult.originalSize / 1024)}KB`,
        optimizedSize: `${Math.round(optimizationResult.optimizedSize / 1024)}KB`,
        compressionRatio: `${optimizationResult.compressionRatio}%`,
        dimensions: `${optimizationResult.metadata.width}x${optimizationResult.metadata.height}`
      })

      // Step 4: Create form data with OPTIMIZED file
      const formData = new FormData()
      formData.append('file', optimizationResult.optimizedFile)
      setUploadProgress(70)

      // Step 5: Call YOUR EXISTING upload API (no changes needed!)
      console.log('📤 Sending optimized file to your existing upload API...')
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      setUploadProgress(90)

      if (response.ok) {
        console.log('✅ Upload successful via existing API:', result.url)
        onImageUpload(result.url, `Optimized image - ${file.name}`)
        setUploadProgress(100)
        
        // Show optimization details for a moment
        setShowOptimizationDetails(true)
        setTimeout(() => setShowOptimizationDetails(false), 5000)
      } else {
        console.error('❌ Upload failed:', result)
        onError(result.error || 'Pildi üleslaadimine ebaõnnestus')
      }
    } catch (error) {
      console.error('❌ Upload process failed:', error)
      onError(error instanceof Error ? error.message : 'Pildi töötlemine ebaõnnestus')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    onImageUpload('', '')
    setOptimizationStats(null)
    setShowOptimizationDetails(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
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
              <span>Optimeerin...</span>
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

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>
              {uploadProgress < 50 ? 'Optimeerin pilti...' : 
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
      {currentImageUrl && (
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