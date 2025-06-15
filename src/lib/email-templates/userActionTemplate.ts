// src/lib/email-templates/userActionTemplate.ts
interface UserActionEmailData {
  user: {
    name: string
    email: string
    player_name?: string
  }
  action: 'approve' | 'reject'
  reason?: string
}

// Format dates for Estonian locale
const formatEstonianDate = (date: Date): string => {
  return date.toLocaleDateString('et-EE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function generateUserActionEmail(data: UserActionEmailData): { subject: string; html: string } {
  const { user, action, reason } = data
  const isApproved = action === 'approve'
  
  const subject = isApproved 
    ? `🎉 Konto kinnitatud - Tere tulemast LegendRix E-Spordikeskuse lehele!` 
    : `📋 Registreerumise uuendus - LegendRix`

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
          
          ${isApproved ? `
            <!-- Approval Header with Green Gradient -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 40px 30px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.05\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg></div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
                <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: white; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); letter-spacing: -0.5px;">
                  Tere tulemast!
                </h1>
                <p style="margin: 15px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                  Sinu konto on edukalt kinnitatud
                </p>
              </div>
            </div>
          ` : `
            <!-- Rejection Header with Red Gradient -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%); padding: 40px 30px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.05\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.3;"></div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 64px; margin-bottom: 15px;">📋</div>
                <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: white; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); letter-spacing: -0.5px;">
                  Registreerumise uuendus
                </h1>
                <p style="margin: 15px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                  Sinu registreerumise kohta
                </p>
              </div>
            </div>
          `}

          <!-- Content Section -->
          <div style="padding: 40px 30px;">
            
            <!-- Personal Greeting -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #e2e8f0; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                Tere, ${user.name}!
                ${user.player_name && user.player_name !== user.name ? ` (${user.player_name})` : ''}
              </h3>
            </div>

            ${isApproved ? `
              <!-- Approval Message -->
              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid rgba(16, 185, 129, 0.2);">
                <p style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                  Suurepärased uudised! Sinu konto on meie administraatorite poolt kinnitatud. 
                  Nüüd saad ligipääsu kõikidele ralli funktsioonidele ja võid alustada võistlemist!
                </p>
                
                <!-- Action Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://legendrix-e-rally.vercel.app" 
                     style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            color: white; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 12px; 
                            font-weight: 700; 
                            font-size: 16px;
                            display: inline-block; 
                            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); 
                            transition: all 0.3s ease;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;">
                    🏁 Alusta Sõitmist!
                  </a>
                </div>
              </div>

              <!-- Features Section -->
              <div style="background: rgba(51, 65, 85, 0.4); border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid rgba(71, 85, 105, 0.3);">
                <h4 style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                  <span style="margin-right: 10px; font-size: 20px;">🚀</span>
                  Mida saad nüüd teha:
                </h4>
                <div style="display: grid; gap: 12px;">
                  <div style="color: #cbd5e1; font-size: 15px; display: flex; align-items: center; padding: 8px 0;">
                    <span style="color: #10b981; margin-right: 12px; font-size: 18px;">🏆</span>
                    Sirvi ja registreeru tulevastele rallidele
                  </div>
                  <div style="color: #cbd5e1; font-size: 15px; display: flex; align-items: center; padding: 8px 0;">
                    <span style="color: #10b981; margin-right: 12px; font-size: 18px;">📊</span>
                    Jälgi oma tulemusi ja statistikat
                  </div>
                  <div style="color: #cbd5e1; font-size: 15px; display: flex; align-items: center; padding: 8px 0;">
                    <span style="color: #10b981; margin-right: 12px; font-size: 18px;">🌍</span>
                    Võistle sõitjatega üle kogu maailma
                  </div>
                  <div style="color: #cbd5e1; font-size: 15px; display: flex; align-items: center; padding: 8px 0;">
                    <span style="color: #10b981; margin-right: 12px; font-size: 18px;">⭐</span>
                    Pääse ligi eksklusiivsetele meistrivõistluste sündmustele
                  </div>
                </div>
              </div>

              <!-- Welcome Message -->
              <div style="text-align: center; margin: 30px 0 20px 0;">
                <p style="color: #10b981; font-size: 18px; font-weight: 600; margin: 0;">
                  Tere tulemast LegendRix E-Spordikeskusesse! 🏁
                </p>
              </div>
            ` : `
              <!-- Rejection Message -->
              <div style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%); border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid rgba(220, 38, 38, 0.2);">
                <p style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                  Kahjuks peame teavitama, et sinu registreerumine LegendRix E-Rally lehele ei saanud praegu kinnitatud.
                </p>
                
                ${reason ? `
                  <div style="background: rgba(220, 38, 38, 0.15); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(220, 38, 38, 0.3);">
                    <h4 style="color: #fca5a5; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                      <span style="margin-right: 8px;">💬</span>Põhjus:
                    </h4>
                    <p style="color: #e2e8f0; margin: 0; font-size: 15px; line-height: 1.5;">
                      ${reason}
                    </p>
                  </div>
                ` : ''}

                <p style="color: #e2e8f0; margin: 20px 0 0 0; font-size: 16px; line-height: 1.6;">
                  Kui arvad, et see on viga või soovid oma avaldust arutada, võta palun ühendust meie tugimeeskonnaga.
                </p>

                <!-- Contact Button -->
                <div style="text-align: center; margin: 25px 0;">
                  <a href="mailto:${process.env.ADMIN_EMAIL || 'ewrc.admin@ideemoto.ee'}" 
                     style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); 
                            color: white; 
                            padding: 14px 28px; 
                            text-decoration: none; 
                            border-radius: 10px; 
                            font-weight: 600; 
                            font-size: 15px;
                            display: inline-block; 
                            box-shadow: 0 6px 20px rgba(100, 116, 139, 0.3);">
                    📧 Võta Ühendust
                  </a>
                </div>
              </div>
            `}

            <!-- Footer Info -->
            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid rgba(71, 85, 105, 0.3); text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px; line-height: 1.5;">
                ${isApproved ? 
                  `Täname, et liitusid LegendRix E-Rally kogukonnaga!` : 
                  `Täname huvi LegendRix E-Rally vastu.`
                }
              </p>
              <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">
                ${formatEstonianDate(new Date())} • LegendRix E-Spordikeskus
              </p>
            </div>

          </div>
        </div>

        <!-- Bottom Logo -->
        <div style="text-align: center; margin-top: 30px; opacity: 0.7;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            LegendRix E-Rally • Professionaalne e-spordi platvorm
          </p>
        </div>

      </div>
    </div>
  `

  return { subject, html }
}