'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function DebugPage() {
  const [result, setResult] = useState('')

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').single()
      setResult(error ? `Error: ${error.message}` : 'Connection successful!')
    } catch (err: any) {
      setResult(`Network error: ${err.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1>Debug Supabase Connection</h1>
      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Connection
      </button>
      <p className="mt-4">Result: {result}</p>
      <div className="mt-4">
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</p>
        <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
      </div>
    </div>
  )
}