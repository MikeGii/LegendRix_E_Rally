// src/app/api/upload/image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Faili pole valitud' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
      return NextResponse.json(
        { error: 'Palun vali PNG, JPG, JPEG või WebP faili' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Faili suurus ei tohi olla suurem kui 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `news_${timestamp}_${originalName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Option 1: Upload to Supabase Storage (recommended for production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV === 'production') {
      try {
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`news/${fileName}`, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Supabase upload error:', error)
          // Fall back to local storage
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(`news/${fileName}`)

          return NextResponse.json({
            message: 'Pilt laeti edukalt üles',
            url: publicUrlData.publicUrl,
            fileName: fileName
          })
        }
      } catch (supabaseError) {
        console.error('Supabase storage error:', supabaseError)
        // Continue to local storage fallback
      }
    }

    // Option 2: Save to local public/images folder (development/fallback)
    try {
      // Ensure the directory exists
      const uploadDir = join(process.cwd(), 'public', 'images', 'news')
      
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (dirError) {
        // Directory might already exist, continue
      }

      // Write file to public/images/news/
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      // Return the public URL path
      const publicUrl = `/images/news/${fileName}`

      return NextResponse.json({
        message: 'Pilt laeti edukalt üles',
        url: publicUrl,
        fileName: fileName
      })

    } catch (localError) {
      console.error('Local file write error:', localError)
      return NextResponse.json(
        { error: 'Pildi salvestamine ebaõnnestus' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Pildi üleslaadimine ebaõnnestus' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Meetod pole lubatud' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Meetod pole lubatud' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Meetod pole lubatud' },
    { status: 405 }
  )
}