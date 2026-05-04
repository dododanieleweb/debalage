import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Star, Shield, Camera, Calendar, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

const BUYER_STEPS = [
  {
    icon: <Search size={28} className="text-vintage-600" />,
    title: 'Cerca e scopri',
    desc: "Sfoglia migliaia di prodotti unici per categoria, epoca, condizione e prezzo. Usa la ricerca per trovare esattamente quello che cerchi — dal vestito anni '60 al giradischi Thorens.",
  },
  {
    icon: <Star size={28} className="text-vintage-600" />,
    title: 'Salva i preferiti',
    desc: 'Aggiungi a cuoricino i pezzi che ti piacciono. Li ritrovi sempre nella tua wishlist, così non perdi nulla mentre esplori.',
  },
  {
    icon: <ShoppingBag size={28} className="text-vintage-600" />,
    title: 'Acquista in sicurezza',
    desc: 'Aggiungi al carrello e completa l\'ordine inserendo l\'indirizzo di spedizione. Ogni acquisto è protetto dalla garanzia Debalage.',
  },
  {
    icon: <CheckCircle2 size={28} className="text-vintage-600" />,
    title: 'Ricevi o ritira',
    desc: 'Scegli la spedizione a domicilio oppure il ritiro diretto all\'evento dove il venditore espone. Tracci il tuo ordine dalla Dashboard.',
  },
];

const SELLER_STEPS = [
  {
    icon: <Camera size={28} className="text-vintage-600" />,
    title: 'Fotografa e pubblica',
    desc: 'Scatta foto nitide su sfondo neutro, compila la scheda prodotto con tutti i dettagli (condizione, epoca, brand) e pubblica. Ci vogliono meno di 5 minuti.',
  },
  {
    icon: <Calendar size={28} className="text-vintage-600" />,
    title: 'Crea il tuo evento',
    desc: 'Organizza una vendita in casa privata, un mercatino o una mostra. Imposta data, orari, slot di prenotazione e capienza massima. Il calendario lo gestiamo noi.',
  },
  {
    icon: <Users size={28} className="text-vintage-600" />,
    title: 'Gestisci le prenotazioni',
    desc: 'Dalla Dashboard vedi chi ha prenotato uno slot, quanti posti sono rimasti e i messaggi degli acquirenti. Puoi abilitare o disabilitare gli slot in qualsiasi momento.',
  },
  {
    icon: <ShoppingBag size={28} className="text-vintage-600" />,
    title: 'Incassa e spedisci',
    desc: 'Quando l\'ordine arriva, imballalo con cura e spediscilo. Il pagamento viene accreditato sul tuo conto entro 3 giorni lavorativi dalla conferma di consegna.',
  },
];

const FAQS = [
  {
    q: 'Posso vendere anche senza organizzare un evento?',
    a: 'Sì. Puoi pubblicare prodotti sul catalogo globale e venderli direttamente con spedizione, senza eventi.',
  },
  {
    q: 'Come vengono verificati i venditori?',
    a: 'I venditori verificati hanno superato il processo di validazione di Debalage: documento d\'identità, rating ≥ 4.5 e almeno 10 transazioni positive.',
  },
  {
    q: 'Cosa succede se un prodotto non corrisponde alla descrizione?',
    a: 'Hai 7 giorni dalla consegna per aprire una disputa. Il nostro team esamina il caso e, se confermata la discrepanza, rimborsa integralmente l\'acquirente.',
  },
  {
    q: 'Posso prenotare uno slot senza acquistare niente?',
    a: 'Sì. La prenotazione dello slot è gratuita e senza obbligo d\'acquisto. Ti riserva un orario per visitare l\'evento in modo tranquillo e senza ressa.',
  },
  {
    q: 'Come funziona la spedizione?',
    a: 'Il venditore sceglie il corriere e il costo di spedizione è addebitato all\'acquirente al checkout. Sopra i €100 di ordine la spedizione è gratuita.',
  },
];

