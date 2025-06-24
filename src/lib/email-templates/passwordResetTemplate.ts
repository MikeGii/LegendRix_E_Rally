// src/lib/email-templates/passwordResetTemplate.ts
interface PasswordResetEmailData {
  user: {
    name: string
    email: string
    player_name?: string
  }
  resetToken: string
  expiresAt: Date
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

export function generatePasswordResetEmail(data: PasswordResetEmailData): { subject: string; html: string } {
  const { user, resetToken, expiresAt } = data
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://legendrix-e-rally.vercel.app'}/reset-password?token=${resetToken}`
  
  const subject = `🔐 Parooli lähtestamine - LegendRix E-Rally`

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
          
          <!-- Header with Blue Gradient -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.05\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg></div>
            <div style="position: relative; z-index: 1;">
              <div style="font-size: 64px; margin-bottom: 15px;">🔐</div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: white; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); letter-spacing: -0.5px;">
                Parooli lähtestamine
              </h1>
              <p style="margin: 15px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                LegendRix E-Spordikeskus
              </p>
              <div style="width: 60px; height: 4px; background: rgba(255, 255, 255, 0.3); margin: 20px auto; border-radius: 2px;"></div>
            </div>
          </div>

          <!-- Content Section -->
          <div style="padding: 40px 30px;">
            
            <!-- Personal Greeting -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #e2e8f0; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                Tere, ${user.name}!
                ${user.player_name && user.player_name !== user.name ? ` (${user.player_name})` : ''}
              </h3>
            </div>

            <!-- Main Message -->
            <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%); border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid rgba(59, 130, 246, 0.2);">
              <p style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Saime taotluse parooli lähtestamiseks sinu kontole. Kui sa seda taotlust ei esitanud, võid selle e-maili turvaliselt ignoreerida.
              </p>
              
              <p style="color: #e2e8f0; margin: 0; font-size: 16px; line-height: 1.6;">
                Klõpsa alloleval nupul, et luua uus parool ja pääseda tagasi oma kontole.
              </p>
            </div>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 16px; font-weight: 700; display: inline-block; font-size: 18px; box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4); transition: all 0.3s ease; border: 1px solid rgba(59, 130, 246, 0.3); letter-spacing: 0.5px;">
                <span style="margin-right: 8px; font-size: 20px;">🔑</span>
                Lähtesta Parool
              </a>
            </div>

            <!-- Process Steps -->
            <div style="background: linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(100, 116, 139, 0.1) 100%); border-radius: 20px; padding: 30px; margin: 30px 0; border: 1px solid rgba(148, 163, 184, 0.2);">
              <h4 style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="margin-right: 10px; font-size: 24px;">📋</span>
                Kuidas edasi:
              </h4>
              <div style="color: #d1d5db; line-height: 1.7; font-size: 16px;">
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #3b82f6; font-weight: 700; margin-right: 12px; min-width: 24px;">1.</span>
                  <span>Kliki nupule "Lähtesta Parool"</span>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #3b82f6; font-weight: 700; margin-right: 12px; min-width: 24px;">2.</span>
                  <span>Sind suunatakse turvalisse parooli muutmise lehele</span>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #3b82f6; font-weight: 700; margin-right: 12px; min-width: 24px;">3.</span>
                  <span>Sisesta ja kinnita oma uus parool</span>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #3b82f6; font-weight: 700; margin-right: 12px; min-width: 24px;">4.</span>
                  <span>Logi sisse oma uue parooliga!</span>
                </div>
              </div>
            </div>

            <!-- Alternative Link Section -->
            <div style="background: rgba(71, 85, 105, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(71, 85, 105, 0.4);">
              <h5 style="color: #cbd5e1; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                Kui nupp ei tööta, kopeeri ja kleebi see link oma brauserisse:
              </h5>
              <div style="background: rgba(15, 23, 42, 0.6); border-radius: 8px; padding: 12px; border: 1px solid rgba(71, 85, 105, 0.5); word-break: break-all;">
                <code style="color: #94a3b8; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;">
                  ${resetLink}
                </code>
              </div>
            </div>

            <!-- Security Notices -->
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%); border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid rgba(245, 158, 11, 0.2);">
              <h4 style="color: #fbbf24; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                <span style="margin-right: 8px; font-size: 18px;">🔒</span>
                Turvalisuse märkus
              </h4>
              <ul style="color: #e5e7eb; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li style="margin-bottom: 8px;">See link kehtib ainult 24 tundi ja on ühekordselt kasutatav</li>
                <li style="margin-bottom: 8px;">Kui sa seda taotlust ei esitanud, võid selle turvaliselt ignoreerida</li>
                <li>Pärast uue parooli seadistamist logitakse sind automaatselt kõikidest seadmetest välja turvalisuse tagamiseks</li>
              </ul>
            </div>

            <!-- Expiry Notice -->
            <div style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%); border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid rgba(220, 38, 38, 0.2);">
              <h4 style="color: #fca5a5; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                <span style="margin-right: 8px; font-size: 18px;">⏰</span>
                Tähtis
              </h4>
              <p style="color: #e5e7eb; margin: 0; font-size: 14px; line-height: 1.5;">
                See link aegub: <strong style="color: #fca5a5;">${formatEstonianDate(expiresAt)}</strong>
              </p>
            </div>

            <!-- Contact Support -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #94a3b8; margin: 0 0 15px 0; font-size: 15px;">
                Kui sul on küsimusi või vajad abi:
              </p>
              <a href="mailto:${process.env.ADMIN_EMAIL || 'ewrc.admin@ideemoto.ee'}" 
                 style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 12px; 
                        font-weight: 600; 
                        font-size: 14px;
                        display: inline-block; 
                        box-shadow: 0 6px 20px rgba(100, 116, 139, 0.3);">
                📧 Võta Ühendust
              </a>
            </div>

            <!-- Footer Info -->
            <div style="border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 16px; margin: 0 0 12px 0; font-weight: 500;">
                Täname, et kasutad LegendRix E-Rally platvormi!
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 400;">
                ${formatEstonianDate(new Date())} • LegendRix E-Rally Championship • Powered by EWRC
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