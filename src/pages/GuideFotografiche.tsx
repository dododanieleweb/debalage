import { Camera, Sun, Layout, Maximize2, Tag, CheckCircle2, XCircle } from 'lucide-react';

const SECTIONS = [
  {
    icon: <Sun size={28} className="text-vintage-600" />,
    title: 'Luce naturale — la tua migliore alleata',
    tips: [
      'Scatta vicino a una finestra con luce diffusa (non sole diretto)',
      'Orario ideale: mattina presto o tardo pomeriggio',
      'Evita il flash: appiattisce i colori e crea riflessi',
      'Giornate nuvolose? Perfette: luce morbida e uniforme',
    ],
    bad: 'Foto scure, con ombre dure o dominanti di colore arancione da lampade a incandescenza.',
  },
  {
    icon: <Layout size={28} className="text-vintage-600" />,
    title: 'Sfondo pulito — il prodotto al centro',
    tips: [
      'Usa un lenzuolo bianco o crema come sfondo neutro',
      'Un pavimento in legno o in cotto valorizza gli oggetti vintage',
      'Rimuovi oggetti estranei dall\'inquadratura',
      'Per l\'abbigliamento: gruccia su parete bianca o flat lay su lenzuolo',
    ],
    bad: 'Sfondo caotico, cucina o salotto riconoscibili, disordine visibile.',
  },
  {
    icon: <Maximize2 size={28} className="text-vintage-600" />,
    title: 'Angolazioni e dettagli',
    tips: [
      'Prima foto: il prodotto intero, ben centrato',
      'Seconda: 3/4 frontale per dare profondità',
      'Dettagli significativi: etichette, marchi, hardware, texture',
      'Eventuali difetti: fotografali chiaramente — la trasparenza fidelizza',
    ],
    bad: 'Foto tagliata che non mostra il prodotto per intero, unica foto senza dettagli.',
  },
  {
    icon: <Tag size={28} className="text-vintage-600" />,
    title: 'Marchi, etichette e targhette',
    tips: [
      'Fotografa sempre l\'etichetta di composizione (abbigliamento)',
      'Per mobili: il marchio del produttore sul retro o sotto',
      'Ceramica e porcellana: il punzone sul fondo',
      'Vinili: la label centrale con titolo e numero di catalogo',
    ],
    bad: 'Nessuna foto dell\'etichetta: l\'acquirente non può verificare autenticità ed epoca.',
  },
];

const GEAR = [
  { device: 'Smartphone', desc: 'iPhone 12+ o equivalente Android con modalità ritratto disattivata. Usa la fotocamera principale, non il grandangolo.' },
  { device: 'Treppiede', desc: 'Anche economico: elimina il mosso nelle foto con poca luce e garantisce inquadrature coerenti.' },
  { device: 'Pannello bianco', desc: 'Un cartoncino bianco A3 come riflettore improvvisato schiarisce le ombre sul lato opposto alla finestra.' },
  { device: 'App di editing', desc: 'Lightroom Mobile (gratuito): regola esposizione, bianco e bianchi senza distorcere i colori reali.' },
];

export default function GuideFotografiche() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="bg-bark-900 text-cream-50 pt-16 pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Per venditori</p>
          <h1 className="font-serif text-5xl mb-4">Guide fotografiche</h1>
          <p className="text-cream-300 font-sans text-lg leading-relaxed">
            Una buona foto vale quanto una buona descrizione. Segui questi consigli e i tuoi prodotti si venderanno da soli.
          </p>
        </div>
      </div>

      {/* Regola d'oro */}
      <section className="py-14 bg-vintage-50 border-y border-vintage-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Camera size={36} className="text-vintage-600 mx-auto mb-4" />
          <p className="font-serif text-2xl text-bark-900 mb-3">La regola d'oro</p>
          <p className="text-bark-600 font-sans leading-relaxed">
            Carica <strong>almeno 3 foto</strong> per ogni prodotto: panoramica, dettaglio e difetti (se presenti).
            I prodotti con 5+ foto vendono in media <strong>2,4× più velocemente</strong>.
          </p>
        </div>
      </section>

      {/* Sezioni */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {SECTIONS.map((s, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className={i % 2 === 1 ? 'md:order-2' : ''}>
              <div className="w-12 h-12 bg-cream-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                {s.icon}
              </div>
              <h2 className="font-serif text-2xl text-bark-900 mb-4">{s.title}</h2>
              <ul className="space-y-2.5">
                {s.tips.map((t, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm font-sans text-bark-600">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`bg-rose-50 border border-rose-100 rounded-2xl p-5 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={16} className="text-rose-500 shrink-0" />
                <span className="text-sm font-medium text-rose-700 font-sans">Da evitare</span>
              </div>
              <p className="text-sm text-rose-600 font-sans leading-relaxed">{s.bad}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Attrezzatura */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-bark-900">L'attrezzatura che ti serve</h2>
            <p className="text-bark-400 font-sans mt-2 text-sm">Niente di costoso — con uno smartphone fai già il 90%</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {GEAR.map(g => (
              <div key={g.device} className="bg-white rounded-2xl p-6 border border-cream-200">
                <h3 className="font-serif text-lg text-bark-900 mb-2">{g.device}</h3>
                <p className="text-sm text-bark-500 font-sans leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist finale */}
      <section className="py-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-bark-900">Checklist prima di pubblicare</h2>
        </div>
        <div className="space-y-3">
          {[
            'Almeno 3 foto caricate',
            'Sfondo neutro e pulito',
            'Luce uniforme senza ombre dure',
            'Prodotto completamente visibile nella prima foto',
            'Foto dell\'etichetta / marchio',
            'Eventuali difetti fotografati e indicati nella descrizione',
            'Colori fedeli alla realtà (niente filtri che alterano)',
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl border border-cream-200 cursor-pointer hover:border-vintage-300 transition-colors group">
              <input type="checkbox" className="w-4 h-4 accent-vintage-600 shrink-0" />
              <span className="text-sm text-bark-700 font-sans group-hover:text-bark-900 transition-colors">{item}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
