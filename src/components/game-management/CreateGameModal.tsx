// src/components/game-management/CreateGameModal.tsx - Optimized with form validation
import { useState, useEffect } from 'react'
import { FormModal } from '@/components/shared/Modal'
import { Input, Textarea, Select, FormGrid, FormSection, FormActions, Button } from '@/components/shared/FormComponents'
import type { Game } from '@/types'

interface CreateGameModalProps {
  game?: Game | null
  onClose: () => void
  onSubmit: (gameData: Partial<Game>) => void  // Change to match what GamesTab expects
  isLoading: boolean
}

interface GameFormData {
  name: string
  description: string
  developer: string
  platform: string
  release_year: number | string
}

interface FormErrors {
  name?: string
  developer?: string
  platform?: string
  release_year?: string
  description?: string
}

const PLATFORM_OPTIONS = [
  { value: '', label: 'Select Platform' },
  { value: 'PC', label: 'PC' },
  { value: 'PS5', label: 'PlayStation 5' },
  { value: 'PS4', label: 'PlayStation 4' },
  { value: 'Xbox Series X/S', label: 'Xbox Series X/S' },
  { value: 'Xbox One', label: 'Xbox One' },
  { value: 'Nintendo Switch', label: 'Nintendo Switch' },
  { value: 'Multi-Platform', label: 'Multi-Platform' },
]

const currentYear = new Date().getFullYear()

export function CreateGameModal({ game, onClose, onSubmit, isLoading }: CreateGameModalProps) {
  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    description: '',
    developer: '',
    platform: '',
    release_year: currentYear,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const isEditing = !!game

  // Pre-fill form when editing
  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        description: game.description || '',
        developer: game.developer || '',
        platform: game.platform || '',
        release_year: game.release_year || currentYear,
      })
    }
  }, [game])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Game name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Game name must be at least 2 characters'
    }

    if (!formData.platform) {
      newErrors.platform = 'Platform is required'
    }

    // Year validation
    const year = Number(formData.release_year)
    if (formData.release_year && (isNaN(year) || year < 1970 || year > currentYear + 5)) {
      newErrors.release_year = `Year must be between 1970 and ${currentYear + 5}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof GameFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {  // Type assertion fix
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof GameFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      name: true,
      developer: true,
      platform: true,
      release_year: true
    })

    if (!validateForm()) {
      return
    }

    const submitData: Partial<Game> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      developer: formData.developer.trim() || undefined,
      platform: formData.platform || undefined,
      release_year: formData.release_year ? Number(formData.release_year) : undefined,
    }

    onSubmit(submitData)  // This now matches the expected Partial<Game> type
  }

  const hasErrors = Object.keys(errors).length > 0
  const isFormValid = formData.name.trim() && formData.platform && !hasErrors

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <span>🎮</span>
          <span>{isEditing ? 'Edit Game' : 'Create New Game'}</span>
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Instructions */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-300 text-sm">
            <strong>{isEditing ? 'Update' : 'Create'}:</strong> {isEditing ? 'Modify' : 'Add'} the game information below. 
            This game will be available for creating rally types, events, and classes.
          </p>
        </div>

        <FormSection 
          title="Game Information"
          description="Basic details about the rally game"
        >
          <FormGrid columns={2}>
            <Input
              label="Game Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={touched.name ? errors.name : undefined}
              placeholder="e.g., EA Sports WRC"
              required
              icon="🎮"
            />
            
            <Select
              label="Platform"
              value={formData.platform}
              onChange={(e) => handleInputChange('platform', e.target.value)}
              error={touched.platform ? errors.platform : undefined}
              options={PLATFORM_OPTIONS}
              required
            />
          </FormGrid>

          <FormGrid columns={2}>
            <Input
              label="Developer"
              value={formData.developer}
              onChange={(e) => handleInputChange('developer', e.target.value)}
              onBlur={() => handleBlur('developer')}
              error={touched.developer ? errors.developer : undefined}
              placeholder="e.g., Codemasters"
              icon="🏢"
            />
            
            <Input
              label="Release Year"
              type="number"
              value={formData.release_year}
              onChange={(e) => handleInputChange('release_year', e.target.value)}
              onBlur={() => handleBlur('release_year')}
              error={touched.release_year ? errors.release_year : undefined}
              min={1970}
              max={currentYear + 5}
              placeholder={currentYear.toString()}
              icon="📅"
            />
          </FormGrid>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of the game (optional)"
            rows={3}
            hint="Optional: Describe the game's features or rally focus"
          />
        </FormSection>

        {/* Form Actions */}
        <FormActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="success"
            loading={isLoading}
            disabled={!isFormValid}
            icon={isEditing ? '💾' : '➕'}
          >
            {isEditing ? 'Update Game' : 'Create Game'}
          </Button>
        </FormActions>

        {/* Form Status */}
        {hasErrors && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-sm">
              ⚠️ Please fix the errors above before submitting
            </p>
          </div>
        )}
      </form>
    </FormModal>
  )
}