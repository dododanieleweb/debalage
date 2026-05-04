import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';
import { CONDITIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface Props {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: Props) {
  const { state, toggleWishlist, addToCart, notify, openAuth } = useApp();
  const isWishlisted = state.wishlist.includes(product.id);
  const seller = state.users.find(u => u.id === product.sellerId);
  const condition = CONDITIONS[product.condition];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!state.user) { openAuth('login'); return; }
    toggleWishlist(product.id);
    notify(isWishlisted ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti', 'info');
  };

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.status !== 'available') return;
    addToCart(product);
    notify(`"${product.title}" aggiunto al carrello`);
  };

  return (
    <Link to={`/prodotto/${product.id}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className={`relative overflow-hidden bg-cream-100 ${compact ? 'h-44' : 'h-64'}`}>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-bark-900/0 group-hover:bg-bark-900/10 transition-colors duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.status === 'sold' && (
              <span className="badge bg-bark-800 text-cream-50">Venduto</span>
            )}
            {product.status === 'reserved' && (
              <span className="badge bg-amber-600 text-white">Riservato</span>
            )}
            {product.featured && product.status === 'available' && (
              <span className="badge bg-vintage-600 text-white">In evidenza</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all ${
              isWishlisted
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/90 text-bark-500 hover:text-rose-500 hover:scale-110'
            }`}
          >
            <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Add to cart — visible on hover */}
          {product.status === 'available' && (
            <button
              onClick={handleCart}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-bark-800 text-cream-50 flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
            >
              <ShoppingBag size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Condition badge */}
          <span className={`badge ${condition.color} mb-2`}>
            {condition.label}
          </span>

          <h3 className={`font-serif text-bark-900 leading-snug mb-1 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {product.title}
          </h3>

          {product.era && (
            <p className="text-xs text-bark-400 font-sans mb-2">{product.era} · {product.category}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className={`font-serif font-semibold text-bark-900 ${compact ? 'text-base' : 'text-xl'}`}>
                €{product.price.toLocaleString('it-IT')}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-xs text-bark-400 line-through font-sans">
                  €{product.originalPrice.toLocaleString('it-IT')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-bark-300 text-xs font-sans">
              <Eye size={12} />
              <span>{product.views}</span>
            </div>
          </div>

          {!compact && seller && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream-100">
              <img src={seller.avatar} alt={seller.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs text-bark-500 font-sans">{seller.name}</span>
              {seller.verified && (
                <span className="text-[10px] text-vintage-600 font-medium">✓ Verificato</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
