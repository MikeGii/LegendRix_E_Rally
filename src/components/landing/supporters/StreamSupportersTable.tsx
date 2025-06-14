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

export function StreamSupportersTable() {
  const [currentMonthSupporters, setCurrentMonthSupporters] = useState<StreamSupporter[]>([])
  const [previousMonthSupporters, setPreviousMonthSupporters] = useState<StreamSupporter[]>([])
  const [loading, setLoading] = useState(true)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

  useEffect(() => {
    fetchSupporters()
  }, [])

  const fetchSupporters = async () => {
    try {
      // Fetch current month supporters
      const { data: currentData, error: currentError } = await supabase
        .from('stream_supporters')
        .select('*')
        .eq('donation_month', currentMonth)
        .eq('donation_year', currentYear)
        .eq('is_active', true)
        .order('donation_amount', { ascending: false })
        .limit(10)

      if (currentError) {
        console.error('Error fetching current month supporters:', currentError)
      } else {
        setCurrentMonthSupporters(currentData || [])
      }

      // Fetch previous month supporters
      const { data: previousData, error: previousError } = await supabase
        .from('stream_supporters')
        .select('*')
        .eq('donation_month', previousMonth)
        .eq('donation_year', previousYear)
        .eq('is_active', true)
        .order('donation_amount', { ascending: false })
        .limit(10)

      if (previousError) {
        console.error('Error fetching previous month supporters:', previousError)
      } else {
        setPreviousMonthSupporters(previousData || [])
      }
    } catch (error) {
      console.error('Error fetching supporters:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)}€`
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
    title, 
    emptyMessage 
  }: { 
    supporters: StreamSupporter[]
    title: string
    emptyMessage: string 
  }) => (
    <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
      <h4 className="text-xl font-semibold text-white mb-4 text-center">{title}</h4>
      
      {supporters.length === 0 ? (
        <p className="text-slate-400 text-center py-6">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {supporters.map((supporter, index) => (
            <div 
              key={supporter.id}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    index === 1 ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-slate-700/50 text-slate-300'
                  }
                `}>
                  {index + 1}
                </span>
                <span className="text-white font-medium">{supporter.supporter_name}</span>
              </div>
              <span className="text-green-400 font-semibold">
                {formatCurrency(supporter.donation_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SupportersTable
        supporters={currentMonthSupporters}
        title={`${getMonthName(currentMonth)} ${currentYear} Top Toetajad`}
        emptyMessage="Jooksval kuul toetused puuduvad"
      />
      <SupportersTable
        supporters={previousMonthSupporters}
        title={`${getMonthName(previousMonth)} ${previousYear} Top Toetajad`}
        emptyMessage="Eelmisel kuul toetusi ei olnud"
      />
    </div>
  )
}