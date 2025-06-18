// src/app/api/upload/image/route.ts - PRODUCTION VERSION
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔄 Image upload API called')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json(
        { error: 'Faili pole valitud' },
        { status: 400 }
      )
    }

    console.log('📁 File received:', file.name, file.type, file.size)

    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'Palun vali PNG, JPG, JPEG või WebP faili' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json(
        { error: 'Faili suurus ei tohi olla suurem kui 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `news_${timestamp}_${originalName}`

    console.log('📝 Generated filename:', fileName)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('🔄 File converted to buffer, size:', buffer.length)

    // Try Supabase Storage first (production recommended)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        console.log('🔄 Attempting Supabase Storage upload...')
        
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`news/${fileName}`, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.log('⚠️ Supabase upload failed, falling back to local:', error.message)
        } else {
          console.log('✅ Supabase upload successful:', data.path)
          
          const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(`news/${fileName}`)

          return NextResponse.json({
            message: 'Pilt laeti edukalt üles (Supabase)',
            url: publicUrlData.publicUrl,
            fileName: fileName,
            storage: 'supabase'
          })
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase storage error, falling back to local:', supabaseError)
      }
    }

    // Fallback to local storage (development/small deployments)
    try {
      console.log('🔄 Using local file storage...')
      
      // Create upload directory path
      const uploadDir = join(process.cwd(), 'public', 'images', 'news')
      console.log('📁 Upload directory:', uploadDir)
      
      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true })
      console.log('✅ Directory verified/created')

      // Write file
      const filePath = join(uploadDir, fileName)
      console.log('💾 Writing file to:', filePath)
      
      await writeFile(filePath, buffer)
      console.log('✅ File written successfully to local storage')

      // Return the public URL path
      const publicUrl = `/images/news/${fileName}`
      console.log('🌐 Public URL:', publicUrl)

      return NextResponse.json({
        message: 'Pilt laeti edukalt üles (Local)',
        url: publicUrl,
        fileName: fileName,
        storage: 'local'
      })

    } catch (localError) {
      console.error('❌ Local file write error:', localError)
      
      return NextResponse.json(
        { 
          error: 'Pildi salvestamine ebaõnnestus',
          details: localError instanceof Error ? localError.message : 'Unknown error',
          fileName: fileName
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ General upload error:', error)
    return NextResponse.json(
      { 
        error: 'Pildi üleslaadimine ebaõnnestus',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Image upload API is ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    version: '1.0.0'
  })
}