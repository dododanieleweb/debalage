import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Package, Star, ArrowLeft, Share2, Heart } from 'lucide-react';
import { EVENT_TYPES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import EventCalendar from '../components/EventCalendar';
import { useApp } from '../context/AppContext';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, openAuth, notify } = useApp();

  const event = state.events.find(e => e.id === id);
  if (!event) return (
    <div className="pt-32 text-center min-h-screen">
      <p className="text-bark-400 font-sans">Evento non trovato.</p>
      <Link to="/eventi" className="btn-primary mt-4 inline-flex">Torna agli eventi</Link>
    </div>
  );

  const seller       = state.users.find(u => u.id === event.sellerId);
  const eventType    = EVENT_TYPES[event.type];
  const products     = state.products.filter(p => p.eventId === event.id);
  const formattedDate = new Date(event.date).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const isPrivate  = event.type === 'casa_privata';
  const slots      = state.slots[event.id] ?? [];
  const bookedSlot = isPrivate
    ? (state.user ? slots.find(s => s.bookings.some(b => b.userId === state.user!.id)) ?? null : null)
    : null;

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-cream-200">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bark-900/80 via-bark-900/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge ${eventType.color}`}>{eventType.icon} {eventType.label}</span>
            {event.status === 'upcoming'  && <span className="badge bg-emerald-500/90 text-white">In arrivo</span>}
            {event.status === 'ongoing'   && <span className="badge bg-emerald-500 text-white flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />In corso ora</span>}
            {event.status === 'completed' && <span className="badge bg-bark-600/80 text-cream-200">Concluso</span>}
            {isPrivate && slots.length > 0 && (
              <span className="badge bg-blue-500/90 text-white">🗓 Prenotazione a slot</span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{event.title}</h1>
        </div>

        <Link to="/eventi" className="absolute top-20 left-4 btn-ghost !text-white !bg-white/10 hover:!bg-white/20">
          <ArrowLeft size={16} /> Tutti gli eventi
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl text-bark-900 mb-4">L'evento</h2>
              <p className="text-bark-600 font-sans leading-relaxed">{event.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map(tag => (
                  <span key={tag} className="badge bg-cream-100 text-bark-600">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Calendar (only for casa_privata with slots) */}
            {isPrivate && slots.length > 0 && event.status !== 'completed' && (
              <div data-calendar>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-serif text-2xl text-bark-900">Prenota il tuo appuntamento</h2>
                  {bookedSlot && (
                    <span className="badge bg-blue-100 text-blue-700 border border-blue-200">✓ Prenotato</span>
                  )}
                </div>

                {!state.user && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5">
                    <span className="text-amber-500 mt-0.5">ℹ️</span>
                    <div>
                      <p className="text-sm font-medium text-amber-900 font-sans">Accedi per prenotare</p>
                      <p className="text-xs text-amber-700 font-sans mt-0.5">
                        Devi essere registrato per scegliere il tuo slot.{' '}
                        <button onClick={() => openAuth('login')} className="underline font-medium">
                          Accedi ora
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                <EventCalendar event={event} slots={slots} />
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-bark-900 mb-6">
                  Prodotti disponibili{' '}
                  <span className="text-bark-400 text-lg font-sans font-normal">({products.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Info card */}
            <div className="card p-6">
              <div className="space-y-3 text-sm font-sans text-bark-600 mb-5">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-vintage-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="capitalize text-bark-900 font-medium">{formattedDate}</p>
                    {event.endDate && event.endDate !== event.date && (
                      <p className="text-bark-400 text-xs">
                        fino al {new Date(event.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-vintage-600 shrink-0" />
                  <span>{event.timeStart} – {event.timeEnd}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-vintage-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-bark-900 font-medium">{event.address}</p>
                    <p className="text-bark-400">{event.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-vintage-600 shrink-0" />
                  <span><strong className="text-bark-900">{event.productsCount}</strong> prodotti disponibili</span>
                </div>
                {isPrivate && event.slotMaxCapacity && (
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-vintage-600 shrink-0" />
                    <span>Max <strong className="text-bark-900">{event.slotMaxCapacity}</strong> persone per fascia</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              {event.status !== 'completed' && (
                isPrivate && slots.length > 0 ? (
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      document.querySelector('[data-calendar]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    🗓 Scegli il tuo orario
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      if (!state.user) { openAuth('login'); return; }
                      notify('Posto prenotato! Riceverai una conferma via email.');
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    Prenota il tuo posto
                  </button>
                )
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={() => notify('Link copiato!', 'info')} className="flex-1 btn-ghost justify-center text-xs">
                  <Share2 size={14} /> Condividi
                </button>
                <button onClick={() => notify('Evento salvato!', 'info')} className="flex-1 btn-ghost justify-center text-xs">
                  <Heart size={14} /> Salva
                </button>
              </div>
            </div>

            {/* Seller card */}
            {seller && (
              <div className="card p-6">
                <h3 className="font-serif text-bark-900 mb-4">Organizzato da</h3>
                <Link to={`/venditore/${seller.id}`} className="flex items-center gap-3 group mb-4">
                  <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-cream-200 group-hover:ring-vintage-300 transition-all" />
                  <div>
                    <p className="font-medium text-bark-900 group-hover:text-vintage-700 transition-colors">{seller.name}</p>
                    <p className="text-xs text-bark-400 font-sans">{seller.city}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < Math.floor(seller.rating) ? 'text-amber-400 fill-amber-400' : 'text-cream-300'} />
                  ))}
                  <span className="text-sm font-medium text-bark-700 font-sans ml-1">{seller.rating}</span>
                  <span className="text-xs text-bark-400 font-sans">({seller.reviewCount})</span>
                </div>
                <p className="text-xs text-bark-500 font-sans leading-relaxed line-clamp-3 mb-4">{seller.bio}</p>
                <Link to={`/venditore/${seller.id}`} className="btn-secondary w-full justify-center text-xs">
                  Vedi profilo venditore
                </Link>
              </div>
            )}

            {/* Slot availability mini-summary */}
            {isPrivate && slots.length > 0 && (
              <div className="card p-5">
                <h3 className="font-serif text-bark-900 mb-4">Disponibilità rapida</h3>
                <div className="space-y-2">
                  {slots.slice(0, 6).map(slot => {
                    const pct  = (slot.bookings.length / slot.maxCapacity) * 100;
                    const free = slot.maxCapacity - slot.bookings.length;
                    const full = free === 0;
                    const mine = state.user && slot.bookings.some(b => b.userId === state.user!.id);
                    return (
                      <div key={slot.id} className="flex items-center gap-3">
                        <span className="text-xs font-sans text-bark-500 w-24 shrink-0">{slot.startTime}–{slot.endTime}</span>
                        <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${full ? 'bg-red-400' : mine ? 'bg-blue-400' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-sans shrink-0 ${full ? 'text-red-500' : mine ? 'text-blue-600 font-medium' : 'text-bark-400'}`}>
                          {mine ? '✓' : full ? 'Pieno' : `${free} lib.`}
                        </span>
                      </div>
                    );
                  })}
                  {slots.length > 6 && (
                    <p className="text-xs text-bark-400 font-sans text-center pt-1">
                      +{slots.length - 6} fasce orarie nel calendario
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
