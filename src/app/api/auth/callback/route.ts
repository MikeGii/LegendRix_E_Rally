// src/app/api/auth/callback/route.ts - Fixed version that preserves player_name

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')

  console.log('🔄 Auth callback received:', { token_hash: !!token_hash, type, code: !!code })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (token_hash && type) {
    try {
      console.log('📧 Verifying email confirmation token...')
      
      // Verify the email confirmation token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      if (error) {
        console.error('❌ Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
      }

      if (data.session && data.user) {
        console.log('✅ Email verification successful for:', data.user.email)
        console.log('📋 User metadata after verification:', data.user.user_metadata)
        
        // CRITICAL FIX: Check if user record exists in database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Database query error:', fetchError)
          // Continue with redirect but log the error
        }

        // CRITICAL FIX: Create user record if it doesn't exist, including player_name
        if (!existingUser) {
          console.log('📝 Creating user record with metadata during email verification...')
          
          const userMetadata = data.user.user_metadata || {}
          const newUserData = {
            id: data.user.id,
            email: data.user.email!,
            name: userMetadata.name || data.user.email!,
            player_name: userMetadata.player_name || null, // CRITICAL: Include player_name from metadata
            role: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
            email_verified: true,
            admin_approved: data.user.email === 'ewrc.admin@ideemoto.ee',
            status: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
          }

          console.log('💾 Inserting user record:', {
            email: newUserData.email,
            name: newUserData.name,
            player_name: newUserData.player_name,
            role: newUserData.role
          })

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([newUserData])
            .select()
            .single()

          if (createError) {
            console.error('❌ Failed to create user during email verification:', createError)
            // Don't fail the verification, just log the error
          } else {
            console.log('✅ User record created successfully during verification:', {
              email: newUser.email,
              player_name: newUser.player_name
            })
          }
        } else {
          console.log('ℹ️ User record already exists:', {
            email: existingUser.email,
            player_name: existingUser.player_name
          })
          
          // BONUS FIX: Update existing user with player_name if missing
          const userMetadata = data.user.user_metadata || {}
          if (!existingUser.player_name && userMetadata.player_name) {
            console.log('🔄 Updating existing user with missing player_name from metadata...')
            
            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({ 
                player_name: userMetadata.player_name,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)
              .select()
              .single()

            if (updateError) {
              console.error('❌ Failed to update player_name:', updateError)
            } else {
              console.log('✅ Player name updated successfully:', updatedUser.player_name)
            }
          }
        }
        
        // Set the session cookie and redirect to login with success message
        const response = NextResponse.redirect(`${requestUrl.origin}/?verified=true`)
        
        // Set auth cookies to maintain session
        response.cookies.set('supabase-auth-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        
        return response
      } else {
        console.log('⚠️ Email verification succeeded but no session created')
        return NextResponse.redirect(`${requestUrl.origin}/?error=no_session`)
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=verification_failed`)
    }
  }

  // Handle legacy code-based flow (if still used)
  if (code) {
    try {
      console.log('🔄 Processing legacy code-based verification...')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.session && data.user) {
        console.log('✅ Code exchange successful for:', data.user.email)
        console.log('📋 User metadata from code exchange:', data.user.user_metadata)
        
        // Same user creation logic as above for code-based flow
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingUser) {
          console.log('📝 Creating user record from code exchange...')
          
          const userMetadata = data.user.user_metadata || {}
          const newUserData = {
            id: data.user.id,
            email: data.user.email!,
            name: userMetadata.name || data.user.email!,
            player_name: userMetadata.player_name || null, // Include player_name
            role: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'admin' : 'user',
            email_verified: true,
            admin_approved: data.user.email === 'ewrc.admin@ideemoto.ee',
            status: data.user.email === 'ewrc.admin@ideemoto.ee' ? 'approved' : 'pending_approval'
          }

          await supabase.from('users').insert([newUserData])
          console.log('✅ User record created from code exchange')
        }
        
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