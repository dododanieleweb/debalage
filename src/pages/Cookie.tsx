import { useState } from 'react';

const LAST_UPDATED = '1 gennaio 2026';

const COOKIE_TYPES = [
  {
    name: 'Tecnici (necessari)',
    required: true,
    desc: 'Indispensabili per il funzionamento del sito. Gestiscono la sessione di autenticazione, il carrello e le preferenze base. Non possono essere disattivati.',
    cookies: [
      { name: 'sb-access-token', purpose: 'Token di autenticazione Supabase', duration: 'Sessione' },
      { name: 'sb-refresh-token', purpose: 'Rinnovo automatico della sessione', duration: '30 giorni' },
      { name: 'debalage_cart', purpose: 'Contenuto del carrello (localStorage)', duration: 'Persistente' },
    ],
  },
  {
    name: 'Analitici',
    required: false,
    desc: 'Raccolgono dati anonimi su come gli utenti navigano il sito (pagine visitate, tempo di permanenza, provenienza). Ci aiutano a migliorare il Servizio.',
    cookies: [
      { name: '_ga, _ga_*', purpose: 'Google Analytics — statistiche di navigazione anonime', duration: '2 anni' },
      { name: '_gid', purpose: 'Google Analytics — sessione anonima', duration: '24 ore' },
    ],
  },
  {
    name: 'Marketing',
    required: false,
    desc: 'Utilizzati per mostrare annunci pertinenti su siti terzi e misurare l\'efficacia delle campagne pubblicitarie.',
    cookies: [
      { name: '_fbp', purpose: 'Facebook Pixel — tracciamento conversioni', duration: '3 mesi' },
      { name: 'IDE', purpose: 'Google Ads — tracciamento conversioni', duration: '13 mesi' },
    ],
  },
];

export default function Cookie() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({
    'Analitici': false,
    'Marketing': false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-bark-900 text-cream-50 pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Documento legale</p>
          <h1 className="font-serif text-5xl mb-2">Cookie Policy</h1>
          <p className="text-cream-400 font-sans text-sm">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10 font-sans text-bark-600 leading-relaxed">

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">Cosa sono i cookie?</h2>
            <p>
              I cookie sono piccoli file di testo che i siti web salvano nel tuo browser durante la navigazione.
              Servono a memorizzare preferenze, mantenere le sessioni di accesso e raccogliere dati statistici.
              Puoi controllare e cancellare i cookie tramite le impostazioni del tuo browser.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-6">I cookie che utilizziamo</h2>
            <div className="space-y-6">
              {COOKIE_TYPES.map(ct => (
                <div key={ct.name} className="bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
                    <div>
                      <span className="font-medium text-bark-800">{ct.name}</span>
                      {ct.required && (
                        <span className="ml-2 text-xs bg-bark-200 text-bark-600 px-2 py-0.5 rounded-full">Sempre attivi</span>
                      )}
                    </div>
                    {!ct.required && (
                      <button
                        onClick={() => setAccepted(prev => ({ ...prev, [ct.name]: !prev[ct.name] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${accepted[ct.name] ? 'bg-vintage-600' : 'bg-cream-300'}`}
                        aria-label={`Toggle ${ct.name}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${accepted[ct.name] ? 'translate-x-5' : ''}`} />
                      </button>
                    )}
                    {ct.required && (
                      <div className="relative w-11 h-6 rounded-full bg-bark-400 cursor-not-allowed">
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-5" />
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm mb-4">{ct.desc}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-cream-300">
                            <th className="text-left pb-2 text-bark-500 font-medium">Nome</th>
                            <th className="text-left pb-2 text-bark-500 font-medium">Finalità</th>
                            <th className="text-left pb-2 text-bark-500 font-medium">Durata</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ct.cookies.map(c => (
                            <tr key={c.name} className="border-b border-cream-200 last:border-0">
                              <td className="py-2 pr-4 font-mono text-bark-700">{c.name}</td>
                              <td className="py-2 pr-4 text-bark-600">{c.purpose}</td>
                              <td className="py-2 text-bark-500 whitespace-nowrap">{c.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Salva preferenze */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                Salva preferenze
              </button>
              <button
                onClick={() => { setAccepted({ Analitici: true, Marketing: true }); handleSave(); }}
                className="text-sm text-bark-500 hover:text-bark-800 font-sans transition-colors"
              >
                Accetta tutti
              </button>
              <button
                onClick={() => { setAccepted({ Analitici: false, Marketing: false }); handleSave(); }}
                className="text-sm text-bark-500 hover:text-bark-800 font-sans transition-colors"
              >
                Rifiuta facoltativi
              </button>
            </div>
            {saved && (
              <p className="mt-3 text-sm text-emerald-600 font-sans flex items-center gap-1.5">
                <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                Preferenze salvate.
              </p>
            )}
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">Come disabilitare i cookie dal browser</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer' },
                { name: 'Apple Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471' },
                { name: 'Microsoft Edge', url: 'https://support.microsoft.com/windows/delete-and-manage-cookies' },
              ].map(b => (
                <a
                  key={b.name}
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl border border-cream-200 hover:border-vintage-300 transition-colors text-sm text-vintage-600 hover:text-vintage-800"
                >
                  <span className="text-lg">🔗</span>
                  {b.name}
                </a>
              ))}
            </div>
            <p className="text-sm mt-4">
              Disabilitando i cookie tecnici alcune funzioni del sito (login, carrello) potrebbero non funzionare correttamente.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-bark-900 mb-4">Contatti</h2>
            <p>
              Per domande sulla Cookie Policy scrivi a{' '}
              <a href="mailto:privacy@debalage.it" className="text-vintage-600 hover:underline">privacy@debalage.it</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
