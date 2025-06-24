// src/components/landing/supporters/StreamSupportersTable.tsx
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

interface SupportersByMonth {
  [key: number]: StreamSupporter[]
}

export function StreamSupportersTable() {
  const [supportersByMonth, setSupportersByMonth] = useState<SupportersByMonth>({})
  const [loading, setLoading] = useState(true)

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    fetchSupporters()
  }, [])

  const fetchSupporters = async () => {
    try {
      // Fetch all active supporters for current year
      const { data: supportersData, error } = await supabase
        .from('stream_supporters')
        .select('*')
        .eq('donation_year', currentYear)
        .eq('is_active', true)
        .order('supporter_name', { ascending: true })

      if (error) {
        console.error('Error fetching supporters:', error)
      } else {
        // Group supporters by month
        const groupedByMonth: SupportersByMonth = {}
        
        supportersData?.forEach(supporter => {
          if (!groupedByMonth[supporter.donation_month]) {
            groupedByMonth[supporter.donation_month] = []
          }
          groupedByMonth[supporter.donation_month].push(supporter)
        })

        setSupportersByMonth(groupedByMonth)
      }
    } catch (error) {
      console.error('Error fetching supporters:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni',
      'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'
    ]
    return months[month - 1]
  }

  const SupportersTable = ({ 
    supporters, 
    monthName
  }: { 
    supporters: StreamSupporter[]
    monthName: string
  }) => (
    <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 min-w-0">
      {/* Beautiful month header with decorative elements */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent flex-1"></div>
          <div className="mx-4">
            <span className="text-pink-400 text-2xl">💝</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent flex-1"></div>
        </div>
        <h4 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {monthName}
        </h4>
        <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto"></div>
      </div>
      
      {supporters.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-slate-500 text-2xl">💝</span>
          </div>
          <p className="text-slate-400 text-sm">Selles kuus toetajaid pole</p>
        </div>
      ) : (
        <div className="space-y-3">
          {supporters.map((supporter, index) => (
            <div 
              key={supporter.id}
              className="rounded-xl p-4 hover:bg-slate-800/20 transition-all duration-300"
            >
              <div className="text-center">
                <span 
                  className="text-white font-medium text-lg block"
                  style={{ 
                    fontFamily: '"French Script MT", "Brush Script MT", cursive',
                    fontSize: '4rem',
                    lineHeight: '1.2'
                  }}
                >
                  {supporter.supporter_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

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

  // Get months that have supporters, sorted chronologically
  const monthsWithSupporters = Object.keys(supportersByMonth)
    .map(month => parseInt(month))
    .sort((a, b) => a - b)

  // If no supporters at all
  if (monthsWithSupporters.length === 0) {
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

  // Dynamic grid based on number of months
  const getGridClass = () => {
    const monthCount = monthsWithSupporters.length
    if (monthCount === 1) return "grid grid-cols-1 justify-items-center max-w-md mx-auto"
    if (monthCount === 2) return "grid md:grid-cols-2 gap-6"
    if (monthCount === 3) return "grid md:grid-cols-3 gap-4"
    if (monthCount === 4) return "grid md:grid-cols-2 lg:grid-cols-4 gap-4"
    // For 5+ months, we'll use responsive grid
    return "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  }

  return (
    <div className={getGridClass()}>
      {monthsWithSupporters.map(month => (
        <SupportersTable
          key={month}
          supporters={supportersByMonth[month]}
          monthName={getMonthName(month)}
        />
      ))}
    </div>
  )
}