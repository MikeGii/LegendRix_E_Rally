// src/app/api/auth/validate-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token on kohustuslik', valid: false },
        { status: 400 }
      )
    }

    console.log('🔄 Validating reset token...')

    // Check if token exists and is valid
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (resetError || !resetData) {
      console.log('❌ Invalid or expired token')
      return NextResponse.json(
        { error: 'Token on aegunud või vigane', valid: false },
        { status: 400 }
      )
    }

    console.log('✅ Token is valid')
    return NextResponse.json(
      { valid: true, email: resetData.email },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Token validation error:', error)
    return NextResponse.json(
      { error: 'Serveri viga', valid: false },
      { status: 500 }
    )
  }
}