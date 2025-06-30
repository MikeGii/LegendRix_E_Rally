// src/components/rules/RulesContent.tsx
'use client'

export function RulesContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Privacy Policy Section */}
{/* Privacy Policy Section */}
      <section>
        <h2 className="text-3xl font-black text-red-500 font-['Orbitron'] tracking-wider mb-8 uppercase">
          1. PRIVAATSUSPOLIITIKA
        </h2>
        <div className="space-y-6 pl-4">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">1.1 Üldpõhimõtted</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Käesolev privaatsuspoliitika reguleerib isikuandmete kogumist, töötlemist ja säilitamist käsitlevaid põhimõtteid</li>
              <li>Isikuandmeid kogub töötleb ja säilitab isikuandmete vastutav töötleja <span className="font-bold text-red-400">LegendRix</span> kaubamärki esindav füüsiline isik Risto Oeselg (edaspidi andmetöötleja)</li>
              <li>Andmesubjekt privaatsuspoliitika tähenduses on veebilehe kasutaja, kes on registreerinud kasutajakonto legendrix.ee veebisaidil</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">1.2 Kogutavad andmed</h3>
            <p className="text-white mb-3 pl-6">Registreerimisel kogume järgmisi isikuandmeid:</p>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li><span className="font-bold">Nimi</span> - Võitjate auhindade (karikad, medalid) korrektse graveerimise tagamiseks</li>
              <li><span className="font-bold">Mängijanimi (player_name)</span> - Edetabelites kuvamiseks ja sidumiseks mänguplatvormide kasutajanimedega (Steam, Epic Games, PlayStation jne)</li>
              <li><span className="font-bold">E-posti aadress</span> - Teavituste ja meeldetuletuste saatmiseks ning parooli taastamise võimaldamiseks</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">1.3 Andmete kasutamine</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Võistluste korraldamiseks ja tulemuste haldamiseks</li>
              <li>Kasutajate tuvastamiseks erinevatel mänguplatvormidel</li>
              <li>Olulise informatsiooni edastamiseks (võistluste algusajad, registreerimistähtajad)</li>
              <li>Statistika koostamiseks ja edetabelite kuvamiseks</li>
              <li>Kasutajakonto turvalisuse tagamiseks</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">1.4 Andmete säilitamine</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Isikuandmeid säilitatakse niikaua, kuni kasutajal on aktiivne konto</li>
              <li>Võistluste tulemusi ja statistikat säilitatakse ajaloolise arhiivi eesmärgil</li>
              <li>Isikuandmeid talletatakse turvaliselt Supabase keskkonnas nende poolt määratud serverites</li>
              <li>LegendRix ei vastuta isikuandmete lekke ega mistahes muul pahatahtlikul viisil andmete kasutamise eest kui see on põhjustatud Supabase keskkonna haldurite poolt põhjustatud turvariskide ilmnemisel</li>
              <li>Kasutajal on õigus taotleda oma konto ja isikuandmete kustutamist</li>
              <li>Andmeid hoitakse turvaliselt ja neid ei edastata kolmandatele osapooltele</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">1.5 Kasutaja õigused</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Õigus tutvuda oma isikuandmetega</li>
              <li>Õigus andmete parandamisele</li>
              <li>Õigus andmete kustutamisele (v.a avalikud võistlustulemused)</li>
              <li>Õigus piirata andmete töötlemist</li>
              <li>Õigus esitada kaebus Andmekaitse Inspektsioonile</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">1.6 Kontakt</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Küsimuste korral privaatsuspoliitika kohta võtke ühendust: <a href="mailto:info@legendrix.ee" className="text-red-400 hover:text-red-300">info@legendrix.ee</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 1: Üldised reeglid */}
      <section>
        <h2 className="text-3xl font-black text-red-500 font-['Orbitron'] tracking-wider mb-8 uppercase">
          2. ÜLDISED REEGLID
        </h2>
        <div className="space-y-6 pl-4">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">2.1 Kasutajakonto ja vanusepiirangud</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>LegendRix veebisaidi kasutajatele ei ole määratud vanusepiirangut, kuid kõik mängijad peavad kinni pidama vastava mängu tootja reeglistest, kus on sätestatud vanusepiirangud selle mängimiseks</li>
              <li>Iga isik võib omada ainult ühte kasutajakontot</li>
              <li>Kasutajanimi peab olema sobilik ja mitte sisaldama vulgaarseid väljendeid ega teiste isikute suhtes solvavat sisu</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">2.2 Käitumine ja ausus</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Kõik isikud, kes omavad legendrix.ee lehel oma kasutajakontot on kohustatud käituma austavalt ja heatahtlikult teiste kasutaja omanike suhtes mängu platvormi kasutamise vältel</li>
              <li>Keelatud on mistahes viisil mängureeglitest kõrvale kaldumine ja ebaaus mänguviis</li>
              <li>Reeglite rikkumine võib kaasa tuua konto sulgemise</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Registreerimise reeglid */}
      <section>
        <h2 className="text-3xl font-black text-red-500 font-['Orbitron'] tracking-wider mb-8 uppercase">
          3. REGISTREERIMISE REEGLID
        </h2>

      </section>

      {/* Section 3: Võistkondade reeglid */}
      <section>
        <h2 className="text-3xl font-black text-red-500 font-['Orbitron'] tracking-wider mb-8 uppercase">
          4. VÕISTKONDADE REEGLID
        </h2>

      </section>

    </div>
  )
}