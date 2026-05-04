const LAST_UPDATED = '1 gennaio 2026';

export default function Termini() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-bark-900 text-cream-50 pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Documento legale</p>
          <h1 className="font-serif text-5xl mb-2">Termini di servizio</h1>
          <p className="text-cream-400 font-sans text-sm">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10 font-sans text-bark-600 leading-relaxed">

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">1. Accettazione dei termini</h2>
            <p>
              Utilizzando Debalage (il "Servizio") accetti integralmente i presenti Termini di Servizio.
              Se non accetti, ti preghiamo di non utilizzare il Servizio. Questi termini costituiscono
              un contratto vincolante tra te e <strong className="text-bark-800">Debalage S.r.l.</strong>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">2. Il Servizio</h2>
            <p>
              Debalage è un marketplace online che mette in contatto venditori di prodotti vintage e usati
              con acquirenti. Debalage non è parte delle transazioni tra utenti, ma fornisce la piattaforma
              e i servizi di supporto.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">3. Registrazione e account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Devi avere almeno 18 anni per registrarti.</li>
              <li>Le informazioni fornite in fase di registrazione devono essere veritiere e aggiornate.</li>
              <li>Sei responsabile della riservatezza delle tue credenziali di accesso.</li>
              <li>Un account non può essere ceduto o condiviso con terzi.</li>
              <li>Debalage si riserva il diritto di sospendere o chiudere account che violano questi termini.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">4. Obblighi del venditore</h2>
            <p className="mb-3">Chi vende su Debalage si impegna a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pubblicare solo prodotti di propria disponibilità e legalmente vendibili.</li>
              <li>Descrivere accuratamente condizioni, difetti e caratteristiche dei prodotti.</li>
              <li>Utilizzare foto reali, non immagini di repertorio o rubate da altri siti.</li>
              <li>Spedire i prodotti entro 5 giorni lavorativi dalla conferma dell'ordine.</li>
              <li>Non pubblicare prodotti contraffatti, vietati dalla legge o soggetti a restrizioni.</li>
              <li>Rispettare le normative fiscali italiane per le vendite effettuate.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">5. Obblighi dell'acquirente</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornire un indirizzo di spedizione corretto e completo.</li>
              <li>Pagare il prezzo concordato più eventuali costi di spedizione.</li>
              <li>Segnalare eventuali problemi entro 7 giorni dalla ricezione del prodotto.</li>
              <li>Non effettuare acquisti fraudolenti o con metodi di pagamento non autorizzati.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">6. Commissioni e pagamenti</h2>
            <p className="mb-3">
              Debalage applica una commissione sulle vendite secondo il piano attivo del venditore
              (consultare la pagina <a href="/commissioni" className="text-vintage-600 hover:underline">Commissioni</a>).
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>I pagamenti sono elaborati tramite provider certificati PCI-DSS.</li>
              <li>Il pagamento è trattenuto in escrow fino alla conferma di consegna.</li>
              <li>Il venditore riceve l'accredito entro 3 giorni lavorativi dalla conferma.</li>
              <li>In caso di disputa, il pagamento è trattenuto fino alla risoluzione.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">7. Resi e rimborsi</h2>
            <div className="bg-cream-50 rounded-xl p-5 border border-cream-200 space-y-3 text-sm">
              <p><strong className="text-bark-800">Diritto di recesso (acquisto online):</strong> hai 14 giorni dalla ricezione del prodotto per restituirlo, senza necessità di motivazione, ai sensi del D.Lgs. 206/2005.</p>
              <p><strong className="text-bark-800">Prodotto non conforme alla descrizione:</strong> hai 7 giorni per aprire una disputa. Il nostro team esamina documentazione fotografica e, se confermata la discrepanza, rimborsa integralmente includendo le spese di restituzione.</p>
              <p><strong className="text-bark-800">Prodotto non ricevuto:</strong> dopo 30 giorni dalla spedizione senza consegna, Debalage rimborsa integralmente l'acquirente.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">8. Contenuti vietati</h2>
            <p className="mb-3">È vietato pubblicare o vendere:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prodotti contraffatti o che violano diritti di proprietà intellettuale</li>
              <li>Armi, munizioni o materiale esplosivo</li>
              <li>Sostanze stupefacenti o psicotrope</li>
              <li>Animali vivi o parti di specie protette</li>
              <li>Materiale pornografico o che coinvolge minori</li>
              <li>Dati personali di terzi</li>
              <li>Prodotti rubati o di provenienza illecita</li>
            </ul>
            <p className="mt-3">La violazione comporta la rimozione immediata dell'annuncio e la sospensione dell'account.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">9. Limitazione di responsabilità</h2>
            <p>
              Debalage non è responsabile per la qualità, autenticità o legalità dei prodotti venduti dagli utenti,
              né per eventuali danni derivanti da transazioni tra utenti. La responsabilità di Debalage è limitata
              al valore dell'ordine oggetto della disputa.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">10. Legge applicabile e foro competente</h2>
            <p>
              I presenti Termini sono disciplinati dalla legge italiana. Per qualsiasi controversia
              è competente il Foro di Milano, salvo diversa previsione inderogabile di legge a favore del consumatore.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">11. Modifiche ai termini</h2>
            <p>
              Debalage si riserva il diritto di modificare questi Termini con preavviso di 30 giorni via email.
              L'utilizzo continuato del Servizio dopo tale periodo costituisce accettazione delle modifiche.
            </p>
          </section>

          <div className="bg-cream-50 rounded-2xl p-6 border border-cream-200 text-sm">
            <p className="text-bark-700">
              Per domande sui presenti Termini contattaci a{' '}
              <a href="mailto:legal@debalage.it" className="text-vintage-600 hover:underline">legal@debalage.it</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
