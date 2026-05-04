const LAST_UPDATED = '1 gennaio 2026';

export default function Privacy() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-bark-900 text-cream-50 pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Documento legale</p>
          <h1 className="font-serif text-5xl mb-2">Privacy Policy</h1>
          <p className="text-cream-400 font-sans text-sm">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-custom">
        <div className="space-y-10 font-sans text-bark-600 leading-relaxed">

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">1. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento dei dati personali è <strong className="text-bark-800">Debalage S.r.l.</strong>,
              con sede legale in Via della Moda 12, 20121 Milano (MI), P.IVA IT12345678901,
              raggiungibile all'indirizzo <a href="mailto:privacy@debalage.it" className="text-vintage-600 hover:underline">privacy@debalage.it</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">2. Dati raccolti</h2>
            <p>Raccogliamo le seguenti categorie di dati personali:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-bark-700">Dati di registrazione:</strong> nome, indirizzo email, città, ruolo scelto (acquirente/venditore).</li>
              <li><strong className="text-bark-700">Dati di acquisto:</strong> indirizzo di spedizione, storico ordini.</li>
              <li><strong className="text-bark-700">Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, orari di accesso.</li>
              <li><strong className="text-bark-700">Contenuti caricati:</strong> foto, descrizioni, prezzi dei prodotti pubblicati dai venditori.</li>
              <li><strong className="text-bark-700">Comunicazioni:</strong> messaggi inviati tramite la piattaforma o all'assistenza clienti.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">3. Finalità e base giuridica</h2>
            <div className="space-y-4">
              {[
                { title: 'Esecuzione del contratto', base: 'Art. 6(1)(b) GDPR', desc: 'Creazione e gestione dell\'account, elaborazione ordini, gestione prenotazioni slot, comunicazioni transazionali.' },
                { title: 'Legittimo interesse', base: 'Art. 6(1)(f) GDPR', desc: 'Prevenzione frodi, sicurezza della piattaforma, miglioramento del servizio, analisi statistiche anonime.' },
                { title: 'Consenso', base: 'Art. 6(1)(a) GDPR', desc: 'Invio newsletter, profilazione per offerte personalizzate (revocabile in qualsiasi momento).' },
                { title: 'Obbligo legale', base: 'Art. 6(1)(c) GDPR', desc: 'Conservazione dati fiscali e contabili per il periodo previsto dalla legge italiana (10 anni).' },
              ].map(item => (
                <div key={item.title} className="bg-cream-50 rounded-xl p-5 border border-cream-200">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-medium text-bark-800">{item.title}</span>
                    <span className="text-xs bg-vintage-100 text-vintage-700 px-2 py-0.5 rounded-full font-sans">{item.base}</span>
                  </div>
                  <p className="text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">4. Conservazione dei dati</h2>
            <p>
              I dati dell'account sono conservati per tutta la durata del rapporto contrattuale e per 2 anni successivi alla chiusura dell'account.
              I dati fiscali sono conservati per 10 anni ai sensi della normativa italiana.
              I log di navigazione sono conservati per 12 mesi.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">5. Condivisione con terze parti</h2>
            <p>Non vendiamo i tuoi dati. Li condividiamo solo con:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-bark-700">Supabase Inc.</strong> (hosting database e autenticazione) — server nell'UE.</li>
              <li><strong className="text-bark-700">Netlify Inc.</strong> (hosting frontend) — con clausole contrattuali standard GDPR.</li>
              <li><strong className="text-bark-700">Corrieri logistici</strong> (solo nome e indirizzo di spedizione).</li>
              <li><strong className="text-bark-700">Autorità competenti</strong> su richiesta legalmente obbligatoria.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">6. I tuoi diritti</h2>
            <p>Ai sensi del GDPR hai diritto di:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                { right: 'Accesso', desc: 'Ottenere copia dei tuoi dati personali.' },
                { right: 'Rettifica', desc: 'Correggere dati inesatti o incompleti.' },
                { right: 'Cancellazione', desc: 'Richiedere la cancellazione ("diritto all\'oblio").' },
                { right: 'Portabilità', desc: 'Ricevere i dati in formato strutturato e leggibile.' },
                { right: 'Opposizione', desc: 'Opporti al trattamento basato su legittimo interesse.' },
                { right: 'Limitazione', desc: 'Limitare il trattamento in determinati casi.' },
              ].map(r => (
                <div key={r.right} className="bg-cream-50 rounded-xl p-4 border border-cream-200">
                  <span className="font-medium text-bark-800 text-sm">{r.right}</span>
                  <p className="text-xs text-bark-500 mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">
              Per esercitare i tuoi diritti scrivi a{' '}
              <a href="mailto:privacy@debalage.it" className="text-vintage-600 hover:underline">privacy@debalage.it</a>.
              Hai anche il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-vintage-600 hover:underline">garanteprivacy.it</a>).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">7. Cookie</h2>
            <p>
              Per informazioni dettagliate sui cookie utilizzati consulta la nostra{' '}
              <a href="/cookie" className="text-vintage-600 hover:underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">8. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di aggiornare questa informativa. In caso di modifiche sostanziali invieremo
              una notifica via email. La data di "Ultimo aggiornamento" in cima alla pagina indica sempre la versione corrente.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
