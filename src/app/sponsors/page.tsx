// src/app/sponsors/page.tsx - Updated with Unified Admin Design
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
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

interface BigSponsorCarouselProps {
  sponsors: BigSponsor[]
  autoPlay?: boolean
  speed?: 'slow' | 'medium' | 'fast'
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
  
  // Editing state for supporters
  const [editingSupporter, setEditingSupporter] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')

  // Form states for adding new items
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    display_order: 0
  })

  const [newSupporter, setNewSupporter] = useState({
    supporter_name: '',
    donation_amount: '0', // Change from '' to '0'
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
        setMessage({ type: 'error', text: `Viga sponsori lisamisel: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: 'Sponsor edukalt lisatud!' })
      setNewSponsor({ name: '', logo_url: '', website_url: '', display_order: 0 })
      fetchData()
    } catch (error) {
      console.error('Error adding sponsor:', error)
      setMessage({ type: 'error', text: 'Sponsori lisamine ebaõnnestus' })
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
        setMessage({ type: 'error', text: `Viga toetaja lisamisel: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: 'Toetaja edukalt lisatud!' })
      setNewSupporter({
        supporter_name: '',
        donation_amount: '',
        donation_month: new Date().getMonth() + 1,
        donation_year: new Date().getFullYear()
      })
      fetchData()
    } catch (error) {
      console.error('Error adding supporter:', error)
      setMessage({ type: 'error', text: 'Toetaja lisamine ebaõnnestus' })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean, type: 'sponsor' | 'supporter') => {
    try {
      const table = type === 'sponsor' ? 'big_sponsors' : 'stream_supporters'
      
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        setMessage({ type: 'error', text: `Viga uuendamisel: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: `${type === 'sponsor' ? 'Sponsor' : 'Toetaja'} edukalt uuendatud!` })
      fetchData()
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
      setMessage({ type: 'error', text: `${type === 'sponsor' ? 'Sponsori' : 'Toetaja'} uuendamine ebaõnnestus` })
    }
  }

  const handleDelete = async (id: string, type: 'sponsor' | 'supporter') => {
    if (!window.confirm(`Kas olete kindel, et soovite selle ${type === 'sponsor' ? 'sponsori' : 'toetaja'} kustutada?`)) {
      return
    }

    try {
      const table = type === 'sponsor' ? 'big_sponsors' : 'stream_supporters'
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        setMessage({ type: 'error', text: `Viga kustutamisel: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: `${type === 'sponsor' ? 'Sponsor' : 'Toetaja'} edukalt kustutatud!` })
      fetchData()
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      setMessage({ type: 'error', text: `${type === 'sponsor' ? 'Sponsori' : 'Toetaja'} kustutamine ebaõnnestus` })
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
          <p className="text-slate-400">Laadin...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Juurdepääs keelatud</h2>
          <p className="text-slate-400">Admin õigused nõutavad.</p>
        </div>
      </div>
    )
  }

  // Calculate stats
  const activeSponsors = sponsors.filter(s => s.is_active).length
  const activeSupporters = supporters.filter(s => s.is_active).length
  const totalDonations = supporters.reduce((sum, s) => sum + s.donation_amount, 0)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Unified Admin Header */}
        <AdminPageHeader
          title="Toetamised"
          description="Halda sponsoreid ja voo toetajaid"
          icon="💝"
          stats={[
            { label: 'Aktiivsed sponsorid', value: activeSponsors, color: 'green' },
            { label: 'Aktiivsed toetajad', value: activeSupporters, color: 'blue' },
            { label: 'Kokku annetusi', value: `€${totalDonations.toFixed(2)}`, color: 'yellow' }
          ]}
          onRefresh={fetchData}
          isLoading={loading}
        />

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${
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
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
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
              Suured sponsorid
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
              Voo toetajad
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'sponsors' ? (
          <div className="space-y-6">
            {/* Add New Sponsor Form */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-xl">➕</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Lisa uus sponsor</h3>
              </div>
              
              <form onSubmit={handleAddSponsor} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nimi</label>
                  <input
                    type="text"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={newSponsor.logo_url}
                    onChange={(e) => setNewSponsor({ ...newSponsor, logo_url: e.target.value })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Veebileht URL</label>
                  <input
                    type="url"
                    value={newSponsor.website_url}
                    onChange={(e) => setNewSponsor({ ...newSponsor, website_url: e.target.value })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Kuvamise järjekord</label>
                  <input
                    type="number"
                    value={newSponsor.display_order}
                    onChange={(e) => setNewSponsor({ ...newSponsor, display_order: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                  >
                    Lisa sponsor
                  </button>
                </div>
              </form>
            </div>

            {/* Sponsors List */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-xl">🏢</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Praegused sponsorid</h3>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Laadin sponsoreid...</p>
                </div>
              ) : sponsors.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Sponsoreid ei leitud</p>
              ) : (
                <div className="space-y-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-12 w-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/image/sponsor-placeholder.png'
                          }}
                        />
                        <div>
                          <h4 className="text-white font-medium">{sponsor.name}</h4>
                          <p className="text-slate-400 text-sm">Järjekord: {sponsor.display_order}</p>
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
                          onClick={() => handleToggleActive(sponsor.id, sponsor.is_active, 'sponsor')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            sponsor.is_active
                              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                          }`}
                        >
                          {sponsor.is_active ? 'Aktiivne' : 'Mitteaktiivne'}
                        </button>
                        <button
                          onClick={() => handleDelete(sponsor.id, 'sponsor')}
                          className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors duration-200"
                        >
                          Kustuta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Stream Supporters Tab
          <div className="space-y-6">
            {/* Add New Supporter Form */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-pink-400 text-xl">➕</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Lisa uus toetaja</h3>
              </div>
              
              <form onSubmit={handleAddSupporter} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Toetaja nimi</label>
                  <input
                    type="text"
                    value={newSupporter.supporter_name}
                    onChange={(e) => setNewSupporter({ ...newSupporter, supporter_name: e.target.value })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Annetuse summa (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSupporter.donation_amount}
                    onChange={(e) => setNewSupporter({ ...newSupporter, donation_amount: e.target.value })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Kuu</label>
                  <select
                    value={newSupporter.donation_month}
                    onChange={(e) => setNewSupporter({ ...newSupporter, donation_month: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Aasta</label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={newSupporter.donation_year}
                    onChange={(e) => setNewSupporter({ ...newSupporter, donation_year: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                  >
                    Lisa toetaja
                  </button>
                </div>
              </form>
            </div>

            {/* Supporters List */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-pink-400 text-xl">💝</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Voo toetajad</h3>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Laadin toetajaid...</p>
                </div>
              ) : supporters.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Toetajaid ei leitud</p>
              ) : (
                <div className="space-y-4">
                  {supporters.map((supporter) => (
                    <div key={supporter.id} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-pink-400 text-xl">💝</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{supporter.supporter_name}</h4>
                          <p className="text-slate-400 text-sm">
                            €{supporter.donation_amount.toFixed(2)} - {getMonthName(supporter.donation_month)} {supporter.donation_year}
                          </p>
                          <p className="text-slate-500 text-xs">
                            Lisatud: {new Date(supporter.created_at).toLocaleDateString('et-EE')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingSupporter === supporter.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-24 p-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                              placeholder="€"
                            />
                            <button
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('stream_supporters')
                                    .update({ donation_amount: parseFloat(editAmount) })
                                    .eq('id', supporter.id)
                                  
                                  if (error) {
                                    setMessage({ type: 'error', text: `Viga uuendamisel: ${error.message}` })
                                  } else {
                                    setMessage({ type: 'success', text: 'Toetaja edukalt uuendatud!' })
                                    fetchData()
                                  }
                                } catch (error) {
                                  setMessage({ type: 'error', text: 'Uuendamine ebaõnnestus' })
                                }
                                setEditingSupporter(null)
                                setEditAmount('')
                              }}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingSupporter(null)
                                setEditAmount('')
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingSupporter(supporter.id)
                                setEditAmount(supporter.donation_amount.toString())
                              }}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors duration-200"
                            >
                              Muuda
                            </button>
                            <button
                              onClick={() => handleToggleActive(supporter.id, supporter.is_active, 'supporter')}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                supporter.is_active
                                  ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                  : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                              }`}
                            >
                              {supporter.is_active ? 'Aktiivne' : 'Mitteaktiivne'}
                            </button>
                            <button
                              onClick={() => handleDelete(supporter.id, 'supporter')}
                              className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors duration-200"
                            >
                              Kustuta
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}