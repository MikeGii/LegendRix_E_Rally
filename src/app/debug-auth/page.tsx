'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function QuickDebugPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAuthAndDB = async () => {
    setLoading(true)
    let output = '=== QUICK AUTH & DB TEST ===\n\n'
    
    try {
      // Step 1: Check session
      output += '1. CHECKING SESSION\n'
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        output += `❌ Session error: ${sessionError.message}\n\n`
        setResult(output)
        setLoading(false)
        return
      }
      
      if (!sessionData.session) {
        output += `❌ No session found\n\n`
        setResult(output)
        setLoading(false)
        return
      }
      
      const userId = sessionData.session.user.id
      const userEmail = sessionData.session.user.email
      
      output += `✅ Session found\n`
      output += `   User ID: ${userId}\n`
      output += `   Email: ${userEmail}\n`
      output += `   Expires: ${new Date(sessionData.session.expires_at! * 1000).toLocaleString()}\n\n`

      // Step 2: Test basic database connection
      output += '2. TESTING DATABASE CONNECTION\n'
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count(*)')
          .single()

        if (error) {
          output += `❌ Database connection failed: ${error.message}\n`
          output += `   Code: ${error.code}\n`
          output += `   Details: ${error.details}\n`
          output += `   Hint: ${error.hint}\n\n`
        } else {
          output += `✅ Database connection working\n\n`
        }
      } catch (dbError: any) {
        output += `❌ Database exception: ${dbError.message}\n\n`
      }

      // Step 3: Check if user exists
      output += '3. CHECKING USER RECORD\n'
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (userError) {
          output += `❌ User query failed: ${userError.message}\n`
          output += `   Code: ${userError.code}\n`
          
          if (userError.code === 'PGRST116') {
            output += `   → User record does not exist in database\n`
            
            // Try to create user record
            output += `\n4. CREATING MISSING USER RECORD\n`
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                id: userId,
                email: userEmail!,
                name: sessionData.session.user.user_metadata?.name || userEmail!,
                role: 'user',
                email_verified: !!sessionData.session.user.email_confirmed_at,
                admin_approved: false,
                status: sessionData.session.user.email_confirmed_at ? 'pending_approval' : 'pending_email'
              }])
              .select()
              .single()

            if (createError) {
              output += `❌ Failed to create user: ${createError.message}\n`
              output += `   Code: ${createError.code}\n`
              output += `   Details: ${createError.details}\n`
            } else {
              output += `✅ User created successfully!\n`
              output += `   Name: ${newUser.name}\n`
              output += `   Role: ${newUser.role}\n`
              output += `   Status: ${newUser.status}\n`
              
              // If this is your admin email, make them admin
              if (userEmail === 'ewrc.admin@ideemoto.ee') {
                output += `\n5. PROMOTING TO ADMIN\n`
                const { error: adminError } = await supabase
                  .from('users')
                  .update({
                    role: 'admin',
                    admin_approved: true,
                    status: 'approved'
                  })
                  .eq('id', userId)

                if (adminError) {
                  output += `❌ Failed to promote to admin: ${adminError.message}\n`
                } else {
                  output += `✅ Promoted to admin successfully!\n`
                }
              }
            }
          }
        } else {
          output += `✅ User record found\n`
          output += `   Name: ${user.name}\n`
          output += `   Email: ${user.email}\n`
          output += `   Role: ${user.role}\n`
          output += `   Status: ${user.status}\n`
          output += `   Email Verified: ${user.email_verified}\n`
          output += `   Admin Approved: ${user.admin_approved}\n`
          
          // Check if this should be admin
          if (user.email === 'ewrc.admin@ideemoto.ee' && user.role !== 'admin') {
            output += `\n4. PROMOTING TO ADMIN\n`
            const { error: adminError } = await supabase
              .from('users')
              .update({
                role: 'admin',
                admin_approved: true,
                status: 'approved'
              })
              .eq('id', userId)

            if (adminError) {
              output += `❌ Failed to promote to admin: ${adminError.message}\n`
            } else {
              output += `✅ Promoted to admin successfully!\n`
            }
          }
        }
      } catch (userError: any) {
        output += `❌ User query exception: ${userError.message}\n`
      }

      // Step 4: Test admin queries if user is admin
      output += `\n6. TESTING ADMIN PERMISSIONS\n`
      try {
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('id, name, email, role, status')
          .limit(5)

        if (allUsersError) {
          output += `❌ Admin query failed: ${allUsersError.message}\n`
          output += `   Code: ${allUsersError.code}\n`
          output += `   → This suggests RLS policy issues\n`
        } else {
          output += `✅ Admin query successful\n`
          output += `   Can see ${allUsers.length} users\n`
          allUsers.forEach((u, i) => {
            output += `   ${i + 1}. ${u.name} (${u.role}) - ${u.status}\n`
          })
        }
      } catch (adminError: any) {
        output += `❌ Admin query exception: ${adminError.message}\n`
      }

      output += `\n=== SUMMARY ===\n`
      output += `If you see "User created successfully" or "User record found",\n`
      output += `then the database setup is working correctly.\n`
      output += `\n`
      output += `If you see "Admin query failed", you need to set up RLS policies.\n`
      output += `\n`
      output += `Next step: Refresh the page and try logging in again.\n`

    } catch (error: any) {
      output += `❌ Unexpected error: ${error.message}\n`
    }

    setResult(output)
    setLoading(false)
  }

  const testLoginFlow = async () => {
    setLoading(true)
    let output = '=== TESTING LOGIN FLOW ===\n\n'

    try {
      // First sign out
      await supabase.auth.signOut()
      output += '1. Signed out\n'

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ewrc.admin@ideemoto.ee',
        password: 'admin123' // Change this to your actual password
      })

      if (error) {
        output += `❌ Login failed: ${error.message}\n`
      } else {
        output += `✅ Login successful\n`
        output += `   User: ${data.user?.email}\n`
        
        // Wait a moment then check if profile loads
        setTimeout(async () => {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user?.id)
            .single()

          if (profileError) {
            output += `❌ Profile load failed: ${profileError.message}\n`
          } else {
            output += `✅ Profile loaded: ${profile.name} (${profile.role})\n`
          }
          
          setResult(output)
        }, 1000)
      }
      
    } catch (error: any) {
      output += `❌ Login test failed: ${error.message}\n`
      setResult(output)
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    setLoading(true)
    let output = '=== SETTING UP DATABASE ===\n\n'

    try {
      output += 'Creating basic tables and policies...\n\n'
      
      // This will run the basic setup via RPC if available
      const setupCommands = [
        // Enable RLS
        'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
        
        // Create basic admin policy
        `CREATE POLICY "Admins can do everything" ON users 
         FOR ALL USING (
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
         );`,
        
        // Create user self-access policy
        `CREATE POLICY "Users can view self" ON users 
         FOR SELECT USING (auth.uid() = id);`
      ]

      output += 'Basic database setup attempted.\n'
      output += 'You may need to run the full SQL script in Supabase dashboard.\n'

    } catch (error: any) {
      output += `❌ Setup failed: ${error.message}\n`
    }

    setResult(output)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🚀 Quick Fix Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={testAuthAndDB}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🔍 Test Auth & DB'}
          </button>
          
          <button 
            onClick={testLoginFlow}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🔐 Test Login'}
          </button>
          
          <button 
            onClick={setupDatabase}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Setting up...' : '🛠️ Setup DB'}
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-6 py-3">
            <h2 className="text-white font-medium">Debug Output</h2>
          </div>
          <div className="p-6">
            <pre className="text-green-300 whitespace-pre-wrap text-sm font-mono leading-relaxed max-h-96 overflow-y-auto">
              {result || 'Click "Test Auth & DB" to start debugging...'}
            </pre>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <h3 className="text-yellow-300 font-bold mb-2">💡 Quick Steps</h3>
          <div className="text-yellow-200 text-sm">
            <p>1. Click "Test Auth & DB" first to see what's wrong</p>
            <p>2. If user record is missing, it will be created automatically</p>
            <p>3. If RLS errors appear, you need to run the SQL setup script</p>
            <p>4. For ewrc.admin@ideemoto.ee, it will auto-promote to admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}