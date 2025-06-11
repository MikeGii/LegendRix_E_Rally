import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')

  console.log('🔄 Auth callback received:', { token_hash: !!token_hash, type, code: !!code })

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Verify the email confirmation token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      if (error) {
        console.error('❌ Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
      }

      if (data.session) {
        console.log('✅ Email verification successful for:', data.session.user.email)
        
        // Set the session cookie and redirect to login with success message
        const response = NextResponse.redirect(`${requestUrl.origin}/?verified=true`)
        
        // Optional: Set auth cookies if needed
        response.cookies.set('supabase-auth-token', data.session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        
        return response
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
    }
  }

  // Handle legacy code-based flow (if still used)
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.session) {
        console.log('✅ Code exchange successful for:', data.session.user.email)
        return NextResponse.redirect(`${requestUrl.origin}/?verified=true`)
      }
    } catch (error) {
      console.error('❌ Code exchange exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
    }
  }

  // Fallback redirect
  console.log('⚠️ No valid token or code found, redirecting to home')
  return NextResponse.redirect(`${requestUrl.origin}/?error=invalid_link`)
}