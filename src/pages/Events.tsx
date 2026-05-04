import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { EVENT_TYPES } from '../data/mockData';
import EventCard from '../components/EventCard';
import { EventType, EventStatus } from '../types';
import { useApp } from '../context/AppContext';

export default function Events() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cities = useMemo(
    () => [...new Set(state.events.map(e => e.city))].sort(),
    [state.events]
  );

  const filtered = useMemo(() => {
    return state.events.filter(e => {
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.city.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some(t => t.includes(search.toLowerCase()));
      const matchType   = typeFilter === 'all' || e.type === typeFilter;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchCity   = cityFilter === 'all' || e.city === cityFilter;
      return matchSearch && matchType && matchStatus && matchCity;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [state.events, search, typeFilter, statusFilter, cityFilter]);

  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all' || cityFilter !== 'all' || !!search;
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setCityFilter('all');
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-bark-900 text-cream-50 pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-300 mb-3">Dove trovarci</p>
          <h1 className="font-serif text-5xl mb-4">Case & Eventi</h1>
          <p className="text-cream-300 font-sans text-lg max-w-2xl">
            Vendite private in case, mercatini all'aperto, mostre mercato e pop-up shop in tutta Italia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca per città, tipo, parola chiave..."
              className="input pl-11"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`btn-secondary gap-2 ${filtersOpen ? 'bg-bark-800 text-cream-50 border-bark-800' : ''}`}
          >
            <SlidersHorizontal size={16} />
            Filtri
            {hasFilters && (
              <span className="w-5 h-5 bg-vintage-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-rose-500 hover:bg-rose-50">
              <X size={16} /> Cancella filtri
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Tipo evento</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`badge cursor-pointer ${typeFilter === 'all' ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                >
                  Tutti
                </button>
                {Object.entries(EVENT_TYPES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setTypeFilter(key as EventType)}
                    className={`badge cursor-pointer ${typeFilter === key ? 'bg-bark-800 text-cream-50' : `${val.color} hover:opacity-80`}`}
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Stato</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'upcoming', 'ongoing', 'completed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`badge cursor-pointer ${statusFilter === s ? 'bg-bark-800 text-cream-50' : 'bg-cream-200 text-bark-600 hover:bg-cream-300'}`}
                  >
                    {s === 'all' ? 'Tutti' : s === 'upcoming' ? 'In arrivo' : s === 'ongoing' ? 'In corso' : 'Conclusi'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Città</label>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">Tutte le città</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-bark-500 font-sans">
            {filtered.length} event{filtered.length === 1 ? 'o' : 'i'} trovati
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🗓️</p>
            <h3 className="font-serif text-2xl text-bark-700 mb-2">Nessun evento trovato</h3>
            <p className="text-bark-400 font-sans text-sm mb-6">Prova a modificare i filtri di ricerca.</p>
            <button onClick={clearFilters} className="btn-primary">Cancella filtri</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
