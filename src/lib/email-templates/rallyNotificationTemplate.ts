// src/lib/email-templates/rallyNotificationTemplate.ts
interface RallyEvent {
  name: string
  order: number
}

interface RallyEmailData {
  rally: {
    id: string
    name: string
    description?: string
    competition_date: string
    registration_deadline: string
    max_participants?: number
    rules?: string
    is_featured: boolean
    games?: { name: string }
    game_types?: { name: string }
  }
  events: RallyEvent[]
}

// Format dates for Estonian locale
const formatEstonianDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('et-EE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function generateRallyNotificationEmail(data: RallyEmailData): { subject: string; html: string } {
  const { rally, events } = data

  const subject = `🏁 Uus ralli: ${rally.name} - LegendRix E-Spordikeskus`

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <!-- Logo Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://legendrix-e-rally.vercel.app/image/rally-cover.png" 
             alt="LegendRix E-Rally Logo" 
             style="max-width: 200px; height: auto; border-radius: 10px;">
      </div>

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 15px 15px 0 0; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🏁 Uus ralli avaldatud!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">LegendRix E-Spordikeskus</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Rally Title -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 10px 0;">${rally.name}</h2>
          ${rally.description ? `<p style="color: #64748b; font-size: 16px; margin: 0;">${rally.description}</p>` : ''}
        </div>

        <!-- Rally Details Card -->
        <div style="background: #f1f5f9; border-radius: 10px; padding: 25px; margin: 25px 0;">
          <h3 style="color: #334155; margin: 0 0 20px 0; font-size: 18px;">📅 Ralli üksikasjad</h3>
          
          <div style="display: grid; gap: 15px;">
            <div style="display: flex; align-items: center;">
              <span style="color: #64748b; font-weight: 500; width: 140px;">🎮 Mäng:</span>
              <span style="color: #1e293b;">${rally.games?.name || 'Määramata'}</span>
            </div>
            
            <div style="display: flex; align-items: center;">
              <span style="color: #64748b; font-weight: 500; width: 140px;">🏆 Tüüp:</span>
              <span style="color: #1e293b;">${rally.game_types?.name || 'Määramata'}</span>
            </div>
            
            <div style="display: flex; align-items: center;">
              <span style="color: #64748b; font-weight: 500; width: 140px;">🏁 Võistluse kuupäev:</span>
              <span style="color: #dc2626; font-weight: 600;">${formatEstonianDate(rally.competition_date)}</span>
            </div>
            
            <div style="display: flex; align-items: center;">
              <span style="color: #64748b; font-weight: 500; width: 140px;">📝 Registreerimine kuni:</span>
              <span style="color: #ea580c; font-weight: 600;">${formatEstonianDate(rally.registration_deadline)}</span>
            </div>
            
            ${rally.max_participants ? `
              <div style="display: flex; align-items: center;">
                <span style="color: #64748b; font-weight: 500; width: 140px;">👥 Max osalejaid:</span>
                <span style="color: #1e293b;">${rally.max_participants}</span>
              </div>
            ` : ''}
          </div>
        </div>

        ${events.length > 0 ? `
          <!-- Rally Events (Riigid) Section -->
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">🌍 Riigid</h4>
            <div style="display: grid; gap: 8px;">
              ${events.map((event) => `
                <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e0e7ff;">
                  <div style="font-weight: 600; color: #1e40af;">
                    ${event.order}. ${event.name}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${rally.rules ? `
          <!-- Rules Section -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 Reeglid</h4>
            <p style="color: #78350f; margin: 0; line-height: 1.6;">${rally.rules}</p>
          </div>
        ` : ''}

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://legendrix-e-rally.vercel.app/registration?rally=${rally.id}" 
             style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);">
            🚀 Registreeru kohe!
          </a>
        </div>

        <!-- Competition Status -->
        ${rally.is_featured ? `
          <div style="text-align: center; margin: 20px 0;">
            <span style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
              ⭐ Esile tõstetud ralli
            </span>
          </div>
        ` : ''}

        <!-- Footer Info -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
            Küsimused? Võta meiega ühendust meie Discord serveris või e-posti teel.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            LegendRix E-Rally Championship • Powered by EWRC
          </p>
        </div>
      </div>
    </div>
  `

  return { subject, html }
}