export default function ComeFunziona() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="bg-bark-900 text-cream-50 pt-16 pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">La guida completa</p>
          <h1 className="font-serif text-5xl mb-4">Come funziona Debalage</h1>
          <p className="text-cream-300 font-sans text-lg leading-relaxed">
            Un marketplace diverso — fatto di storie, oggetti con un passato e persone appassionate.
            Ecco come iniziare, sia che tu voglia comprare o vendere.
          </p>
        </div>
      </div>

      {/* Comprare */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Per chi vuole acquistare</p>
          <h2 className="font-serif text-4xl text-bark-900">Comprare su Debalage</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BUYER_STEPS.map((s, i) => (
            <div key={i} className="relative">
              <div className="w-12 h-12 bg-cream-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                {s.icon}
              </div>
              <span className="absolute top-0 left-0 w-6 h-6 bg-vintage-600 text-white text-xs rounded-full flex items-center justify-center font-sans font-bold">
                {i + 1}
              </span>
              <h3 className="font-serif text-lg text-bark-900 mb-2">{s.title}</h3>
              <p className="text-sm text-bark-500 font-sans leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/prodotti" className="btn-primary">
            Inizia a sfogliare <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Divisore */}
      <div className="bg-cream-100 py-1" />

      {/* Vendere */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Per chi vuole vendere</p>
          <h2 className="font-serif text-4xl text-bark-900">Vendere su Debalage</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SELLER_STEPS.map((s, i) => (
            <div key={i} className="relative">
              <div className="w-12 h-12 bg-cream-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                {s.icon}
              </div>
              <span className="absolute top-0 left-0 w-6 h-6 bg-bark-800 text-cream-50 text-xs rounded-full flex items-center justify-center font-sans font-bold">
                {i + 1}
              </span>
              <h3 className="font-serif text-lg text-bark-900 mb-2">{s.title}</h3>
              <p className="text-sm text-bark-500 font-sans leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/dashboard" className="btn-primary">
            Accedi alla Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Garanzie */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-bark-900">Le nostre garanzie</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield size={24} className="text-vintage-600" />, title: 'Venditori verificati', desc: 'Ogni venditore è valutato dalla community. I badge "Verificato" indicano chi ha superato la nostra validazione.' },
              { icon: <Star size={24} className="text-vintage-600" />, title: 'Autenticità garantita', desc: 'Descrizioni dettagliate con foto reali, anno, condizione e provenienza. Apertura dispute entro 7 giorni dalla consegna.' },
              { icon: <CheckCircle2 size={24} className="text-vintage-600" />, title: 'Pagamento protetto', desc: 'Il pagamento viene trattenuto in escrow fino alla conferma di consegna. Nessun rischio per acquirente o venditore.' },
            ].map(g => (
              <div key={g.title} className="bg-white rounded-2xl p-6 border border-cream-200">
                <div className="w-10 h-10 bg-cream-100 rounded-xl flex items-center justify-center mb-3">
                  {g.icon}
                </div>
                <h3 className="font-serif text-base text-bark-900 mb-2">{g.title}</h3>
                <p className="text-xs text-bark-500 font-sans leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-bark-900">Domande frequenti</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-serif text-bark-900 text-base select-none">
                {faq.q}
                <span className="ml-4 text-vintage-500 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">+</span>
              </summary>
              <p className="px-6 pb-5 text-sm text-bark-500 font-sans leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bark-800 text-center px-4">
        <h2 className="font-serif text-3xl text-cream-50 mb-3">Pronto a iniziare?</h2>
        <p className="text-cream-300 font-sans mb-8">Registrati gratis e scopri il marketplace del vintage italiano.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/prodotti" className="btn-primary">Sfoglia i prodotti</Link>
          <Link to="/eventi" className="bg-white/10 border border-white/20 text-cream-200 hover:bg-white/20 font-sans font-medium px-5 py-2.5 rounded-full text-sm transition-colors flex items-center gap-2">
            Vedi gli eventi <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
