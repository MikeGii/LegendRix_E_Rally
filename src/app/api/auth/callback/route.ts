// src/app/api/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (token_hash && type) {
    try {
      // Verify the email confirmation token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
      }

      if (data.session && data.user) {
        // Check if user record exists in database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Continue with redirect but log the error
        }

        // Create user record if it doesn't exist, including player_name
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
      return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
    }
  }

  // Handle legacy code-based flow (if still used)
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.session && data.user) {
        // Same user creation logic as above for code-based flow
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
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/?error=invalid_link`)
}