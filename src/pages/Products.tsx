import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { CATEGORIES, CONDITIONS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { ProductCondition } from '../types';
import { useApp } from '../context/AppContext';

const ERAS = ['1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s'];
const SORT_OPTIONS = [
  { value: 'recent', label: 'Più recenti' },
  { value: 'price_asc', label: 'Prezzo crescente' },
  { value: 'price_desc', label: 'Prezzo decrescente' },
  { value: 'popular', label: 'Più visti' },
];

export default function Products() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState<ProductCondition | 'all'>('all');
  const [era, setEra] = useState<string>('all');
  const [sort, setSort] = useState('recent');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = state.products.filter(p => p.status !== 'sold');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q)) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') {
      const cat = CATEGORIES.find(c => c.id === category);
      if (cat) {
        result = result.filter(p => p.category.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase()));
      }
    }

    if (condition !== 'all') result = result.filter(p => p.condition === condition);
    if (era !== 'all') result = result.filter(p => p.era === era);
    result = result.filter(p => p.price <= maxPrice);

    switch (sort) {
      case 'price_asc': return [...result].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...result].sort((a, b) => b.price - a.price);
      case 'popular': return [...result].sort((a, b) => b.views - a.views);
      default: return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [search, category, condition, era, sort, maxPrice]);

  const hasFilters = category !== 'all' || condition !== 'all' || era !== 'all' || search || maxPrice < 5000;

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setCondition('all');
    setEra('all');
    setMaxPrice(5000);
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-bark-900 text-cream-50 pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Sfoglia il catalogo</p>
          <h1 className="font-serif text-5xl mb-4">Tutti i prodotti</h1>
          <p className="text-cream-300 font-sans text-lg">
            {state.products.filter(p => p.status === 'available').length} pezzi disponibili da venditori selezionati
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca prodotti, marchi, categorie..."
              className="input pl-11"
            />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input appearance-none pr-9 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-bark-800 text-cream-50 border-bark-800' : ''}`}
          >
            <SlidersHorizontal size={16} />
            Filtri
          </button>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-rose-500 hover:bg-rose-50">
              <X size={16} /> Reset
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Categoria</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                <button
                  onClick={() => setCategory('all')}
                  className={`badge cursor-pointer whitespace-nowrap ${category === 'all' ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                >
                  Tutte
                </button>
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`badge cursor-pointer whitespace-nowrap ${category === c.id ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Condizione</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCondition('all')}
                  className={`badge cursor-pointer ${condition === 'all' ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                >
                  Tutte
                </button>
                {Object.entries(CONDITIONS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setCondition(key as ProductCondition)}
                    className={`badge cursor-pointer ${condition === key ? 'bg-bark-800 text-cream-50' : `${val.color} hover:opacity-80`}`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Era */}
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Epoca</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEra('all')}
                  className={`badge cursor-pointer ${era === 'all' ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                >
                  Tutte
                </button>
                {ERAS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEra(e)}
                    className={`badge cursor-pointer ${era === e ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">
                Prezzo massimo: <span className="text-bark-900">€{maxPrice.toLocaleString('it-IT')}</span>
              </label>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-vintage-600"
              />
              <div className="flex justify-between text-xs text-bark-400 font-sans mt-1">
                <span>€0</span>
                <span>€5.000</span>
              </div>
            </div>
          </div>
        )}

        {/* Category quick filter row */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          <button
            onClick={() => setCategory('all')}
            className={`badge cursor-pointer whitespace-nowrap px-4 py-2 ${category === 'all' ? 'bg-bark-800 text-cream-50' : 'bg-cream-100 text-bark-600 hover:bg-cream-200'}`}
          >
            Tutto
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`badge cursor-pointer whitespace-nowrap px-4 py-2 ${category === c.id ? 'bg-bark-800 text-cream-50' : 'bg-cream-100 text-bark-600 hover:bg-cream-200'}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-bark-500 font-sans mb-5">
          {filtered.length} prodott{filtered.length === 1 ? 'o' : 'i'} trovati
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-serif text-2xl text-bark-700 mb-2">Nessun prodotto trovato</h3>
            <p className="text-bark-400 font-sans text-sm mb-6">Prova a modificare la ricerca o i filtri.</p>
            <button onClick={clearFilters} className="btn-primary">Cancella filtri</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
