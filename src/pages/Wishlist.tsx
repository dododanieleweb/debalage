import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';

export default function Wishlist() {
  const { state, openAuth } = useApp();
  const { wishlist, user } = state;

  if (!user) {
    return (
      <div className="pt-32 min-h-screen max-w-2xl mx-auto px-4 text-center">
        <div className="bg-cream-100 rounded-3xl p-12">
          <Heart size={64} className="text-rose-200 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-bark-900 mb-3">Accedi per vedere i preferiti</h2>
          <p className="text-bark-500 font-sans mb-8">Salva i pezzi che ti piacciono e ritrovali qui quando vuoi.</p>
          <button onClick={() => openAuth('login')} className="btn-primary">
            Accedi o registrati
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = state.products.filter(p => wishlist.includes(p.id));

  if (wishlisted.length === 0) {
    return (
      <div className="pt-32 min-h-screen max-w-2xl mx-auto px-4 text-center">
        <div className="bg-cream-100 rounded-3xl p-12">
          <Heart size={64} className="text-rose-200 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-bark-900 mb-3">Nessun preferito ancora</h2>
          <p className="text-bark-500 font-sans mb-8">
            Clicca il cuoricino su qualsiasi prodotto per salvarlo qui.
          </p>
          <Link to="/prodotti" className="btn-primary">
            Esplora i prodotti <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl text-bark-900">I tuoi preferiti</h1>
          <p className="text-bark-400 font-sans mt-1">{wishlisted.length} prodott{wishlisted.length === 1 ? 'o' : 'i'} salvati</p>
        </div>
        <Link to="/prodotti" className="btn-ghost hidden sm:flex">
          Continua a sfogliare <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlisted.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
