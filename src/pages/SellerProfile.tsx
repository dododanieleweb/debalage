import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Package, Shield, MessageCircle } from 'lucide-react';
import { REVIEWS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import EventCard from '../components/EventCard';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const { state, openAuth, notify } = useApp();
  const [tab, setTab] = useState<'products' | 'events' | 'reviews'>('products');

  const seller = state.users.find(u => u.id === id);
  if (!seller) return (
    <div className="pt-32 text-center min-h-screen">
      <p className="text-bark-400 font-sans">Venditore non trovato.</p>
    </div>
  );

  const sellerProducts = state.products.filter(p => p.sellerId === seller.id && p.status === 'available');
  const sellerEvents   = state.events.filter(e => e.sellerId === seller.id);
  const sellerReviews  = REVIEWS.filter(r => r.targetId === seller.id);

  const joinedDate = new Date(seller.joinedAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const handleMessage = () => {
    if (!state.user) { openAuth('login'); return; }
    notify(`Messaggio inviato a ${seller.name}`, 'info');
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Cover + Profile */}
      <div className="bg-gradient-to-br from-bark-800 to-bark-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-bark-700"
              />
              {seller.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-vintage-600 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
                  ✓
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-serif text-3xl text-cream-50">{seller.name}</h1>
                {seller.verified && (
                  <span className="flex items-center gap-1 badge bg-vintage-600/20 border border-vintage-500/30 text-vintage-300">
                    <Shield size={12} /> Verificato
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-cream-300 font-sans mb-3">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{seller.city}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} />Membro da {joinedDate}</span>
                <span className="flex items-center gap-1.5"><Package size={14} />{seller.salesCount} vendite</span>
              </div>

              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(seller.rating) ? 'text-amber-400 fill-amber-400' : 'text-bark-600'} />
                ))}
                <span className="text-cream-100 font-medium font-sans">{seller.rating}</span>
                <span className="text-cream-400 text-sm font-sans">({seller.reviewCount} recensioni)</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <button onClick={handleMessage} className="btn-secondary !border-white/30 !text-cream-100 hover:!bg-white/10">
                <MessageCircle size={16} /> Scrivi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-serif text-bark-900 mb-3">Chi sono</h3>
              <p className="text-sm text-bark-500 font-sans leading-relaxed">{seller.bio}</p>
            </div>
            <div className="card p-5">
              <h3 className="font-serif text-bark-900 mb-3">Specialità</h3>
              <div className="flex flex-wrap gap-2">
                {seller.specialties.map(s => (
                  <span key={s} className="badge bg-vintage-50 text-vintage-700 border border-vintage-200">{s}</span>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-serif text-bark-900 mb-3">Statistiche</h3>
              <div className="space-y-3">
                {[
                  { label: 'Prodotti attivi', value: sellerProducts.length },
                  { label: 'Vendite totali', value: seller.salesCount },
                  { label: 'Eventi organizzati', value: sellerEvents.length },
                  { label: 'Recensioni', value: seller.reviewCount },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-xs text-bark-500 font-sans">{stat.label}</span>
                    <span className="font-serif text-bark-900 font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 bg-cream-100 rounded-2xl p-1.5 mb-8 w-fit">
              {([
                { key: 'products', label: `Prodotti (${sellerProducts.length})` },
                { key: 'events', label: `Eventi (${sellerEvents.length})` },
                { key: 'reviews', label: `Recensioni (${sellerReviews.length})` },
              ] as const).map(tab_ => (
                <button
                  key={tab_.key}
                  onClick={() => setTab(tab_.key)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium font-sans transition-all ${tab === tab_.key ? 'bg-white shadow text-bark-900' : 'text-bark-500 hover:text-bark-700'}`}
                >
                  {tab_.label}
                </button>
              ))}
            </div>

            {tab === 'products' && (
              sellerProducts.length === 0 ? (
                <p className="text-bark-400 font-sans text-center py-12">Nessun prodotto disponibile al momento.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sellerProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )
            )}

            {tab === 'events' && (
              sellerEvents.length === 0 ? (
                <p className="text-bark-400 font-sans text-center py-12">Nessun evento organizzato.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {sellerEvents.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              )
            )}

            {tab === 'reviews' && (
              <div className="space-y-4">
                {sellerReviews.length === 0 ? (
                  <p className="text-bark-400 font-sans text-center py-12">Nessuna recensione ancora.</p>
                ) : (
                  sellerReviews.map(review => (
                    <div key={review.id} className="card p-5">
                      <div className="flex items-start gap-4">
                        <img src={review.authorAvatar} alt={review.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-bark-900 text-sm font-sans">{review.authorName}</span>
                            <span className="text-bark-300 text-xs">·</span>
                            <span className="text-xs text-bark-400 font-sans">{new Date(review.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-cream-300'} />
                            ))}
                          </div>
                          <p className="text-sm text-bark-600 font-sans leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
