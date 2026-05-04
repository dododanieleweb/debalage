import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, TrendingUp, Zap, Star } from 'lucide-react';

const PLANS = [
  {
    name: 'Base',
    icon: '🌱',
    monthly: 'Gratuito',
    commission: '12%',
    features: [
      'Fino a 20 prodotti pubblicati',
      '1 evento al mese',
      'Slot di prenotazione illimitati',
      'Dashboard base',
      'Supporto via email',
    ],
    highlight: false,
    cta: 'Inizia gratis',
  },
  {
    name: 'Pro',
    icon: '⚡',
    monthly: '€9,90 / mese',
    commission: '7%',
    features: [
      'Prodotti illimitati',
      'Eventi illimitati',
      'Badge "Venditore Pro"',
      'Priorità nei risultati di ricerca',
      'Statistiche avanzate',
      'Supporto prioritario',
    ],
    highlight: true,
    cta: 'Passa a Pro',
  },
  {
    name: 'Business',
    icon: '🏛️',
    monthly: '€29,90 / mese',
    commission: '4%',
    features: [
      'Tutto di Pro',
      'Badge "Venditore Business"',
      'Account manager dedicato',
      'API per gestione catalogo',
      'Report mensili personalizzati',
      'Posizionamento in evidenza',
    ],
    highlight: false,
    cta: 'Contattaci',
  },
];

const EXAMPLES = [
  { price: 50, base: 6, pro: 3.5, business: 2 },
  { price: 150, base: 18, pro: 10.5, business: 6 },
  { price: 400, base: 48, pro: 28, business: 16 },
  { price: 1000, base: 120, pro: 70, business: 40 },
];

export default function Commissioni() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="bg-bark-900 text-cream-50 pt-16 pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Trasparenza totale</p>
          <h1 className="font-serif text-5xl mb-4">Commissioni & Prezzi</h1>
          <p className="text-cream-300 font-sans text-lg leading-relaxed">
            Nessuna sorpresa. Paghi solo quando vendi, con commissioni tra le più basse del mercato italiano.
          </p>
        </div>
      </div>

      {/* Piani */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Scegli il tuo piano</p>
          <h2 className="font-serif text-4xl text-bark-900">Piani venditori</h2>
          <p className="text-bark-400 font-sans mt-2">Cambia piano in qualsiasi momento, senza penali.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-bark-900 border-bark-800 text-cream-50 shadow-2xl scale-105'
                  : 'bg-white border-cream-200'
              }`}
            >
              {plan.highlight && (
                <span className="self-start text-xs font-medium font-sans bg-vintage-600 text-white px-3 py-1 rounded-full mb-4">
                  Più popolare
                </span>
              )}
              <div className="text-3xl mb-2">{plan.icon}</div>
              <h3 className={`font-serif text-2xl mb-1 ${plan.highlight ? 'text-cream-50' : 'text-bark-900'}`}>{plan.name}</h3>
              <p className={`font-sans text-sm mb-1 ${plan.highlight ? 'text-cream-300' : 'text-bark-400'}`}>{plan.monthly}</p>
              <div className={`font-serif text-4xl font-semibold my-4 ${plan.highlight ? 'text-vintage-300' : 'text-vintage-700'}`}>
                {plan.commission}
                <span className={`text-base font-sans font-normal ml-1 ${plan.highlight ? 'text-cream-400' : 'text-bark-400'}`}>commissione</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm font-sans">
                    <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-vintage-400' : 'text-vintage-600'}`} />
                    <span className={plan.highlight ? 'text-cream-200' : 'text-bark-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className={`block text-center py-3 rounded-full text-sm font-medium font-sans transition-colors ${
                  plan.highlight
                    ? 'bg-vintage-500 hover:bg-vintage-400 text-white'
                    : 'bg-bark-900 hover:bg-bark-700 text-cream-50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Esempi di calcolo */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-bark-900">Esempi di guadagno netto</h2>
            <p className="text-bark-400 font-sans mt-2 text-sm">Quanto intaschi al netto della commissione Debalage</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-cream-300">
                  <th className="text-left py-3 px-4 text-bark-500 font-medium">Prezzo vendita</th>
                  <th className="text-right py-3 px-4 text-bark-500 font-medium">Piano Base (12%)</th>
                  <th className="text-right py-3 px-4 text-vintage-700 font-semibold">Piano Pro (7%)</th>
                  <th className="text-right py-3 px-4 text-bark-500 font-medium">Piano Business (4%)</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map(row => (
                  <tr key={row.price} className="border-b border-cream-200 hover:bg-cream-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-bark-800">€{row.price.toLocaleString('it-IT')}</td>
                    <td className="py-3 px-4 text-right text-bark-600">
                      €{(row.price - row.base).toFixed(2)}
                      <span className="text-bark-400 ml-1 text-xs">(-€{row.base})</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-vintage-700">
                      €{(row.price - row.pro).toFixed(2)}
                      <span className="text-vintage-400 ml-1 text-xs font-normal">(-€{row.pro})</span>
                    </td>
                    <td className="py-3 px-4 text-right text-bark-600">
                      €{(row.price - row.business).toFixed(2)}
                      <span className="text-bark-400 ml-1 text-xs">(-€{row.business})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-bark-400 font-sans mt-4 text-center">
            * Gli importi non includono eventuali costi di spedizione che vengono addebitati separatamente all'acquirente.
          </p>
        </div>
      </section>

      {/* Perché conveniente */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-bark-900">Perché conviene vendere su Debalage</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <TrendingUp size={24} className="text-vintage-600" />,
              title: 'Audience qualificata',
              desc: 'I nostri acquirenti cercano attivamente pezzi vintage di qualità. La conversione è 3× superiore ai marketplace generalisti.',
            },
            {
              icon: <Zap size={24} className="text-vintage-600" />,
              title: 'Gestione eventi integrata',
              desc: 'Organizza vendite in casa privata con calendario slot incluso. Nessun altro marketplace offre questa funzione.',
            },
            {
              icon: <Star size={24} className="text-vintage-600" />,
              title: 'Brand building',
              desc: 'Costruisci la tua reputazione con recensioni, profilo pubblico e badge verificato. Il tuo nome vale quanto i tuoi pezzi.',
            },
          ].map(item => (
            <div key={item.title} className="p-8 rounded-3xl bg-cream-100 border border-cream-200">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-serif text-xl text-bark-900 mb-3">{item.title}</h3>
              <p className="text-sm text-bark-500 font-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bark-800 text-center px-4">
        <h2 className="font-serif text-3xl text-cream-50 mb-3">Inizia a vendere oggi</h2>
        <p className="text-cream-300 font-sans mb-8">Piano Base gratuito — nessuna carta di credito richiesta.</p>
        <Link to="/dashboard" className="btn-primary">
          Apri la tua vetrina <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
