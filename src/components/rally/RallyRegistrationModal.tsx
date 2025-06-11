// src/components/rally/RallyRegistrationModal.tsx
'use client'

import { useState } from 'react'
import { TransformedRally, useRallyRegistration } from '@/hooks/useOptimizedRallies'

interface RallyRegistrationModalProps {
  rally: TransformedRally | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (rally: TransformedRally) => void
}

export function RallyRegistrationModal({ rally, isOpen, onClose, onSuccess }: RallyRegistrationModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [teamName, setTeamName] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [agreeToRules, setAgreeToRules] = useState<boolean>(false)
  
  const rallyRegistrationMutation = useRallyRegistration()

  if (!isOpen || !rally) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClass) {
      alert('Please select a class')
      return
    }

    if (!agreeToRules) {
      alert('Please agree to the rally rules and regulations')
      return
    }

    try {
      await rallyRegistrationMutation.mutateAsync({
        rallyId: rally.id,
        classId: selectedClass,
        teamName: teamName.trim() || undefined,
        notes: notes.trim() || undefined
      })
      
      // Reset form
      setSelectedClass('')
      setTeamName('')
      setNotes('')
      setAgreeToRules(false)
      
      // Call success callback
      if (onSuccess) {
        onSuccess(rally)
      }
      
      // Close modal
      onClose()
      
    } catch (error: any) {
      console.error('Registration failed:', error)
      alert(`Registration failed: ${error.message}`)
    }
  }

  const handleClose = () => {
    if (!rallyRegistrationMutation.isPending) {
      setSelectedClass('')
      setTeamName('')
      setNotes('')
      setAgreeToRules(false)
      onClose()
    }
  }

  const selectedClassDetails = rally.available_classes?.find(cls => cls.class_id === selectedClass)
  const entryFee = rally.entry_fee || 0
  const finalEntryFee = selectedClassDetails 
    ? entryFee * selectedClassDetails.entry_fee_modifier 
    : entryFee

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">🏁</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Rally Registration</h3>
              <p className="text-slate-400">{rally.name}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={rallyRegistrationMutation.isPending}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Rally Overview */}
          <div className="bg-slate-900/50 rounded-lg border border-slate-700/30 p-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Rally Details</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Competition Date:</span>
                <span className="text-white">
                  {new Date(rally.competition_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registration Deadline:</span>
                <span className="text-white">
                  {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Participants:</span>
                <span className="text-white">
                  {rally.registered_participants || 0} / {rally.max_participants || '∞'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Game:</span>
                <span className="text-white">{rally.game_name}</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Competition Class *
              </label>
              <div className="space-y-3">
                {rally.available_classes?.map((rallyClass) => (
                  <label 
                    key={rallyClass.class_id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedClass === rallyClass.class_id
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="class"
                      value={rallyClass.class_id}
                      checked={selectedClass === rallyClass.class_id}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{rallyClass.class_name}</p>
                        {rallyClass.max_participants && (
                          <p className="text-sm opacity-70">
                            Max participants: {rallyClass.max_participants}
                            {rallyClass.registered_count !== undefined && 
                              ` (${rallyClass.registered_count} registered)`
                            }
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {rallyClass.entry_fee_modifier !== 1 && (
                          <p className="text-sm">
                            {rallyClass.entry_fee_modifier > 1 ? '+' : ''}
                            {((rallyClass.entry_fee_modifier - 1) * 100).toFixed(0)}% fee
                          </p>
                        )}
                        {entryFee > 0 && (
                          <p className="font-medium">
                            €{(entryFee * rallyClass.entry_fee_modifier).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team Name (Optional)
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your team name"
                maxLength={50}
              />
              <p className="text-slate-500 text-xs mt-1">
                Optional: Enter a team name if you're competing as part of a team
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any additional information, special requests, or comments"
                maxLength={500}
              />
              <p className="text-slate-500 text-xs mt-1">
                Optional: Any additional information for the rally organizers
              </p>
            </div>

            {/* Rules Agreement */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/30 p-4">
              <h5 className="text-sm font-semibold text-white mb-3">Rally Rules & Regulations</h5>
              
              {rally.rules ? (
                <div className="max-h-32 overflow-y-auto mb-4 p-3 bg-slate-800/50 rounded text-sm text-slate-300 leading-relaxed">
                  {rally.rules}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-slate-800/50 rounded text-sm text-slate-300">
                  <p>Standard rally competition rules apply:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Drivers must compete fairly and follow all game rules</li>
                    <li>Any form of cheating or unsportsmanlike conduct will result in disqualification</li>
                    <li>Registration is binding - please only register if you can participate</li>
                    <li>Entry fees are non-refundable unless the rally is cancelled</li>
                  </ul>
                </div>
              )}
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToRules}
                  onChange={(e) => setAgreeToRules(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300 select-none">
                  I agree to the rally rules and regulations, and understand that registration is binding
                </span>
              </label>
            </div>

            {/* Entry Fee Summary */}
            {finalEntryFee > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 font-medium">Total Entry Fee</p>
                    {selectedClassDetails && selectedClassDetails.entry_fee_modifier !== 1 && (
                      <p className="text-blue-400 text-sm">
                        Base fee (€{entryFee}) × {selectedClassDetails.entry_fee_modifier} class modifier
                      </p>
                    )}
                  </div>
                  <p className="text-blue-200 font-bold text-lg">€{finalEntryFee.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={!selectedClass || !agreeToRules || rallyRegistrationMutation.isPending}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rallyRegistrationMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  `Complete Registration${finalEntryFee > 0 ? ` (€${finalEntryFee.toFixed(2)})` : ''}`
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={rallyRegistrationMutation.isPending}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}