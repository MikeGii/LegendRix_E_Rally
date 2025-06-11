'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuthPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    setResult('Testing authentication...')
    
    try {
      // Test 1: Check Supabase connection
      const { data: session } = await supabase.auth.getSession()
      console.log('Current session:', session)
      
      // Test 2: Check users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (usersError) {
        setResult(`Users table error: ${usersError.message}`)
        return
      }
      
      // Test 3: Try to find your admin user
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'ewrc.admin@ideemoto.ee')
        .single()
      
      if (adminError) {
        setResult(`Admin user not found: ${adminError.message}. This might be the issue!`)
        return
      }
      
      if (adminUser) {
        setResult(`✅ Admin user found: ${JSON.stringify(adminUser, null, 2)}`)
      } else {
        setResult('❌ Admin user not found in database')
      }
      
    } catch (err: any) {
      setResult(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setResult('Testing login...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ewrc.admin@ideemoto.ee',
        password: 'your-password-here' // Replace with actual password
      })
      
      if (error) {
        setResult(`Login error: ${error.message}`)
        return
      }
      
      if (data.session) {
        setResult(`✅ Login successful! Session: ${JSON.stringify({
          user_id: data.user?.id,
          email: data.user?.email,
          session: !!data.session
        }, null, 2)}`)
        
        // Now test fetching user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user?.id)
          .single()
        
        if (profileError) {
          setResult(prev => prev + `\n\n❌ Profile fetch error: ${profileError.message}`)
        } else {
          setResult(prev => prev + `\n\n✅ Profile loaded: ${JSON.stringify(userProfile, null, 2)}`)
        }
      }
      
    } catch (err: any) {
      setResult(`Login test error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Auth Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={testAuth}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>
          
          <button 
            onClick={testLogin}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white mb-4">Test Results:</h2>
          <pre className="text-green-300 whitespace-pre-wrap text-sm">
            {result || 'Click a button to run tests'}
          </pre>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white mb-4">Environment Check:</h2>
          <div className="text-sm text-gray-300">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}