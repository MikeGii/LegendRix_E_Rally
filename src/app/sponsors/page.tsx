// src/app/sponsors/page.tsx - Complete Sponsors Management Admin Page with proper layout
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardLayout } from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface BigSponsor {
  id: string
  name: string
  logo_url: string
  website_url?: string
  display_order: number
  is_active: boolean
  created_at: string
}

interface StreamSupporter {
  id: string
  supporter_name: string
  donation_amount: number
  donation_month: number
  donation_year: number
  is_active: boolean
  created_at: string
}

export default function SponsorsPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'sponsors' | 'supporters'>('sponsors')
  const [sponsors, setSponsors] = useState<BigSponsor[]>([])
  const [supporters, setSupporters] = useState<StreamSupporter[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form states for adding new items
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    display_order: 0
  })

  const [newSupporter, setNewSupporter] = useState({
    supporter_name: '',
    donation_amount: '',
    donation_month: new Date().getMonth() + 1,
    donation_year: new Date().getFullYear()
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
    }
  }, [authLoading, user])

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch sponsors
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('big_sponsors')
        .select('*')
        .order('display_order', { ascending: true })

      if (sponsorsError) {
        console.error('Error fetching sponsors:', sponsorsError)
      } else {
        setSponsors(sponsorsData || [])
      }

      // Fetch supporters
      const { data: supportersData, error: supportersError } = await supabase
        .from('stream_supporters')
        .select('*')
        .order('created_at', { ascending: false })

      if (supportersError) {
        console.error('Error fetching supporters:', supportersError)
      } else {
        setSupporters(supportersData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('big_sponsors')
        .insert([{
          name: newSponsor.name,
          logo_url: newSponsor.logo_url,
          website_url: newSponsor.website_url || null,
          display_order: newSponsor.display_order,
          is_active: true
        }])

      if (error) {
        setMessage({ type: 'error', text: `Error adding sponsor: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: 'Sponsor added successfully!' })
      setNewSponsor({ name: '', logo_url: '', website_url: '', display_order: 0 })
      fetchData()
    } catch (error) {
      console.error('Error adding sponsor:', error)
      setMessage({ type: 'error', text: 'Failed to add sponsor' })
    }
  }

  const handleAddSupporter = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('stream_supporters')
        .insert([{
          supporter_name: newSupporter.supporter_name,
          donation_amount: parseFloat(newSupporter.donation_amount),
          donation_month: newSupporter.donation_month,
          donation_year: newSupporter.donation_year,
          is_active: true
        }])

      if (error) {
        setMessage({ type: 'error', text: `Error adding supporter: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: 'Supporter added successfully!' })
      setNewSupporter({
        supporter_name: '',
        donation_amount: '',
        donation_month: new Date().getMonth() + 1,
        donation_year: new Date().getFullYear()
      })
      fetchData()
    } catch (error) {
      console.error('Error adding supporter:', error)
      setMessage({ type: 'error', text: 'Failed to add supporter' })
    }
  }

  const handleToggleActive = async (type: 'sponsor' | 'supporter', id: string, currentStatus: boolean) => {
    try {
      const table = type === 'sponsor' ? 'big_sponsors' : 'stream_supporters'
      
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        setMessage({ type: 'error', text: `Error updating ${type}: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: `${type} updated successfully!` })
      fetchData()
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
      setMessage({ type: 'error', text: `Failed to update ${type}` })
    }
  }

  const handleDelete = async (type: 'sponsor' | 'supporter', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const table = type === 'sponsor' ? 'big_sponsors' : 'stream_supporters'
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        setMessage({ type: 'error', text: `Error deleting ${type}: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: `${type} deleted successfully!` })
      fetchData()
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      setMessage({ type: 'error', text: `Failed to delete ${type}` })
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni',
      'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'
    ]
    return months[month - 1]
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400">Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Toetamised</h1>
          <p className="text-xl text-slate-300">Manage sponsors and stream supporters</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-900/50 border-green-700/50 text-green-300'
              : 'bg-red-900/50 border-red-700/50 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              <span>{message.type === 'success' ? '✅' : '❌'}</span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sponsors')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'sponsors'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xl mr-2">🏢</span>
              Big Sponsors
            </button>
            <button
              onClick={() => setActiveTab('supporters')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'supporters'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xl mr-2">💝</span>
              Stream Supporters
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'sponsors' ? (
          <div className="space-y-6">
            {/* Add New Sponsor Form */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add New Sponsor</h3>
              <form onSubmit={handleAddSponsor} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={newSponsor.logo_url}
                    onChange={(e) => setNewSponsor({ ...newSponsor, logo_url: e.target.value })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={newSponsor.website_url}
                    onChange={(e) => setNewSponsor({ ...newSponsor, website_url: e.target.value })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={newSponsor.display_order}
                    onChange={(e) => setNewSponsor({ ...newSponsor, display_order: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                  >
                    Add Sponsor
                  </button>
                </div>
              </form>
            </div>

            {/* Sponsors List */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Current Sponsors</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading sponsors...</p>
                </div>
              ) : sponsors.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No sponsors found</p>
              ) : (
                <div className="space-y-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-12 w-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/sponsor-placeholder.png'
                          }}
                        />
                        <div>
                          <h4 className="text-white font-medium">{sponsor.name}</h4>
                          <p className="text-slate-400 text-sm">Order: {sponsor.display_order}</p>
                          {sponsor.website_url && (
                            <a
                              href={sponsor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 text-sm hover:underline"
                            >
                              {sponsor.website_url}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive('sponsor', sponsor.id, sponsor.is_active)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            sponsor.is_active
                              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                          }`}
                        >
                          {sponsor.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleDelete('sponsor', sponsor.id)}
                          className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add New Supporter Form */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add New Stream Supporter</h3>
              <form onSubmit={handleAddSupporter} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Supporter Name</label>
                  <input
                    type="text"
                    value={newSupporter.supporter_name}
                    onChange={(e) => setNewSupporter({ ...newSupporter, supporter_name: e.target.value })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Donation Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSupporter.donation_amount}
                    onChange={(e) => setNewSupporter({ ...newSupporter, donation_amount: e.target.value })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Month</label>
                  <select
                    value={newSupporter.donation_month}
                    onChange={(e) => setNewSupporter({ ...newSupporter, donation_month: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                  <select
                    value={newSupporter.donation_year}
                    onChange={(e) => setNewSupporter({ ...newSupporter, donation_year: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors duration-200"
                  >
                    Add Supporter
                  </button>
                </div>
              </form>
            </div>

            {/* Supporters List */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Stream Supporters</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading supporters...</p>
                </div>
              ) : supporters.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No supporters found</p>
              ) : (
                <div className="space-y-4">
                  {supporters.map((supporter, index) => (
                    <div key={supporter.id} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${index < 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-700/50 text-slate-300'}
                        `}>
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{supporter.supporter_name}</h4>
                          <p className="text-slate-400 text-sm">
                            {getMonthName(supporter.donation_month)} {supporter.donation_year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-green-400 font-semibold text-lg">
                          {supporter.donation_amount.toFixed(2)}€
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive('supporter', supporter.id, supporter.is_active)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              supporter.is_active
                                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                            }`}
                          >
                            {supporter.is_active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => handleDelete('supporter', supporter.id)}
                            className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to Dashboard - Removed since navigation is in header */}
      </div>
    </DashboardLayout>
  )
}