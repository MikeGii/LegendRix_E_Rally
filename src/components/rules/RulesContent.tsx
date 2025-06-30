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

      {/* Section 2: Üldised reeglid */}
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

      {/* Section 3: Tegevustes osavõtu reeglid */}
      <section>
        <h2 className="text-3xl font-black text-red-500 font-['Orbitron'] tracking-wider mb-8 uppercase">
          3. TEGEVUSTES OSAVÕTU REEGLID
        </h2>
        <div className="space-y-6 pl-4">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">3.1 Osalemise eeltingimused</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Iga kasutaja peab omama legaalsel viisil saadud/soetatud mängu, milles üritus läbi viiakse</li>
              <li>Iga kasutaja peab omama võimalust läbi Discord keskkonna liituda antud üritusel läbiviidava kõnesillaga</li>
              <li>Iga kasutaja peab olema veendunud, et tema poolt kasutatavad seadmed (arvuti, mikrofon ja teised lisaseadmed) on töökorras ja valmis kasutamiseks</li>
              <li>Teised üritusel osalevad isikud ei pea ootama, kui kellelgi tekivad ürituse vältel tehnilised probleemid</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">3.2 Registreerimise kord</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Üritusele tuleb registreerida läbi legendrix.ee keskkonna loodud registreerimisvormi</li>
              <li>Üritusele registreerimata kasutajakontosid üritusel ei arvestata ning vajadusel eemaldatakse ilma hoiatamata mängus olevast lobbyst</li>
              <li>Üritusele ei ole võimalik registreeruda kui registreerimiseks ettenähtud tähtaeg on möödunud</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">3.3 Osalejate piirangud ja teavitused</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Üritustel võib olla piiratud arv kohti</li>
              <li>Administraatoritel on õigus vajadusel tühistada registreeringuid kui pole kinni peetud kokkulepitud ürituse korraldusest (näiteks tasulised üritused või toetajatele mõeldud üritused)</li>
              <li>Uutest üritustest teavitatakse kasutajaid e-posti teel, et kõik mängijad saaksid õigeaegselt registreeruda</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">3.4 Registreerimisega nõustumine</h3>
            <p className="text-white mb-3 pl-6">Üritusele registreerides mängija kinnitab, et:</p>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Tema mängus osalemist võidakse otseülekandes avalikult kuvada <span className="font-bold text-red-400">LegendRix</span> kanalite jälgijatele ja pealtvaatajatele</li>
              <li>Tema mängus sooritatud tulemused võidakse avalikult legendrix.ee keskkonnas kuvada</li>
              <li>Tema käest võidakse <span className="font-bold text-red-400">LegendRix</span> otseülekandes avalikult üle kõnesilla küsida kommentaare ja tagasisidet mängus tehtud soorituste kohta</li>
              <li>Mõistab heatava põhimõtet ja kui on omale registreerinud koha üritusele, siis on ka nõutud osavõtt</li>
              <li>Registreeringu mitte tühistamise ja administraatorite mitte teavitamise korral (kui tühistamine pole võimalik) kui osavõtt pole võimalik, võib see tuua kaasa kasutajakonto kustutamise</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-400">3.5 Üritustel osavõtu kord</h3>
            <ul className="space-y-2 pl-6 list-disc text-white">
              <li>Mängija, kes osaleb tiitlivõistlustel (meistrivõistlused, karikavõistlused) määrab omale hooaja alguses esimese registreerimisega, millises võistlusklassis ta osaleb hooaja vältel</li>
              <li>Hooaja kestel ei ole lubatud võistlusklassi muuta - mängijale, kes muudab võistlusklassi hooaja vältel, tulemusi ei arvestata</li>
              <li>Mängijal on rangelt soovituslik sõita hooaja vältel ühe ja sama sõidukiga, kuid seda ei saa kohustada</li>
              <li>Mängija, kes kuulub tiimi, peab järgima tiimi poolt määratud korraldusi ja reegleid</li>
              <li>Kui mängija lahkub poole ürituse pealt ja ei põhjenda oma lahkumist administraatoritele, võib see kaasa tuua ajutise osaluskeelu või ka jäädava konto blokeerimise</li>
            </ul>
          </div>
        </div>
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