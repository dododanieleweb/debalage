import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Package, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sellers() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  const sellers = useMemo(
    () => state.users.filter(u => u.role === 'seller' || u.role === 'both'),
    [state.users]
  );
  const cities = useMemo(() => [...new Set(sellers.map(s => s.city))].sort(), [sellers]);

  const filtered = useMemo(() =>
    sellers.filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.specialties.some(sp => sp.toLowerCase().includes(search.toLowerCase())) || s.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter === 'all' || s.city === cityFilter;
      return matchSearch && matchCity;
    }),
    [sellers, search, cityFilter]
  );

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-bark-900 text-cream-50 pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">La nostra community</p>
          <h1 className="font-serif text-5xl mb-4">Venditori</h1>
          <p className="text-cream-300 font-sans text-lg">
            {sellers.length} venditori selezionati in tutta Italia
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca venditori, specialità..." className="input pl-11" />
          </div>
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input sm:w-48">
            <option value="all">Tutte le città</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(seller => (
            <Link key={seller.id} to={`/venditore/${seller.id}`} className="group">
              <div className="card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img src={seller.avatar} alt={seller.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cream-200 group-hover:ring-vintage-300 transition-all" />
                    {seller.verified && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-vintage-600 rounded-full flex items-center justify-center text-white text-[9px] shadow">✓</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-bark-900 text-lg group-hover:text-vintage-700 transition-colors">{seller.name}</h3>
                    <div className="flex items-center gap-1 text-bark-400 font-sans text-xs mt-0.5">
                      <MapPin size={12} />{seller.city}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium text-bark-700 font-sans">{seller.rating}</span>
                      <span className="text-xs text-bark-400 font-sans">({seller.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-bark-500 font-sans leading-relaxed line-clamp-2 mb-4">{seller.bio}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {seller.specialties.slice(0, 2).map(s => (
                      <span key={s} className="badge bg-cream-100 text-bark-500">{s}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-bark-400 font-sans">
                    <Package size={12} />{seller.salesCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-serif text-xl text-bark-600">Nessun venditore trovato</p>
          </div>
        )}
      </div>
    </div>
  );
}
