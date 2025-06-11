'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuthPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const runFullDiagnostic = async () => {
    setLoading(true)
    let output = '=== FULL AUTH DIAGNOSTIC ===\n\n'
    
    try {
      // Test 1: Check current session
      output += '1. CHECKING CURRENT SESSION...\n'
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        output += `❌ Session error: ${sessionError.message}\n\n`
      } else if (sessionData.session) {
        output += `✅ Session exists:\n`
        output += `   User ID: ${sessionData.session.user.id}\n`
        output += `   Email: ${sessionData.session.user.email}\n`
        output += `   Created: ${sessionData.session.user.created_at}\n\n`
      } else {
        output += `❌ No active session\n\n`
      }

      // Test 2: Check users table structure
      output += '2. CHECKING USERS TABLE...\n'
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(10)

      if (usersError) {
        output += `❌ Users table error: ${usersError.message}\n`
        output += `   Code: ${usersError.code}\n`
        output += `   Details: ${usersError.details}\n\n`
      } else {
        output += `✅ Users table accessible\n`
        output += `   Total users found: ${allUsers?.length || 0}\n`
        
        if (allUsers && allUsers.length > 0) {
          output += `   Users in database:\n`
          allUsers.forEach((user, index) => {
            output += `   ${index + 1}. ID: ${user.id}\n`
            output += `      Email: ${user.email}\n`
            output += `      Name: ${user.name}\n`
            output += `      Role: ${user.role}\n\n`
          })
        }
      }

      // Test 3: Check if auth user exists in users table
      if (sessionData.session) {
        output += '3. CHECKING AUTH USER IN USERS TABLE...\n'
        const authUserId = sessionData.session.user.id
        
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUserId)
          .single()

        if (profileError) {
          output += `❌ Auth user NOT found in users table\n`
          output += `   Looking for ID: ${authUserId}\n`
          output += `   Error: ${profileError.message}\n`
          output += `   Code: ${profileError.code}\n\n`
          
          // Check if user exists by email instead
          output += '4. CHECKING BY EMAIL...\n'
          const { data: emailUser, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', sessionData.session.user.email)
            .single()

          if (emailError) {
            output += `❌ User not found by email either: ${emailError.message}\n\n`
          } else {
            output += `✅ User found by email but with different ID:\n`
            output += `   Auth ID: ${authUserId}\n`
            output += `   DB ID: ${emailUser.id}\n`
            output += `   This is the problem! IDs don't match.\n\n`
          }
        } else {
          output += `✅ Auth user found in users table:\n`
          output += `   ${JSON.stringify(userProfile, null, 2)}\n\n`
        }
      }

      // Test 4: Test direct login
      output += '5. TESTING DIRECT LOGIN...\n'
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'ewrc.admin@ideemoto.ee',
        password: 'your-actual-password' // You'll need to replace this
      })

      if (loginError) {
        output += `❌ Login failed: ${loginError.message}\n\n`
      } else {
        output += `✅ Login successful\n`
        output += `   New session user ID: ${loginData.user?.id}\n\n`
      }

    } catch (error: any) {
      output += `❌ Unexpected error: ${error.message}\n`
    }

    setResult(output)
    setLoading(false)
  }

  const fixUserIdMismatch = async () => {
    setLoading(true)
    let output = '=== FIXING USER ID MISMATCH ===\n\n'

    try {
      // Get current auth session
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        output += '❌ No active session. Please login first.\n'
        setResult(output)
        setLoading(false)
        return
      }

      const authUserId = sessionData.session.user.id
      const authEmail = sessionData.session.user.email

      output += `Auth User ID: ${authUserId}\n`
      output += `Auth Email: ${authEmail}\n\n`

      // Find user by email
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authEmail)
        .single()

      if (findError) {
        output += `❌ User not found by email: ${findError.message}\n`
        output += 'Creating new user record...\n'

        // Create new user record with correct auth ID
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            id: authUserId,
            email: authEmail,
            name: sessionData.session.user.user_metadata?.name || 'Admin User',
            role: 'admin',
            email_verified: true,
            admin_approved: true,
            status: 'approved',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()

        if (createError) {
          output += `❌ Failed to create user: ${createError.message}\n`
        } else {
          output += `✅ New user created successfully!\n`
        }
      } else {
        output += `✅ User found by email\n`
        output += `Current DB ID: ${existingUser.id}\n`
        output += `Auth ID: ${authUserId}\n\n`

        if (existingUser.id !== authUserId) {
          output += 'IDs don\'t match. Updating user ID...\n'

          // Update the existing user record with the correct auth ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              id: authUserId,
              updated_at: new Date().toISOString()
            })
            .eq('email', authEmail)

          if (updateError) {
            output += `❌ Failed to update user ID: ${updateError.message}\n`
            
            // Alternative: Delete old record and create new one
            output += 'Trying alternative approach: delete and recreate...\n'
            
            await supabase.from('users').delete().eq('email', authEmail)
            
            const { error: createError } = await supabase
              .from('users')
              .insert([{
                id: authUserId,
                email: authEmail,
                name: existingUser.name,
                role: existingUser.role,
                email_verified: existingUser.email_verified,
                admin_approved: existingUser.admin_approved,
                status: existingUser.status,
                created_at: existingUser.created_at,
                updated_at: new Date().toISOString()
              }])

            if (createError) {
              output += `❌ Failed to recreate user: ${createError.message}\n`
            } else {
              output += `✅ User recreated with correct ID!\n`
            }
          } else {
            output += `✅ User ID updated successfully!\n`
          }
        } else {
          output += '✅ IDs already match - no action needed.\n'
        }
      }

    } catch (error: any) {
      output += `❌ Error: ${error.message}\n`
    }

    setResult(output)
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    setResult('Testing complete login flow...\n')

    try {
      // First, sign out to start fresh
      await supabase.auth.signOut()
      
      let output = '1. Signed out\n'
      
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ewrc.admin@ideemoto.ee',
        password: 'your-password-here' // Replace with actual password
      })

      if (error) {
        output += `❌ Login failed: ${error.message}\n`
        setResult(output)
        setLoading(false)
        return
      }

      output += '2. ✅ Login successful\n'
      output += `   User ID: ${data.user?.id}\n`

      // Try to fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single()

      if (profileError) {
        output += `3. ❌ Profile fetch failed: ${profileError.message}\n`
      } else {
        output += `3. ✅ Profile fetched successfully:\n`
        output += `   Name: ${profile.name}\n`
        output += `   Role: ${profile.role}\n`
        output += `   Status: ${profile.status}\n`
      }

      setResult(output)
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Comprehensive Auth Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={runFullDiagnostic}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg disabled:opacity-50 font-medium"
          >
            {loading ? 'Running...' : '🔍 Full Diagnostic'}
          </button>
          
          <button 
            onClick={fixUserIdMismatch}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg disabled:opacity-50 font-medium"
          >
            {loading ? 'Fixing...' : '🔧 Fix User ID Mismatch'}
          </button>
          
          <button 
            onClick={testLogin}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-lg disabled:opacity-50 font-medium"
          >
            {loading ? 'Testing...' : '🧪 Test Full Login'}
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-700 px-6 py-3 border-b border-gray-600">
            <h2 className="text-white font-medium">Diagnostic Results</h2>
          </div>
          <div className="p-6">
            <pre className="text-green-300 whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {result || 'Click "Full Diagnostic" to analyze the authentication issue...'}
            </pre>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
          <h3 className="text-yellow-300 font-bold mb-2">🚨 Common Issue</h3>
          <p className="text-yellow-200 text-sm">
            The most likely problem: Your Supabase Auth user ID doesn't match the ID in your users table. 
            This happens when you create users manually in the database instead of through the auth system.
          </p>
        </div>
      </div>
    </div>
  )
}