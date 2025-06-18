// src/lib/upload-utils.ts
import { mkdir } from 'fs/promises'
import { join } from 'path'

export const ensureUploadDirectory = async () => {
  try {
    const uploadDir = join(process.cwd(), 'public', 'images', 'news')
    await mkdir(uploadDir, { recursive: true })
    return uploadDir
  } catch (error) {
    console.error('Failed to create upload directory:', error)
    throw new Error('Upload directory creation failed')
  }
}

export const generateFileName = (originalName: string, prefix: string = 'news') => {
  const timestamp = Date.now()
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${prefix}_${timestamp}_${sanitizedName}`
}

export const validateImageFile = (file: File) => {
  const errors: string[] = []

  // Check file type
  if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
    errors.push('Palun vali PNG, JPG, JPEG või WebP faili')
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('Faili suurus ei tohi olla suurem kui 5MB')
  }

  // Check file name length
  if (file.name.length > 100) {
    errors.push('Faili nimi on liiga pikk')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}