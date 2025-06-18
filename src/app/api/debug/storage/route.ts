// src/app/api/debug/storage/route.ts - TEMPORARY DEBUG API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🔍 Testing Supabase Storage connection...')
  
  try {
    // Test 1: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment check:', { hasUrl, hasKey })
    
    // Test 2: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    console.log('Buckets:', buckets, 'Error:', bucketsError)
    
    // Test 3: Check specific bucket
    const { data: imagesBucket, error: imagesBucketError } = await supabase.storage.getBucket('images')
    
    console.log('Images bucket:', imagesBucket, 'Error:', imagesBucketError)
    
    // Test 4: Try to list files in bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('news', {
        limit: 5,
        offset: 0
      })
    
    console.log('Files in news folder:', files, 'Error:', filesError)
    
    // Test 5: Get current user info
    const { data: user, error: userError } = await supabase.auth.getUser()
    
    console.log('Current user:', user?.user?.email || 'No user', 'Error:', userError)
    
    return NextResponse.json({
      message: 'Supabase Storage Debug Results',
      environment: {
        hasSupabaseUrl: hasUrl,
        hasSupabaseKey: hasKey,
        nodeEnv: process.env.NODE_ENV
      },
      buckets: {
        allBuckets: buckets,
        bucketsError: bucketsError?.message,
        imagesBucket: imagesBucket,
        imagesBucketError: imagesBucketError?.message
      },
      files: {
        newsFiles: files,
        filesError: filesError?.message
      },
      user: {
        email: user?.user?.email || 'No user',
        userError: userError?.message
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST() {
  console.log('🧪 Testing actual file upload to Supabase...')
  
  try {
    // Create a small test file
    const testContent = 'This is a test file for Supabase Storage'
    const testBuffer = Buffer.from(testContent, 'utf-8')
    const testFileName = `test_${Date.now()}.txt`
    
    console.log('Uploading test file:', testFileName)
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`news/${testFileName}`, testBuffer, {
        contentType: 'text/plain',
        upsert: false
      })
    
    if (error) {
      console.error('Upload test failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('Upload test successful:', data)
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(`news/${testFileName}`)
    
    // Clean up - delete the test file
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([`news/${testFileName}`])
    
    return NextResponse.json({
      success: true,
      uploadData: data,
      publicUrl: publicUrlData.publicUrl,
      deleteError: deleteError?.message || 'Cleanup successful',
      message: 'Supabase Storage upload test completed successfully!'
    })
    
  } catch (error) {
    console.error('❌ Upload test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}