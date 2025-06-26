// src/hooks/useRallyNotification.ts
import { useMutation } from '@tanstack/react-query'

interface RallyNotificationParams {
  rallyId: string
  testEmail?: string // For testing purposes
  isReminder?: boolean // For reminder notifications
}

interface RallyNotificationResponse {
  message: string
  rallyId: string
  rallyName: string
  emailsSent: number
  emailsFailed: number
  totalEmails: number
}

export function useRallyNotification() {
  return useMutation({
    mutationFn: async (params: RallyNotificationParams): Promise<RallyNotificationResponse> => {
      console.log('🔄 Sending rally notification:', params.rallyId)
      
      const response = await fetch('/api/admin/rally-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send rally notification')
      }

      const result = await response.json()
      console.log('✅ Rally notification sent successfully:', result)
      return result
    },
    onSuccess: (data) => {
      console.log(`📧 Rally notification completed:`, {
        rally: data.rallyName,
        sent: data.emailsSent,
        failed: data.emailsFailed
      })
    },
    onError: (error) => {
      console.error('❌ Rally notification error:', error)
    }
  })
}