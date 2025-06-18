// src/app/api/upload/image/route.ts - CLEAN FROM SCRATCH
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔄 Image upload API called')
  
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Validate file exists
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
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `news_${timestamp}_${sanitizedName}`
    console.log('📝 Generated filename:', fileName)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('🔄 File converted to buffer, size:', buffer.length)

    // Try Supabase Storage first
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('🔄 Attempting Supabase Storage upload...')
      
      try {
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`news/${fileName}`, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.log('⚠️ Supabase upload failed:', error.message)
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
        console.log('⚠️ Supabase error:', supabaseError)
      }
    }

    // If production and Supabase failed, return error
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ Production: No cloud storage available')
      return NextResponse.json(
        { 
          error: 'Pildi üleslaadimine ebaõnnestus',
          details: 'Cloud storage not available',
          suggestion: 'Check Supabase Storage configuration'
        },
        { status: 500 }
      )
    }

    // Development: Try local storage
    console.log('🔄 Development: Using local file storage...')
    
    try {
      const uploadDir = join(process.cwd(), 'public', 'images', 'news')
      console.log('📁 Upload directory:', uploadDir)
      
      await mkdir(uploadDir, { recursive: true })
      console.log('✅ Directory verified/created')

      const filePath = join(uploadDir, fileName)
      console.log('💾 Writing file to:', filePath)
      
      await writeFile(filePath, buffer)
      console.log('✅ File written successfully to local storage')

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

export async function GET() {
  return NextResponse.json({
    message: 'Image upload API is ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    version: '1.0.0'
  })
}