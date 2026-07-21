import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Star, Shield, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import EventCard from '../components/EventCard';
import ProductCard from '../components/ProductCard';
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import debalageHero from '../assets/debalage-hero.webp';

// Maps product category strings → CATEGORIES id
const CATEGORY_MAP: Record<string, string> = {
  abbigliamento: 'abbigliamento',
  accessori:     'accessori',
  gioielli:      'gioielli',
  mobili:        'mobili',
  illuminazione: 'mobili',
  elettronica:   'elettronica',
  vinili:        'elettronica',
  ceramiche:     'ceramiche',
  arte:          'ceramiche',
  libri:         'libri',
  stampe:        'libri',
};

function getCategoryId(category: string): string {
  const key = category.toLowerCase().split(' ')[0];
  return CATEGORY_MAP[key] ?? 'altro';
}

// Skeleton card placeholder shown while loading
function SkeletonCard({ aspect = 'product' }: { aspect?: 'product' | 'event' }) {
  return (
    <div className={`rounded-3xl bg-cream-100 animate-pulse ${aspect === 'event' ? 'h-72' : 'h-80'}`} />
  );
}

export default function Home() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery]     = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone]   = useState(false);
  const navigate = useNavigate();

  // ── Derived data ────────────────────────────────────────────────────────────

  // Events: prefer featured, then fall back to soonest upcoming
  const featuredEvents = useMemo(() => {
    const upcoming = state.events.filter(e => e.status !== 'completed');
    const featured = upcoming.filter(e => e.featured);
    return (featured.length > 0 ? featured : upcoming).slice(0, 3);
  }, [state.events]);

  // Products: prefer featured, then fall back to most recent available
  const featuredProducts = useMemo(() => {
    const available = state.products.filter(p => p.status === 'available');
    const featured  = available.filter(p => p.featured);
    return (featured.length > 0 ? featured : available).slice(0, 4);
  }, [state.products]);

  // Sellers: prefer verified, highest rated
  const topSellers = useMemo(() =>
    [...state.users]
      .filter(u => u.role === 'seller' || u.role === 'both')
      .sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || b.rating - a.rating)
      .slice(0, 4),
    [state.users]
  );

  // ── Real stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const availableCount = state.products.filter(p => p.status === 'available').length;

    const now = new Date();
    const monthEventsCount = state.events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    const sellers = state.users.filter(u => u.role === 'seller' || u.role === 'both');
    const verifiedCount = sellers.filter(u => u.verified).length;

    const ratingsWithValues = sellers.filter(u => u.rating > 0);
    const avgRating = ratingsWithValues.length > 0
      ? (ratingsWithValues.reduce((s, u) => s + u.rating, 0) / ratingsWithValues.length).toFixed(1)
      : '—';

    return [
      {
        value: availableCount > 0 ? `${availableCount.toLocaleString('it-IT')}` : '—',
        label: 'Prodotti disponibili',
      },
      {
        value: monthEventsCount > 0 ? String(monthEventsCount) : '—',
        label: 'Eventi questo mese',
      },
      {
        value: verifiedCount > 0 ? `${verifiedCount}` : sellers.length > 0 ? String(sellers.length) : '—',
        label: 'Venditori verificati',
      },
      {
        value: avgRating !== '—' ? `${avgRating}★` : '—',
        label: 'Valutazione media',
      },
    ];
  }, [state.products, state.events, state.users]);

  // ── Real category counts ─────────────────────────────────────────────────────
  const categoriesWithCount = useMemo(() => {
    // Count available products per category id — always real, never mock
    const counts: Record<string, number> = {};
    for (const p of state.products) {
      if (p.status === 'available') {
        const catId = getCategoryId(p.category);
        counts[catId] = (counts[catId] ?? 0) + 1;
      }
    }
    return CATEGORIES.map(cat => ({ ...cat, count: counts[cat.id] ?? 0 }));
  }, [state.products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/prodotti?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isLoading = state.loading;

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-bark-900">
        <div className="absolute inset-0">
          <img
            src={debalageHero}
            alt="Mercatino vintage Debalage"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bark-900/95 via-bark-900/65 to-bark-900/15" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-vintage-600/20 border border-vintage-500/30 text-vintage-300 px-4 py-2 rounded-full text-xs font-sans uppercase tracking-widest mb-6">
              <Sparkles size={12} />
              Il marketplace del vintage italiano
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream-50 leading-[1.05] mb-6">
              Scopri Tesori<br />
              <em className="text-vintage-300">del Passato</em>
            </h1>

            <p className="text-cream-300 text-lg font-sans leading-relaxed mb-8">
              Pezzi unici in vendite private, mercatini ed eventi in tutta Italia.
              Abbigliamento, mobili, gioielli, vinili e molto altro.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cerca: abito anni '60, Thorens, Capodimonte..."
                  className="w-full bg-white/10 backdrop-blur border border-white/20 text-cream-50 placeholder-cream-400/60 rounded-full pl-11 pr-4 py-3.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-vintage-400 focus:bg-white/20 transition"
                />
              </div>
              <button type="submit" className="btn-primary !rounded-full whitespace-nowrap">
                Cerca
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              {['Abbigliamento', 'Mobili & Design', 'Gioielli', 'Vinili'].map(tag => (
                <Link
                  key={tag}
                  to={`/prodotti?q=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-cream-200 text-xs font-sans hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-400">
          <span className="text-xs font-sans uppercase tracking-widest">Scopri</span>
          <div className="w-px h-8 bg-cream-400/40 animate-pulse" />
        </div>
      </section>

      {/* Stats bar — real data */}
      <section className="bg-bark-800 text-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(stat => (
              <div key={stat.label}>
                {isLoading ? (
                  <div className="h-8 w-20 mx-auto bg-bark-700 rounded animate-pulse mb-1" />
                ) : (
                  <div className="font-serif text-2xl text-cream-50">{stat.value}</div>
                )}
                <div className="text-xs text-cream-400 font-sans mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Prossimi appuntamenti</p>
            <h2 className="section-title">Case & Eventi<br />in arrivo</h2>
          </div>
          <Link to="/eventi" className="btn-ghost hidden sm:flex">
            Tutti gli eventi <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} aspect="event" />)
            : featuredEvents.length > 0
              ? featuredEvents.map((event, i) => <EventCard key={event.id} event={event} featured={i === 0} />)
              : (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-4xl mb-3">🏠</p>
                  <p className="font-serif text-xl text-bark-600">Nessun evento in programma</p>
                  <p className="text-sm text-bark-400 font-sans mt-2">I nuovi eventi appariranno qui non appena saranno pubblicati.</p>
                </div>
              )
          }
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/eventi" className="btn-secondary">
            Tutti gli eventi <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Categories — real counts */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Cosa cerchi?</p>
            <h2 className="section-title">Esplora per categoria</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categoriesWithCount.map(cat => (
              <Link
                key={cat.id}
                to={`/prodotti?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-cream-200 hover:border-vintage-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-bark-700 font-sans leading-tight">{cat.name}</span>
                {isLoading ? (
                  <span className="block h-3 w-8 bg-cream-200 rounded animate-pulse mx-auto" />
                ) : (
                  <span className="text-[10px] text-bark-400 font-sans">
                    {cat.count} {cat.count === 1 ? 'pezzo' : 'pezzi'}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Pezzi selezionati</p>
            <h2 className="section-title">Prodotti in evidenza</h2>
          </div>
          <Link to="/prodotti" className="btn-ghost hidden sm:flex">
            Tutti i prodotti <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featuredProducts.length > 0
              ? featuredProducts.map(product => <ProductCard key={product.id} product={product} />)
              : (
                <div className="col-span-4 py-16 text-center">
                  <p className="text-4xl mb-3">🏷️</p>
                  <p className="font-serif text-xl text-bark-600">Nessun prodotto disponibile</p>
                  <p className="text-sm text-bark-400 font-sans mt-2">I prodotti caricati dai venditori appariranno qui.</p>
                </div>
              )
          }
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/prodotti" className="btn-secondary">
            Tutti i prodotti <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">La nostra community</p>
            <h2 className="section-title">Venditori in evidenza</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-6 text-center animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-cream-200 mx-auto mb-4" />
                    <div className="h-4 bg-cream-200 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-cream-200 rounded w-1/2 mx-auto" />
                  </div>
                ))
              : topSellers.length > 0
                ? topSellers.map(seller => (
                    <Link key={seller.id} to={`/venditore/${seller.id}`} className="group">
                      <div className="card p-6 text-center">
                        <div className="relative mx-auto w-20 h-20 mb-4">
                          <img
                            src={seller.avatar}
                            alt={seller.name}
                            className="w-full h-full rounded-full object-cover ring-4 ring-cream-100 group-hover:ring-vintage-200 transition-all"
                          />
                          {seller.verified && (
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-vintage-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                          )}
                        </div>
                        <h3 className="font-serif text-bark-900 font-semibold">{seller.name}</h3>
                        <p className="text-xs text-bark-400 font-sans mb-3">{seller.city}</p>
                        {seller.rating > 0 && (
                          <div className="flex items-center justify-center gap-1 mb-3">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-bark-700 font-sans">{seller.rating}</span>
                            <span className="text-xs text-bark-400 font-sans">({seller.reviewCount})</span>
                          </div>
                        )}
                        {seller.specialties.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1">
                            {seller.specialties.slice(0, 2).map(s => (
                              <span key={s} className="badge bg-cream-100 text-bark-600">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                : (
                  <div className="col-span-4 py-16 text-center">
                    <p className="text-4xl mb-3">👤</p>
                    <p className="font-serif text-xl text-bark-600">Nessun venditore ancora</p>
                  </div>
                )
            }
          </div>

          <div className="text-center mt-8">
            <Link to="/venditori" className="btn-secondary">
              Tutti i venditori <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-2">Perché sceglierci</p>
          <h2 className="section-title">Un mercato diverso,<br />fatto di persone</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield size={28} className="text-vintage-600" />,
              title: 'Venditori verificati',
              desc: 'Ogni venditore è valutato dalla community. I venditori verificati hanno superato il nostro processo di validazione.',
            },
            {
              icon: <Star size={28} className="text-vintage-600" />,
              title: 'Pezzi autentici',
              desc: 'Ogni oggetto è descritto in dettaglio con foto reali, anno, condizione e provenienza. Zero sorprese.',
            },
            {
              icon: <Truck size={28} className="text-vintage-600" />,
              title: 'Ritiro o spedizione',
              desc: "Scegli di ritirare il pezzo direttamente all'evento o di riceverlo a casa con imballaggio sicuro e assicurato.",
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

      {/* Newsletter */}
      <section className="py-20 bg-bark-800">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Non perdere niente</p>
          <h2 className="font-serif text-4xl text-cream-50 mb-4">Nuovi eventi ogni settimana</h2>
          <p className="text-cream-300 font-sans mb-8">
            Iscriviti alla newsletter e ricevi in anticipo le date delle prossime vendite private e dei mercatini.
          </p>
          {newsletterDone ? (
            <div className="flex items-center justify-center gap-3 text-emerald-300 font-sans">
              <CheckCircle2 size={22} />
              <span className="text-lg">Iscrizione confermata! A presto in inbox.</span>
            </div>
          ) : (
            <form
              className="flex gap-2 max-w-md mx-auto"
              onSubmit={e => {
                e.preventDefault();
                if (newsletterEmail.trim()) setNewsletterDone(true);
              }}
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="La tua email"
                className="flex-1 bg-white/10 border border-white/20 text-cream-50 placeholder-cream-400/60 rounded-full px-5 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-vintage-400 transition"
              />
              <button type="submit" className="bg-vintage-500 hover:bg-vintage-400 text-white px-6 py-3 rounded-full text-sm font-medium font-sans transition-colors whitespace-nowrap">
                Iscrivimi
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
