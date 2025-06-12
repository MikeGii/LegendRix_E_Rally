import React, { useState, useEffect } from 'react'
import { useRallyAvailableClasses, useCreateRegistration } from '@/hooks/useRallyRegistrations'
import { useAuth } from '@/components/AuthProvider'

interface RegistrationFormWithClassesProps {
  rallyId: string
  rallyName: string
  onSuccess: () => void
  onCancel: () => void
}

export function RegistrationFormWithClasses({ 
  rallyId, 
  rallyName, 
  onSuccess, 
  onCancel 
}: RegistrationFormWithClassesProps) {
  const { user } = useAuth()
  const { data: availableClasses = [], isLoading: isLoadingClasses } = useRallyAvailableClasses(rallyId)
  const createRegistrationMutation = useCreateRegistration()

  const [formData, setFormData] = useState({
    class_id: '',
    car_number: '',
    team_name: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.class_id) {
      alert('Please select a class')
      return
    }

    try {
      await createRegistrationMutation.mutateAsync({
        rally_id: rallyId,
        class_id: formData.class_id,
        car_number: formData.car_number ? parseInt(formData.car_number) : undefined,
        team_name: formData.team_name || undefined,
        notes: formData.notes || undefined
      })
      
      onSuccess()
    } catch (error) {
      console.error('Registration failed:', error)
      alert('Registration failed. Please try again.')
    }
  }

  if (isLoadingClasses) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-400">Loading classes...</span>
        </div>
      </div>
    )
  }

  if (availableClasses.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-400">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Classes Available</h3>
          <p className="text-slate-400 mb-4">This rally has no available classes for registration.</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Register for Rally</h2>
        <p className="text-slate-400">
          Registering <span className="text-blue-400 font-medium">{user?.name}</span> for{' '}
          <span className="text-blue-400 font-medium">{rallyName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Class Selection */}
        <div>
          <label className="block text-lg font-semibold text-white mb-4">
            Select Competition Class *
          </label>
          <div className="grid gap-3">
            {availableClasses.map((cls: any) => (
              <label
                key={cls.id}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.class_id === cls.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="class_id"
                  value={cls.id}
                  checked={formData.class_id === cls.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_id: e.target.value }))}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 text-lg">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{cls.name}</h3>
                    {cls.description && (
                      <p className="text-sm text-slate-400 mt-1">{cls.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                      {cls.skill_level && <span>Level: {cls.skill_level}</span>}
                      {cls.max_participants && <span>Max: {cls.max_participants}</span>}
                      {cls.entry_fee && cls.entry_fee > 0 && <span>Fee: €{cls.entry_fee}</span>}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Car Number (Optional)
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={formData.car_number}
              onChange={(e) => setFormData(prev => ({ ...prev, car_number: e.target.value }))}
              placeholder="e.g. 42"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Team Name (Optional)
            </label>
            <input
              type="text"
              value={formData.team_name}
              onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
              placeholder="e.g. Speed Demons"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.class_id || createRegistrationMutation.isPending}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {createRegistrationMutation.isPending ? 'Registering...' : 'Register Now'}
          </button>
        </div>
      </form>
    </div>
  )
}