// src/components/landing/supporters/StreamSupportersTable.tsx - Updated with web font
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface StreamSupporter {
  id: string
  supporter_name: string
  donation_amount: number
  donation_month: number
  donation_year: number
}

export function StreamSupportersTable() {
  const [supporters, setSupporters] = useState<StreamSupporter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllSupporters()
  }, [])

  const fetchAllSupporters = async () => {
    try {
      // Fetch ALL active supporters (not limited by month)
      const { data: supportersData, error } = await supabase
        .from('stream_supporters')
        .select('*')
        .eq('is_active', true)
        .order('supporter_name', { ascending: true })

      if (error) {
        console.error('Error fetching supporters:', error)
      } else {
        setSupporters(supportersData || [])
      }
    } catch (error) {
      console.error('Error fetching supporters:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Laadin toetajaid...</p>
        </div>
      </div>
    )
  }

  // If no supporters at all
  if (supporters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-slate-500 text-4xl">💝</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Toetajaid pole veel</h3>
        <p className="text-slate-400">Esimesed toetajad ilmuvad siia, kui keegi on toetuse teinud.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Simple transparent table with 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {supporters.map((supporter, index) => (
          <div 
            key={supporter.id}
            className="text-center p-4 hover:bg-slate-800/10 transition-all duration-300 rounded-lg"
          >
            <span className="text-white font-medium block supporter-name">
              {supporter.supporter_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}