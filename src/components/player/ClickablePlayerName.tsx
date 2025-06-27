// src/components/player/ClickablePlayerName.tsx
'use client'

import { useState, useRef } from 'react'
import { PublicPlayerProfileModal } from './PublicPlayerProfileModal'

interface ClickablePlayerNameProps {
  // For registered users - use userId for security
  userId?: string
  // For manual participants - just display name, no profile
  playerName: string
  className?: string
  children?: React.ReactNode
  onModalOpen?: () => void
  onModalClose?: () => void
  // New prop to indicate participant type
  participantType?: 'registered' | 'manual'
}

export function ClickablePlayerName({ 
  userId,
  playerName, 
  className = '', 
  children,
  onModalOpen,
  onModalClose,
  participantType = 'registered' // Default to registered for backward compatibility
}: ClickablePlayerNameProps) {
  const [showProfile, setShowProfile] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only open profile for registered users with userId
    if (participantType === 'registered' && userId) {
      setShowProfile(true)
      onModalOpen?.()
    }
    // For manual participants, do nothing (no clickable action)
  }

  const handleClose = () => {
    setShowProfile(false)
    onModalClose?.()
  }

  // Render based on participant type
  if (participantType === 'manual' || !userId) {
    // Manual participant - just display name, not clickable
    return (
      <span className={`text-gray-400 ${className}`} title="Manuaalselt lisatud osaleja">
        {children || playerName}
      </span>
    )
  }

  // Registered user - clickable with profile
  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`hover:text-blue-400 hover:underline transition-colors cursor-pointer ${className}`}
        title={`Vaata ${playerName} profiili`}
      >
        {children || playerName}
      </button>

      <PublicPlayerProfileModal
        userId={userId}
        isOpen={showProfile}
        onClose={handleClose}
        anchorElement={buttonRef.current}
      />
    </>
  )
}