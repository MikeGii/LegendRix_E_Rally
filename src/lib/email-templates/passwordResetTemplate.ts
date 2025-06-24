// src/lib/email-templates/passwordResetTemplate.ts
export const generatePasswordResetEmail = (resetLink: string, userEmail: string) => {
  return `
<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc;">
  
  <!-- Logo Header -->
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="background-color: #3b82f6; border-radius: 10px; padding: 20px;">
      <img src="https://legendrix-e-rally.vercel.app/image/rally-cover.png" 
           alt="LegendRix E-Rally Logo" 
           style="max-width: 200px; height: auto; border-radius: 8px;">
    </div>
  </div>

  <!-- Main Card -->
  <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #3b82f6; padding: 30px; text-align: center; color: white;">
      <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
        Parooli lähtestamine
      </h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
        LegendRix E-Rally
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      
      <!-- Greeting -->
      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">
        Tere, ${userEmail}!
      </h3>

      <!-- Main Message -->
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #bfdbfe;">
        <p style="color: #1f2937; margin: 0 0 15px 0; font-size: 15px; line-height: 1.5;">
          Saime taotluse parooli lähtestamiseks sinu kontole. Klõpsa alloleval nupul, et luua uus parool ja pääseda tagasi oma kontole.
        </p>
        
        <!-- Reset Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🔑 Lähtesta Parool
          </a>
        </div>
      </div>

      <!-- Process Steps -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">
          📋 Kuidas edasi:
        </h4>
        <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          <div style="margin-bottom: 8px;">
            <strong>1.</strong> Kliki nupule "Lähtesta Parool"
          </div>
          <div style="margin-bottom: 8px;">
            <strong>2.</strong> Sind suunatakse turvalisse parooli muutmise lehele
          </div>
          <div style="margin-bottom: 8px;">
            <strong>3.</strong> Sisesta ja kinnita oma uus parool
          </div>
          <div>
            <strong>4.</strong> Logi sisse oma uue parooliga!
          </div>
        </div>
      </div>

      <!-- Alternative Link -->
      <div style="background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; font-weight: bold;">
          Kui nupp ei tööta, kopeeri ja kleebi see link oma brauserisse:
        </p>
        <p style="color: #4b5563; margin: 0; font-size: 11px; word-break: break-all; background-color: #ffffff; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db;">
          ${resetLink}
        </p>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0; border: 1px solid #fbbf24;">
        <div style="display: flex; align-items: flex-start;">
          <span style="color: #d97706; font-size: 16px; margin-right: 8px;">🔒</span>
          <div>
            <h5 style="color: #92400e; margin: 0 0 5px 0; font-size: 13px; font-weight: bold;">
              Turvalisuse märkus
            </h5>
            <p style="color: #451a03; margin: 0; font-size: 12px;">
              See link kehtib ainult 24 tundi ja on ühekordselt kasutatav. Kui sa seda parooli lähtestamist ei tellinud, võid selle turvaliselt ignoreerida.
            </p>
          </div>
        </div>
      </div>

      <!-- Important Notice -->
      <div style="background-color: #fee2e2; border-radius: 6px; padding: 15px; margin: 20px 0; border: 1px solid #fecaca;">
        <div style="display: flex; align-items: flex-start;">
          <span style="color: #dc2626; font-size: 16px; margin-right: 8px;">⚠️</span>
          <div>
            <h5 style="color: #991b1b; margin: 0 0 5px 0; font-size: 13px; font-weight: bold;">
              Tähtis
            </h5>
            <p style="color: #7f1d1d; margin: 0; font-size: 12px;">
              Pärast uue parooli seadistamist logitakse sind automaatselt kõikidest seadmetest välja turvalisuse tagamiseks.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; margin: 0; font-size: 13px;">
          Kui sul on küsimusi, võta meiega ühendust!
        </p>
        <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 11px;">
          LegendRix E-Spordikeskus • Professionaalne e-spordi platvorm
        </p>
      </div>

    </div>
  </div>

</div>
  `.trim()
}

// Text version for email clients that don't support HTML
export const generatePasswordResetTextEmail = (resetLink: string, userEmail: string) => {
  return `
PAROOLI LÄHTESTAMINE - LegendRix E-Rally

Tere, ${userEmail}!

Saime taotluse parooli lähtestamiseks sinu kontole.

PAROOLI LÄHTESTAMISE LINK:
${resetLink}

KUIDAS EDASI:
1. Kliki ülal oleval lingil
2. Sind suunatakse turvalisse parooli muutmise lehele  
3. Sisesta ja kinnita oma uus parool
4. Logi sisse oma uue parooliga!

TÄHTIS TURVALISUSE MÄRKUS:
- See link kehtib ainult 24 tundi
- Link on ühekordselt kasutatav
- Kui sa seda taotlust ei esitanud, ignoreeri seda e-maili
- Pärast uue parooli seadistamist logitakse sind kõikidest seadmetest välja

Kui sul on küsimusi, võta meiega ühendust: ${process.env.EMAIL_USER || 'ewrc.admin@ideemoto.ee'}

--
LegendRix E-Rally
LegendRix E-Spordikeskus
https://legendrix-e-rally.vercel.app
  `.trim()
}