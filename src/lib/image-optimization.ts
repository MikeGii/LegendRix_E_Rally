// src/lib/image-optimization.ts
// This layer sits BEFORE your existing upload API - no changes to upload logic needed!

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
  enableCropping?: boolean
}

export interface OptimizedImageResult {
  optimizedFile: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  metadata: {
    width: number
    height: number
    format: string
    quality: number
  }
}

export const optimizeImageBeforeUpload = async (
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> => {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
    format = 'jpeg',
    enableCropping = false
  } = options

  console.log('🔄 Starting image optimization...', {
    originalSize: file.size,
    originalType: file.type,
    targetFormat: format,
    maxDimensions: `${maxWidth}x${maxHeight}`
  })

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        let { width, height } = img

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Set canvas dimensions to optimized size
        canvas.width = width
        canvas.height = height

        // Enable high-quality image rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Draw optimized image
          ctx.drawImage(img, 0, 0, width, height)
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create optimized file with proper name
              const optimizedFile = new File(
                [blob], 
                `optimized_${file.name.replace(/\.[^/.]+$/, '')}.${format}`,
                { 
                  type: `image/${format}`,
                  lastModified: Date.now()
                }
              )

              const result: OptimizedImageResult = {
                optimizedFile,
                originalSize: file.size,
                optimizedSize: blob.size,
                compressionRatio: Math.round((1 - blob.size / file.size) * 100),
                metadata: {
                  width,
                  height,
                  format,
                  quality
                }
              }

              console.log('✅ Image optimization complete:', {
                originalSize: `${Math.round(file.size / 1024)}KB`,
                optimizedSize: `${Math.round(blob.size / 1024)}KB`,
                compressionRatio: `${result.compressionRatio}%`,
                dimensions: `${width}x${height}`
              })

              resolve(result)
            } else {
              reject(new Error('Pildi optimeerimine ebaõnnestus'))
            }
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        console.error('❌ Optimization error:', error)
        reject(new Error('Pildi töötlemine ebaõnnestus'))
      }
    }

    img.onerror = () => {
      reject(new Error('Pildi laadimine ebaõnnestus'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Validate image before optimization
export const validateImageForOptimization = (file: File) => {
  const errors: string[] = []
  const maxSize = 20 * 1024 * 1024 // 20MB before optimization

  if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
    errors.push('Palun vali PNG, JPG, JPEG või WebP faili')
  }

  if (file.size > maxSize) {
    errors.push('Faili suurus ei tohi olla suurem kui 20MB')
  }

  if (file.name.length > 100) {
    errors.push('Faili nimi on liiga pikk')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get image dimensions and metadata
export const getImageMetadata = async (file: File) => {
  return new Promise<{
    width: number
    height: number
    size: number
    type: string
    aspectRatio: number
  }>((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const metadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
        aspectRatio: img.naturalWidth / img.naturalHeight
      }
      
      console.log('📊 Image metadata:', metadata)
      resolve(metadata)
      URL.revokeObjectURL(img.src)
    }
    
    img.onerror = () => {
      reject(new Error('Pildi metaandmete lugemine ebaõnnestus'))
      URL.revokeObjectURL(img.src)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Advanced cropping function (preserves your existing crop logic)
export const cropImageBeforeOptimization = async (
  file: File,
  cropData: { x: number; y: number; width: number; height: number }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate actual crop dimensions based on percentages
        const cropX = (cropData.x / 100) * img.naturalWidth
        const cropY = (cropData.y / 100) * img.naturalHeight
        const cropWidth = (cropData.width / 100) * img.naturalWidth
        const cropHeight = (cropData.height / 100) * img.naturalHeight

        // Set canvas size to match crop
        canvas.width = cropWidth
        canvas.height = cropHeight

        // Enable high-quality rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Draw cropped image
          ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
          )
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File(
                [blob], 
                `cropped_${file.name}`,
                { 
                  type: file.type,
                  lastModified: Date.now()
                }
              )
              
              console.log('✅ Image cropped successfully')
              resolve(croppedFile)
            } else {
              reject(new Error('Pildi lõikamine ebaõnnestus'))
            }
          },
          file.type,
          0.95 // High quality for cropped images
        )
      } catch (error) {
        console.error('❌ Cropping error:', error)
        reject(new Error('Pildi lõikamine ebaõnnestus'))
      }
    }

    img.onerror = () => {
      reject(new Error('Pildi laadimine ebaõnnestus'))
    }

    img.src = URL.createObjectURL(file)
  })
}