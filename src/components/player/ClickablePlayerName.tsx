// src/components/player/ClickablePlayerName.tsx - Updated with modal state tracking
'use client'

import { useState } from 'react'
import { PublicPlayerProfileModal } from './PublicPlayerProfileModal'

interface ClickablePlayerNameProps {
  playerName: string
  className?: string
  children?: React.ReactNode
  onModalOpen?: () => void
  onModalClose?: () => void
}

export function ClickablePlayerName({ 
  playerName, 
  className = '', 
  children,
  onModalOpen,
  onModalClose 
}: ClickablePlayerNameProps) {
  const [showProfile, setShowProfile] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowProfile(true)
    onModalOpen?.() // Notify parent that modal is opening
  }

  const handleClose = () => {
    setShowProfile(false)
    onModalClose?.() // Notify parent that modal is closing
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`hover:text-blue-400 hover:underline transition-colors cursor-pointer ${className}`}
        title={`Vaata ${playerName} profiili`}
      >
        {children || playerName}
      </button>

      <PublicPlayerProfileModal
        playerName={playerName}
        isOpen={showProfile}
        onClose={handleClose}
      />
    </>
  )
}