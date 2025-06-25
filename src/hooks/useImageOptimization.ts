// src/hooks/useImageOptimization.ts
// Hook for managing image optimization workflow

import { useState, useCallback } from 'react'
import { 
  optimizeImageBeforeUpload, 
  validateImageForOptimization, 
  getImageMetadata,
  cropImageBeforeOptimization
} from '@/lib/image-optimization'

interface UseImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
  onSuccess?: (url: string, metadata?: any) => void
  onError?: (error: string) => void
}

export function useImageOptimization(options: UseImageOptimizationOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [optimizationStats, setOptimizationStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const defaultOptions = {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'jpeg' as const,
    ...options
  }

  const processAndUploadImage = useCallback(async (
    file: File, 
    cropData?: { x: number; y: number; width: number; height: number }
  ) => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setOptimizationStats(null)

    try {
      // Step 1: Validate
      console.log('🔍 Step 1: Validating image...')
      const validation = validateImageForOptimization(file)
      if (!validation.isValid) {
        throw new Error(validation.errors[0])
      }
      setProgress(10)

      // Step 2: Get metadata
      console.log('📊 Step 2: Reading metadata...')
      const originalMetadata = await getImageMetadata(file)
      setProgress(20)

      // Step 3: Crop if needed (preserves your existing crop logic)
      let fileToOptimize = file
      if (cropData) {
        console.log('✂️ Step 3: Cropping image...')
        fileToOptimize = await cropImageBeforeOptimization(file, cropData)
        setProgress(35)
      }

      // Step 4: Optimize
      console.log('🎯 Step 4: Optimizing image...')
      const optimizationResult = await optimizeImageBeforeUpload(fileToOptimize, {
        maxWidth: defaultOptions.maxWidth,
        maxHeight: defaultOptions.maxHeight,
        quality: defaultOptions.quality,
        format: defaultOptions.format
      })
      setOptimizationStats(optimizationResult)
      setProgress(60)

      // Step 5: Upload via your existing API
      console.log('📤 Step 5: Uploading via existing API...')
      const formData = new FormData()
      formData.append('file', optimizationResult.optimizedFile)
      setProgress(75)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      setProgress(90)

      if (response.ok) {
        console.log('✅ Upload successful!')
        setProgress(100)
        
        if (options.onSuccess) {
          options.onSuccess(result.url, {
            original: originalMetadata,
            optimization: optimizationResult,
            upload: result
          })
        }

        return {
          url: result.url,
          metadata: {
            original: originalMetadata,
            optimization: optimizationResult,
            upload: result
          }
        }
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Image processing failed:', errorMessage)
      setError(errorMessage)
      
      if (options.onError) {
        options.onError(errorMessage)
      }
      
      throw err
    } finally {
      setIsProcessing(false)
      // Keep progress at 100% for success, reset for errors
      if (!error) {
        setTimeout(() => setProgress(0), 2000)
      } else {
        setProgress(0)
      }
    }
  }, [options, defaultOptions])

  const resetState = useCallback(() => {
    setIsProcessing(false)
    setProgress(0)
    setOptimizationStats(null)
    setError(null)
  }, [])

  return {
    // State
    isProcessing,
    progress,
    optimizationStats,
    error,
    
    // Actions
    processAndUploadImage,
    resetState,
    
    // Computed
    isComplete: progress === 100 && !error,
    hasOptimizationStats: !!optimizationStats,
    compressionRatio: optimizationStats?.compressionRatio || 0,
    
    // Progress labels
    progressLabel: progress < 20 ? 'Analüüsin...' :
                  progress < 40 ? 'Lõikan...' :
                  progress < 70 ? 'Optimeerin...' :
                  progress < 95 ? 'Laen üles...' : 'Valmis!'
  }
}

// Simplified hook for basic optimization without upload
export function useImageOptimizationOnly() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const optimizeImage = useCallback(async (
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'webp' | 'png'
    } = {}
  ) => {
    setIsOptimizing(true)
    setResult(null)

    try {
      const optimizationResult = await optimizeImageBeforeUpload(file, options)
      setResult(optimizationResult)
      return optimizationResult
    } catch (error) {
      console.error('Optimization failed:', error)
      throw error
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  return {
    isOptimizing,
    result,
    optimizeImage
  }
}