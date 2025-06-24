// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token ja parool on kohustuslikud' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Parool peab olema vähemalt 8 tähemärki pikk' },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'Parool peab sisaldama vähemalt üht väiketähte, suurtähte ja numbrit' },
        { status: 400 }
      )
    }

    console.log('🔄 Processing password reset...')

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
        { error: 'Token on aegunud või vigane' },
        { status: 400 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', resetData.user_id)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'Kasutaja ei leitud' },
        { status: 404 }
      )
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      console.error('❌ Failed to update password:', updateError)
      return NextResponse.json(
        { error: 'Parooli uuendamine ebaõnnestus' },
        { status: 500 }
      )
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_resets')
      .update({ 
        used: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('token', token)

    if (markUsedError) {
      console.error('❌ Failed to mark token as used:', markUsedError)
      // Don't fail the request for this, password was already updated
    }

    // Clean up old tokens for this user
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .neq('token', token)

    console.log('✅ Password reset completed successfully for:', user.email)

    return NextResponse.json(
      { message: 'Parool edukalt uuendatud' },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Password reset error:', error)
    return NextResponse.json(
      { error: 'Serveri viga' },
      { status: 500 }
    )
  }
}