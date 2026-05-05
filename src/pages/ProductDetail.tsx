import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Share2, Star, MapPin, ArrowLeft, Check, Package, Ruler, Palette, Tag } from 'lucide-react';
import { CONDITIONS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, addToCart, toggleWishlist, openAuth, notify } = useApp();
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = state.products.find(p => p.id === id);
  if (!product) return (
    <div className="pt-32 text-center min-h-screen">
      <p className="text-bark-400 font-sans">Prodotto non trovato.</p>
      <Link to="/prodotti" className="btn-primary mt-4">Torna ai prodotti</Link>
    </div>
  );

  const seller = state.users.find(u => u.id === product.sellerId);
  const event = product.eventId ? state.events.find(e => e.id === product.eventId) : null;
  const isWishlisted = state.wishlist.includes(product.id);
  const condition = CONDITIONS[product.condition];
  const relatedProducts = state.products.filter(p => p.id !== product.id && p.category === product.category && p.status === 'available').slice(0, 4);

  const handleAddToCart = () => {
    if (product.status !== 'available') return;
    addToCart(product);
    setAddedToCart(true);
    notify(`"${product.title}" aggiunto al carrello`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (!state.user) { openAuth('login'); return; }
    toggleWishlist(product.id);
    notify(isWishlisted ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti', 'info');
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-bark-400 font-sans mb-8">
          <Link to="/prodotti" className="hover:text-bark-700 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Prodotti
          </Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-bark-700 truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-cream-100">
              <img
                src={product.images[activeImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden bg-cream-100 border-2 transition-all ${activeImage === i ? 'border-vintage-500' : 'border-transparent hover:border-cream-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`badge ${condition.color}`}>{condition.label}</span>
              {product.era && <span className="badge bg-cream-100 text-bark-600">{product.era}</span>}
              {product.featured && <span className="badge bg-vintage-100 text-vintage-700">In evidenza</span>}
              {product.status === 'reserved' && <span className="badge bg-amber-100 text-amber-700">Riservato</span>}
              {product.status === 'sold' && <span className="badge bg-bark-100 text-bark-600">Venduto</span>}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-bark-900 leading-tight mb-3">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-4xl text-bark-900 font-semibold">
                €{product.price.toLocaleString('it-IT')}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-bark-400 text-xl line-through font-sans">
                    €{product.originalPrice.toLocaleString('it-IT')}
                  </span>
                  <span className="badge bg-rose-100 text-rose-700">
                    -{Math.round(100 - (product.price / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.status !== 'available' || addedToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-sans font-medium text-sm transition-all duration-200 ${
                  addedToCart
                    ? 'bg-emerald-500 text-white'
                    : product.status !== 'available'
                    ? 'bg-cream-200 text-bark-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {addedToCart ? <><Check size={18} /> Aggiunto!</> : <><ShoppingBag size={18} /> Aggiungi al carrello</>}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'border-cream-300 text-bark-400 hover:border-rose-300 hover:text-rose-500'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); notify('Link copiato!', 'info'); }}
                className="w-14 h-14 rounded-full border-2 border-cream-300 text-bark-400 flex items-center justify-center hover:border-bark-400 hover:text-bark-700 transition-all"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Details */}
            <div className="bg-cream-50 rounded-2xl p-5 space-y-3 mb-6">
              <h3 className="font-serif text-bark-900 font-medium mb-3">Dettagli</h3>
              {product.brand && (
                <div className="flex items-center gap-3 text-sm font-sans">
                  <Tag size={15} className="text-vintage-500" />
                  <span className="text-bark-500">Marca / Designer:</span>
                  <span className="text-bark-800 font-medium">{product.brand}</span>
                </div>
              )}
              {product.material && (
                <div className="flex items-center gap-3 text-sm font-sans">
                  <Palette size={15} className="text-vintage-500" />
                  <span className="text-bark-500">Materiale:</span>
                  <span className="text-bark-800">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-3 text-sm font-sans">
                  <Ruler size={15} className="text-vintage-500" />
                  <span className="text-bark-500">Dimensioni:</span>
                  <span className="text-bark-800">{product.dimensions}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm font-sans">
                <Package size={15} className="text-vintage-500" />
                <span className="text-bark-500">Categoria:</span>
                <span className="text-bark-800">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-serif text-bark-900 font-medium mb-3">Descrizione</h3>
              <p className="text-sm text-bark-600 font-sans leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-cream-100 text-bark-500">#{tag}</span>
              ))}
            </div>

            {/* Event link */}
            {event && (
              <Link to={`/evento/${event.id}`} className="flex items-center gap-3 p-4 bg-vintage-50 border border-vintage-200 rounded-2xl mb-6 hover:bg-vintage-100 transition-colors">
                <span className="text-2xl">🏠</span>
                <div>
                  <p className="text-xs text-vintage-600 font-sans uppercase tracking-wide mb-0.5">Disponibile all'evento</p>
                  <p className="font-serif text-bark-900">{event.title}</p>
                  <p className="text-xs text-bark-400 font-sans">{new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} · {event.city}</p>
                </div>
              </Link>
            )}

            {/* Seller */}
            {seller && (
              <Link to={`/venditore/${seller.id}`} className="flex items-center gap-4 p-4 bg-white border border-cream-200 rounded-2xl hover:border-vintage-300 transition-colors group">
                <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-bark-900 group-hover:text-vintage-700 transition-colors">{seller.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-bark-500 font-sans">{seller.rating} · {seller.city}</span>
                    {seller.verified && <span className="text-[10px] text-vintage-600 font-medium ml-1">✓ Verificato</span>}
                  </div>
                </div>
                <MapPin size={16} className="text-bark-300" />
              </Link>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-3xl text-bark-900 mb-8">Prodotti simili</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
