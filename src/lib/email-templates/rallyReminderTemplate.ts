// src/lib/email-templates/rallyReminderTemplate.ts
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

// Format dates for Estonian locale and timezone
const formatEstonianDate = (dateString: string): string => {
  const date = new Date(dateString)
  
  // Convert to Estonian timezone (UTC+2 or UTC+3 depending on DST)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Tallinn', // Estonian timezone
    hour12: false // Use 24-hour format
  }
  
  return date.toLocaleString('et-EE', options)
}

export function generateRallyReminderEmail(data: RallyEmailData): { subject: string; html: string } {
  const { rally, events } = data

  const subject = `Viimane võimalus: ${rally.name} - LegendRix E-Spordikeskus`

  const html = `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); min-height: 100vh; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 650px; margin: 0 auto;">
        
        <!-- Logo Header with Glow Effect -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: rgba(59, 130, 246, 0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);">
            <img src="https://legendrix-e-rally.vercel.app/image/rally-cover.png" 
                 alt="LegendRix E-Rally Logo" 
                 style="max-width: 220px; height: auto; border-radius: 15px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          </div>
        </div>

        <!-- Main Card with Glass Effect -->
        <div style="background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(148, 163, 184, 0.2); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4); overflow: hidden;">
          
          <!-- Header with Gradient -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.05\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg></div>
            <div style="position: relative; z-index: 1;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: white; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); letter-spacing: -0.5px;">
                Viimane võimalus registreeruda!
              </h1>
              <p style="margin: 15px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                LegendRix E-Spordikeskus
              </p>
              <div style="width: 60px; height: 4px; background: rgba(255, 255, 255, 0.3); margin: 20px auto; border-radius: 2px;"></div>
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <!-- Rally Title Section -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #f1f5f9; font-size: 28px; margin: 0 0 15px 0; font-weight: 700; letter-spacing: -0.5px;">
                ${rally.name}
              </h2>
              ${rally.description ? `
                <p style="color: #94a3b8; font-size: 18px; margin: 0; line-height: 1.6; font-weight: 400;">
                  ${rally.description}
                </p>
              ` : ''}
            </div>

            <!-- Rally Details Card -->
            <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%); border-radius: 20px; padding: 30px; margin: 30px 0; border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);">
              <h3 style="color: #e2e8f0; margin: 0 0 25px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="margin-right: 10px; font-size: 24px;">📅</span>
                Ralli üksikasjad
              </h3>
              
              <div style="display: grid; gap: 20px;">
                <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                  <span style="color: #94a3b8; font-weight: 600; width: 160px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🎮</span>Mäng:
                  </span>
                  <span style="color: #f1f5f9; font-weight: 500; font-size: 16px;">
                    ${rally.games?.name || 'Määramata'}
                  </span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                  <span style="color: #94a3b8; font-weight: 600; width: 160px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🏆</span>Tüüp:
                  </span>
                  <span style="color: #f1f5f9; font-weight: 500; font-size: 16px;">
                    ${rally.game_types?.name || 'Määramata'}
                  </span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                  <span style="color: #94a3b8; font-weight: 600; width: 160px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🏁</span>Võistluse kuupäev:
                  </span>
                  <span style="color: #ef4444; font-weight: 700; font-size: 16px; text-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">
                    ${formatEstonianDate(rally.competition_date)}
                  </span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 15px 0; ${rally.max_participants ? 'border-bottom: 1px solid rgba(148, 163, 184, 0.1);' : ''}">
                  <span style="color: #94a3b8; font-weight: 600; width: 160px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📝</span>Registreerimine kuni:
                  </span>
                  <span style="color: #f59e0b; font-weight: 700; font-size: 16px; text-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    ${formatEstonianDate(rally.registration_deadline)}
                  </span>
                </div>
                
                ${rally.max_participants ? `
                  <div style="display: flex; align-items: center; padding: 15px 0;">
                    <span style="color: #94a3b8; font-weight: 600; width: 160px; display: flex; align-items: center;">
                      <span style="margin-right: 8px;">👥</span>Max osalejaid:
                    </span>
                    <span style="color: #f1f5f9; font-weight: 500; font-size: 16px;">
                      ${rally.max_participants}
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>

            ${events.length > 0 ? `
              <!-- Rally Events (Riigid) Section -->
              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); border-radius: 20px; padding: 30px; margin: 30px 0; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);">
                <h4 style="color: #e2e8f0; margin: 0 0 25px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                  <span style="margin-right: 10px; font-size: 24px;">🌍</span>
                  Riigid
                </h4>
                <div style="display: grid; gap: 12px;">
                  ${events.map((event) => `
                    <div style="background: rgba(30, 41, 59, 0.6); border-radius: 12px; padding: 18px 20px; border: 1px solid rgba(16, 185, 129, 0.2); backdrop-filter: blur(10px); transition: all 0.3s ease;">
                      <div style="font-weight: 600; color: #10b981; font-size: 16px; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 24px; height: 24px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; font-weight: 700; margin-right: 12px;">
                          ${event.order}
                        </span>
                        ${event.name}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${rally.rules ? `
              <!-- Rules Section -->
              <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%); border-radius: 20px; padding: 30px; margin: 30px 0; border: 1px solid rgba(245, 158, 11, 0.2); box-shadow: 0 8px 32px rgba(245, 158, 11, 0.1);">
                <h4 style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                  <span style="margin-right: 10px; font-size: 24px;">📋</span>
                  Reeglid
                </h4>
                <p style="color: #d1d5db; margin: 0; line-height: 1.7; font-size: 16px; font-weight: 400;">
                  ${rally.rules}
                </p>
              </div>
            ` : ''}

            <!-- Call to Action Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://legendrix-e-rally.vercel.app/registration?rally=${rally.id}" 
                 style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 16px; font-weight: 700; display: inline-block; font-size: 18px; box-shadow: 0 12px 40px rgba(34, 197, 94, 0.4); transition: all 0.3s ease; border: 1px solid rgba(34, 197, 94, 0.3); letter-spacing: 0.5px;">
                <span style="margin-right: 8px; font-size: 20px;">🚀</span>
                Registreeru kohe!
              </a>
            </div>

            <!-- Competition Status -->
            ${rally.is_featured ? `
              <div style="text-align: center; margin: 30px 0;">
                <span style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); color: #451a03; padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3); border: 1px solid rgba(251, 191, 36, 0.3);">
                  <span style="margin-right: 6px;">⭐</span>
                  Esile tõstetud ralli
                </span>
              </div>
            ` : ''}

            <!-- Footer Info -->
            <div style="border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 16px; margin: 0 0 12px 0; font-weight: 500;">
                Küsimused? Võta meiega ühendust meie Discord serveris või e-posti teel.
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 400;">
                LegendRix E-Rally Championship • Powered by LegendRix
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Spacing -->
        <div style="height: 40px;"></div>
      </div>
    </div>
  `

  return { subject, html }
}