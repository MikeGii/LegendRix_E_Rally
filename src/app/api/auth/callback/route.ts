// src/app/api/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')
  const redirect_to = requestUrl.searchParams.get('redirect_to')

  console.log('🔄 Auth callback called with:', { token_hash: !!token_hash, type, code: !!code, redirect_to })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle password reset (recovery) flow
  if (token_hash && type === 'recovery') {
    try {
      console.log('🔐 Processing password reset token...')
      
      // For password reset, we need to exchange the token for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash)
      
      if (error) {
        console.error('❌ Password reset token exchange failed:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=invalid_link`)
      }

      if (data.session) {
        console.log('✅ Password reset session created successfully')
        // Create response with session cookies
        const response = NextResponse.redirect(`${requestUrl.origin}/reset-password`)
        
        // Set the session in cookies so it persists
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
        
        return response
      }
    } catch (error) {
      console.error('❌ Password reset processing error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=processing_failed`)
    }
  }

  // Handle email verification (signup) flow
  if (token_hash && (type === 'email' || type === 'signup')) {
    try {
      console.log('📧 Processing email verification...')
      
      // For email verification, use verifyOtp
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      if (error) {
        console.error('❌ Email verification failed:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
      }

      if (data.session && data.user) {
        console.log('✅ Email verified successfully')
        
        // User should already exist from the trigger during registration
        // Just update their email_verified status
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email_verified: true,
            status: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('⚠️ Could not update email verification status:', updateError)
          // Don't fail - the email was verified in auth system
        }
        
        return NextResponse.redirect(`${requestUrl.origin}/?verified=true`)
      }
    
    }
     catch (error) {
      console.error('❌ Email verification error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
    }
  }

  // Handle legacy code-based flow
  if (code) {
    try {
      console.log('🔄 Processing legacy code flow...')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Code exchange failed:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.session && data.user) {
        // Check if this is a redirect_to request
        if (redirect_to) {
          console.log('✅ Redirecting to:', redirect_to)
          return NextResponse.redirect(`${requestUrl.origin}${redirect_to}`)
        }
        
        // Handle user creation for code-based flow
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingUser) {
          const userMetadata = data.user.user_metadata || {}
          const newUserData = {
            id: data.user.id,
            email: data.user.email!,
            name: userMetadata.name || data.user.email!,
            player_name: userMetadata.player_name || null,
            role: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
            email_verified: true,
            admin_approved: data.user.email === 'ewrc.admin@ideemoto.ee',
            status: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
          }

          await supabase.from('users').insert([newUserData])
        }
        
        return NextResponse.redirect(`${requestUrl.origin}/?verified=true`)
      }
    } catch (error) {
      console.error('❌ Code exchange error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
    }
  }

  // Fallback redirect
  console.log('❌ No valid parameters found, redirecting to error')
  return NextResponse.redirect(`${requestUrl.origin}/?error=invalid_link`)
}