import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Package, Calendar, TrendingUp, Eye, Heart, Edit2, Trash2,
  Star, Users, Clock, Settings, ChevronDown, ChevronUp, Save,
  ShoppingBag, Banknote, CheckCircle2, XCircle, AlertCircle, RefreshCw,
} from 'lucide-react';
import { PendingFee } from '../types';
import EventCalendar from '../components/EventCalendar';
import ProductForm from '../components/ProductForm';
import EventForm from '../components/EventForm';
import { useApp } from '../context/AppContext';
import { Event, Product } from '../types';

// ── Appointments Panel ────────────────────────────────────────────────────────
function AppointmentsPanel({ event }: { event: Event }) {
  const { state, setSlotCapacity, toggleSlotDisabled, initEventSlots, notify } = useApp();
  const slots = state.slots[event.id] ?? [];
  const [expandSlotId, setExpandSlotId] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState<Record<string, number>>({});
  const [newCap, setNewCap] = useState(event.slotMaxCapacity ?? 3);
  const [startTime, setStartTime] = useState(event.timeStart);
  const [endTime, setEndTime] = useState(event.timeEnd);
  const [showConfig, setShowConfig] = useState(slots.length === 0);

  const totalBooked   = slots.reduce((s, sl) => s + sl.bookings.length, 0);
  const totalCapacity = slots.filter(s => !s.disabled).reduce((s, sl) => s + sl.maxCapacity, 0);

  const handleRegenerateSlots = () => {
    initEventSlots(event.id, startTime, endTime, newCap);
    setShowConfig(false);
    const count = (() => {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      return Math.max(0, Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / 30));
    })();
    notify(`${count} slot generati con capienza ${newCap}`, 'success');
  };

  const handleSaveCapacity = (slotId: string) => {
    const cap = editCapacity[slotId];
    if (cap && cap > 0) {
      setSlotCapacity(event.id, slotId, cap);
      setEditCapacity(prev => { const n = { ...prev }; delete n[slotId]; return n; });
      notify('Capienza aggiornata');
    }
  };

  return (
    <div className="space-y-5">
      {/* Config bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-50 border border-cream-200 rounded-2xl px-5 py-4">
        <div className="flex gap-6 text-sm font-sans">
          <span className="text-bark-500">{slots.length} <span className="text-bark-900 font-medium">slot totali</span></span>
          <span className="text-bark-500">{totalBooked} <span className="text-bark-900 font-medium">prenotazioni</span></span>
          <span className="text-bark-500">{totalCapacity - totalBooked} <span className="text-bark-900 font-medium">posti liberi</span></span>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className="btn-secondary !text-xs !py-2 gap-2">
          <Settings size={14} />
          {showConfig ? 'Chiudi config' : 'Configura orari'}
        </button>
      </div>

      {/* Configuration form */}
      {showConfig && (
        <div className="bg-vintage-50 border border-vintage-200 rounded-2xl p-5 space-y-4">
          <h4 className="font-serif text-bark-900">Configura gli slot</h4>
          <p className="text-xs text-bark-500 font-sans">
            Ogni slot dura <strong>30 minuti</strong>. Imposta l'orario di apertura, chiusura e il numero massimo di persone per ogni fascia.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans">Ora inizio</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans">Ora fine</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans">Persone per slot</label>
              <input type="number" min={1} max={20} value={newCap} onChange={e => setNewCap(Number(e.target.value))} className="input" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleRegenerateSlots} className="btn-primary !py-2 !text-sm">
              <Save size={15} /> Genera / Rigenera slot
            </button>
            <p className="text-xs text-bark-400 font-sans">
              Slot da generare: <strong>{Math.max(0, Math.floor((() => {
                const [sh, sm] = startTime.split(':').map(Number);
                const [eh, em] = endTime.split(':').map(Number);
                return ((eh * 60 + em) - (sh * 60 + sm)) / 30;
              })()))}</strong> da 30 min
            </p>
          </div>
        </div>
      )}

      {/* Slot list */}
      {slots.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-cream-300 rounded-2xl">
          <Clock size={40} className="text-cream-300 mx-auto mb-3" />
          <p className="font-serif text-bark-600 mb-1">Nessuno slot configurato</p>
          <p className="text-xs text-bark-400 font-sans mb-4">Usa il pannello di configurazione per generare le fasce orarie</p>
          <button onClick={() => setShowConfig(true)} className="btn-secondary !text-sm">
            <Settings size={15} /> Configura adesso
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map(slot => {
            const isExpanded = expandSlotId === slot.id;
            const isFull = slot.bookings.length >= slot.maxCapacity;
            const capEdit = editCapacity[slot.id] ?? slot.maxCapacity;

            return (
              <div key={slot.id} className={`border rounded-2xl overflow-hidden transition-all ${slot.disabled ? 'opacity-50 border-cream-200' : isFull ? 'border-red-200 bg-red-50/30' : 'border-cream-200 bg-white'}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-28 shrink-0">
                    <span className="font-serif text-bark-900">{slot.startTime}</span>
                    <span className="text-bark-400 font-sans text-xs"> – {slot.endTime}</span>
                  </div>
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isFull ? 'bg-red-400' : slot.bookings.length > 0 ? 'bg-amber-400' : 'bg-emerald-300'}`}
                          style={{ width: `${(slot.bookings.length / slot.maxCapacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-sans text-bark-500 shrink-0">{slot.bookings.length}/{slot.maxCapacity}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-1 shrink-0">
                    {slot.bookings.slice(0, 4).map(b => (
                      <img key={b.id} src={b.userAvatar} alt={b.userName} title={b.userName}
                        className="w-6 h-6 rounded-full ring-2 ring-white object-cover" />
                    ))}
                    {slot.bookings.length === 0 && (
                      <span className="text-xs text-bark-300 font-sans">Nessuno</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Users size={13} className="text-bark-400" />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={capEdit}
                      onChange={e => setEditCapacity(prev => ({ ...prev, [slot.id]: Number(e.target.value) }))}
                      className="w-12 text-center text-xs border border-cream-300 rounded-lg px-1 py-1 font-sans focus:outline-none focus:ring-1 focus:ring-vintage-400"
                    />
                    {editCapacity[slot.id] && editCapacity[slot.id] !== slot.maxCapacity && (
                      <button onClick={() => handleSaveCapacity(slot.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                        <Save size={14} />
                      </button>
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <span className="text-[10px] text-bark-400 font-sans">{slot.disabled ? 'Disab.' : 'Attivo'}</span>
                    <div
                      onClick={() => toggleSlotDisabled(event.id, slot.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${slot.disabled ? 'bg-cream-300' : 'bg-emerald-500'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${slot.disabled ? 'left-0.5' : 'left-4.5 translate-x-0.5'}`} />
                    </div>
                  </label>
                  <button
                    onClick={() => setExpandSlotId(isExpanded ? null : slot.id)}
                    className="text-bark-400 hover:text-bark-700 transition-colors shrink-0"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-cream-100 px-4 py-3 bg-cream-50/50">
                    {slot.bookings.length === 0 ? (
                      <p className="text-xs text-bark-400 font-sans text-center py-2">Nessuna prenotazione per questa fascia</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wide text-bark-400 font-sans mb-2">Persone prenotate</p>
                        {slot.bookings.map(b => (
                          <div key={b.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-cream-100">
                            <img src={b.userAvatar} alt={b.userName} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-bark-900 font-sans">{b.userName}</p>
                              <p className="text-xs text-bark-400 font-sans">{new Date(b.createdAt).toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state, openAuth, notify, deleteProduct, deleteEvent, refreshFees } = useApp();
  const { user } = state;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'events' | 'appointments' | 'orders' | 'fees'>('overview');
  const [feesRefreshing, setFeesRefreshing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form modals
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  const openAddProduct = () => { setEditingProduct(undefined); setShowProductForm(true); };
  const openEditProduct = (p: Product) => { setEditingProduct(p); setShowProductForm(true); };
  const openAddEvent = () => { setEditingEvent(undefined); setShowEventForm(true); };
  const openEditEvent = (e: Event) => { setEditingEvent(e); setShowEventForm(true); };

  const handleDeleteProduct = (productId: string, title: string) => {
    if (window.confirm(`Eliminare "${title}"? L'operazione è irreversibile.`)) {
      deleteProduct(productId);
      notify('Prodotto eliminato', 'info');
    }
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    if (window.confirm(`Eliminare l'evento "${title}"? L'operazione è irreversibile.`)) {
      deleteEvent(eventId);
      notify('Evento eliminato', 'info');
    }
  };

  if (!user) {
    return (
      <div className="pt-32 min-h-screen max-w-2xl mx-auto px-4 text-center">
        <div className="bg-cream-100 rounded-3xl p-12">
          <TrendingUp size={64} className="text-cream-400 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-bark-900 mb-3">Area venditori</h2>
          <p className="text-bark-500 font-sans mb-8">Accedi per gestire i tuoi prodotti ed eventi.</p>
          <button onClick={() => openAuth('login')} className="btn-primary">Accedi</button>
        </div>
      </div>
    );
  }

  const myProducts = state.products.filter(p => p.sellerId === user.id);
  const myEvents   = state.events.filter(e => e.sellerId === user.id);
  const privateEvents = myEvents.filter(e => e.type === 'casa_privata');
  const myOrders = state.orders.filter(o => o.userId === user.id);

  const totalViews = myProducts.reduce((s, p) => s + p.views, 0);
  const totalSaves = myProducts.reduce((s, p) => s + p.saves, 0);
  const availableCount = myProducts.filter(p => p.status === 'available').length;
  const soldCount      = myProducts.filter(p => p.status === 'sold').length;

  const totalBookings = privateEvents.reduce((sum, ev) => {
    const slots = state.slots[ev.id] ?? [];
    return sum + slots.reduce((s, sl) => s + sl.bookings.length, 0);
  }, 0);

  const stats = [
    { icon: <Package  size={20} className="text-blue-500"    />, label: 'Prodotti attivi',  value: availableCount, bg: 'bg-blue-50'    },
    { icon: <Calendar size={20} className="text-purple-500"  />, label: 'Eventi',            value: myEvents.length, bg: 'bg-purple-50' },
    { icon: <Users    size={20} className="text-vintage-600" />, label: 'Prenotazioni',      value: totalBookings,  bg: 'bg-vintage-50' },
    { icon: <Eye      size={20} className="text-amber-500"   />, label: 'Visualizzazioni',   value: totalViews,     bg: 'bg-amber-50'   },
    { icon: <Heart    size={20} className="text-rose-500"    />, label: 'Preferiti',         value: totalSaves,     bg: 'bg-rose-50'    },
    { icon: <Star     size={20} className="text-emerald-600" />, label: 'Valutazione',       value: user.rating,    bg: 'bg-emerald-50' },
  ];

  const myFees = state.pendingFees.filter(f => f.sellerId === user.id);
  const pendingFeesCount = myFees.filter(f => f.status === 'pending').length;

  const tabs = [
    { key: 'overview',      label: 'Panoramica' },
    { key: 'products',      label: `Prodotti (${myProducts.length})` },
    { key: 'events',        label: `Eventi (${myEvents.length})` },
    { key: 'appointments',  label: `Appuntamenti${totalBookings > 0 ? ` (${totalBookings})` : ''}` },
    { key: 'orders',        label: `Ordini${myOrders.length > 0 ? ` (${myOrders.length})` : ''}` },
    { key: 'fees',          label: `Quote${pendingFeesCount > 0 ? ` (${pendingFeesCount})` : ''}` },
  ] as const;

  const appointmentEvent = selectedEventId
    ? state.events.find(e => e.id === selectedEventId)
    : privateEvents[0] ?? myEvents[0];

  return (
    <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-sans uppercase tracking-widest text-vintage-600 mb-1">Dashboard</p>
          <h1 className="font-serif text-3xl text-bark-900">Ciao, {user.name.split(' ')[0]}!</h1>
          <p className="text-bark-400 font-sans text-sm mt-0.5">Gestisci i tuoi prodotti, eventi e appuntamenti</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openAddEvent} className="btn-secondary">
            <Calendar size={16} /> Nuovo evento
          </button>
          <button onClick={openAddProduct} className="btn-primary">
            <Plus size={16} /> Aggiungi prodotto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-100 rounded-2xl p-1.5 mb-8 overflow-x-auto scrollbar-hide w-fit max-w-full">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium font-sans transition-all whitespace-nowrap ${activeTab === t.key ? 'bg-white shadow text-bark-900' : 'text-bark-500 hover:text-bark-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="card p-5 text-center">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>{stat.icon}</div>
                <div className="font-serif text-2xl text-bark-900">{stat.value}</div>
                <div className="text-xs text-bark-400 font-sans mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Private events booking status */}
          {privateEvents.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl text-bark-900">Prenotazioni eventi privati</h2>
                <button onClick={() => setActiveTab('appointments')} className="btn-ghost text-xs">Gestisci</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {privateEvents.map(ev => {
                  const slots = state.slots[ev.id] ?? [];
                  const booked = slots.reduce((s, sl) => s + sl.bookings.length, 0);
                  const cap    = slots.filter(s => !s.disabled).reduce((s, sl) => s + sl.maxCapacity, 0);
                  return (
                    <div
                      key={ev.id}
                      className="card p-4 cursor-pointer hover:border-vintage-300"
                      onClick={() => { setSelectedEventId(ev.id); setActiveTab('appointments'); }}
                    >
                      <p className="font-serif text-bark-900 text-sm mb-1 line-clamp-1">{ev.title}</p>
                      <p className="text-xs text-bark-400 font-sans mb-3">
                        {new Date(ev.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
                          <div className="h-full bg-vintage-500 rounded-full" style={{ width: cap ? `${(booked / cap) * 100}%` : '0%' }} />
                        </div>
                        <span className="text-xs font-sans text-bark-500">{booked}/{cap}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent products */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-bark-900">Prodotti recenti</h2>
              <button onClick={() => setActiveTab('products')} className="btn-ghost text-xs">Vedi tutti</button>
            </div>
            {myProducts.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-bark-400 font-sans mb-4">Nessun prodotto ancora.</p>
                <button onClick={openAddProduct} className="btn-primary"><Plus size={16} /> Aggiungi</button>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream-50 border-b border-cream-200">
                      <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Prodotto</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Prezzo</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Stato</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide hidden sm:table-cell">Viste</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.slice(0, 5).map((p, i) => (
                      <tr key={p.id} className={`border-b border-cream-100 ${i % 2 === 0 ? '' : 'bg-cream-50/50'}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <Link to={`/prodotto/${p.id}`} className="text-sm font-medium text-bark-900 hover:text-vintage-700 line-clamp-2 max-w-[140px] sm:max-w-[180px]">{p.title}</Link>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-bark-500 font-sans hidden sm:table-cell">{p.category}</td>
                        <td className="px-5 py-4 font-serif text-bark-900 whitespace-nowrap">€{p.price.toLocaleString('it-IT')}</td>
                        <td className="px-5 py-4">
                          <span className={`badge ${p.status === 'available' ? 'bg-emerald-50 text-emerald-700' : p.status === 'reserved' ? 'bg-amber-50 text-amber-700' : 'bg-bark-100 text-bark-600'}`}>
                            {p.status === 'available' ? 'Disp.' : p.status === 'reserved' ? 'Ris.' : 'Vend.'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-bark-500 font-sans hidden sm:table-cell">{p.views}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEditProduct(p)} className="p-1.5 text-bark-400 hover:text-bark-700 hover:bg-cream-100 rounded-lg transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteProduct(p.id, p.title)} className="p-1.5 text-bark-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>

          {/* Recent orders */}
          {myOrders.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl text-bark-900">Ordini recenti</h2>
                <button onClick={() => setActiveTab('orders')} className="btn-ghost text-xs">Vedi tutti</button>
              </div>
              <div className="space-y-3">
                {myOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-sans text-xs text-bark-400">{order.id}</p>
                      <p className="font-serif text-bark-900">{order.items.length} articol{order.items.length === 1 ? 'o' : 'i'} — {order.address}, {order.city}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge border ${order.status === 'confermato' ? 'bg-blue-50 text-blue-700 border-blue-200' : order.status === 'consegnato' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {order.status}
                      </span>
                      <span className="font-serif text-bark-900">€{order.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Products ── */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-bark-500 font-sans text-sm">{myProducts.length} prodotti totali · {soldCount} venduti</p>
            <button onClick={openAddProduct} className="btn-primary"><Plus size={16} /> Aggiungi</button>
          </div>
          {myProducts.length === 0 ? (
            <div className="text-center py-16 card">
              <Package size={48} className="text-cream-300 mx-auto mb-4" />
              <p className="font-serif text-xl text-bark-700 mb-6">Nessun prodotto</p>
              <button onClick={openAddProduct} className="btn-primary"><Plus size={16} /> Aggiungi prodotto</button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Prodotto</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide hidden md:table-cell">Categoria</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide hidden lg:table-cell">Condizione</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Prezzo</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Stato</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide hidden sm:table-cell">Viste/Salv.</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-bark-500 font-sans uppercase tracking-wide">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {myProducts.map((p, i) => (
                    <tr key={p.id} className={`border-b border-cream-100 ${i % 2 === 0 ? '' : 'bg-cream-50/40'}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt={p.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0" />
                          <Link to={`/prodotto/${p.id}`} className="text-sm font-medium text-bark-900 hover:text-vintage-700 line-clamp-2 max-w-[130px] sm:max-w-[200px]">{p.title}</Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-bark-500 font-sans whitespace-nowrap hidden md:table-cell">{p.category}</td>
                      <td className="px-5 py-4 hidden lg:table-cell"><span className="badge bg-cream-100 text-bark-600 text-xs">{p.condition.replace('_', ' ')}</span></td>
                      <td className="px-5 py-4 font-serif text-bark-900 whitespace-nowrap">€{p.price.toLocaleString('it-IT')}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${p.status === 'available' ? 'bg-emerald-50 text-emerald-700' : p.status === 'reserved' ? 'bg-amber-50 text-amber-700' : 'bg-bark-100 text-bark-600'}`}>
                          {p.status === 'available' ? 'Disp.' : p.status === 'reserved' ? 'Ris.' : 'Vend.'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-bark-500 font-sans whitespace-nowrap hidden sm:table-cell">{p.views} / {p.saves}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEditProduct(p)} className="p-1.5 text-bark-400 hover:text-bark-700 hover:bg-cream-100 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteProduct(p.id, p.title)} className="p-1.5 text-bark-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Events ── */}
      {activeTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-bark-500 font-sans text-sm">{myEvents.length} eventi totali</p>
            <button onClick={openAddEvent} className="btn-primary"><Plus size={16} /> Nuovo evento</button>
          </div>
          {myEvents.length === 0 ? (
            <div className="text-center py-16 card">
              <Calendar size={48} className="text-cream-300 mx-auto mb-4" />
              <p className="font-serif text-xl text-bark-700 mb-6">Nessun evento</p>
              <button onClick={openAddEvent} className="btn-primary"><Plus size={16} /> Crea evento</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myEvents.map(e => (
                <div key={e.id} className="card overflow-hidden group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bark-900/60 to-transparent" />
                    <span className={`absolute top-3 right-3 badge ${e.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : e.status === 'ongoing' ? 'bg-emerald-500 text-white' : 'bg-bark-600/70 text-cream-200'}`}>
                      {e.status === 'upcoming' ? 'In arrivo' : e.status === 'ongoing' ? 'In corso' : 'Concluso'}
                    </span>
                    {e.type === 'casa_privata' && (
                      <span className="absolute top-3 left-3 badge bg-rose-100 text-rose-700">🏠 Privata</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-bark-900 mb-2 leading-snug line-clamp-2">{e.title}</h3>
                    <p className="text-xs text-bark-400 font-sans mb-3">
                      {new Date(e.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} · {e.city}
                    </p>
                    <div className="flex items-center justify-between text-xs text-bark-500 font-sans mb-4">
                      <span>{e.productsCount} prodotti</span>
                      {e.type === 'casa_privata' && (
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {(state.slots[e.id] ?? []).reduce((s, sl) => s + sl.bookings.length, 0)} prenotati
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/evento/${e.id}`} className="btn-secondary flex-1 justify-center !text-xs !py-2">Vedi</Link>
                      <button onClick={() => openEditEvent(e)} className="btn-ghost !py-2 !px-3 !text-xs">
                        <Edit2 size={13} />
                      </button>
                      {e.type === 'casa_privata' && (
                        <button
                          onClick={() => { setSelectedEventId(e.id); setActiveTab('appointments'); }}
                          className="btn-ghost flex-1 justify-center !text-xs !py-2"
                        >
                          <Calendar size={13} /> Slot
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(e.id, e.title)}
                        className="btn-ghost !py-2 !px-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 !text-xs"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Appointments ── */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {myEvents.filter(e => e.type === 'casa_privata').length === 0 ? (
            <div className="text-center py-16 card">
              <Clock size={48} className="text-cream-300 mx-auto mb-4" />
              <p className="font-serif text-xl text-bark-700 mb-2">Nessuna casa privata</p>
              <p className="text-bark-400 font-sans text-sm mb-6">
                Gli appuntamenti a slot sono disponibili per gli eventi di tipo "Casa Privata".
              </p>
              <button onClick={openAddEvent} className="btn-primary"><Plus size={16} /> Crea evento privato</button>
            </div>
          ) : (
            <>
              {myEvents.filter(e => e.type === 'casa_privata').length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {myEvents.filter(e => e.type === 'casa_privata').map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEventId(e.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans whitespace-nowrap transition-all border ${
                        (selectedEventId ?? myEvents.filter(ev => ev.type === 'casa_privata')[0]?.id) === e.id
                          ? 'bg-bark-800 text-cream-50 border-bark-800'
                          : 'border-cream-200 text-bark-600 hover:border-bark-400'
                      }`}
                    >
                      🏠 {e.title.length > 30 ? e.title.slice(0, 30) + '…' : e.title}
                    </button>
                  ))}
                </div>
              )}

              {appointmentEvent && (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-serif text-2xl text-bark-900">{appointmentEvent.title}</h2>
                      <p className="text-bark-400 font-sans text-sm mt-0.5">
                        {new Date(appointmentEvent.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{appointmentEvent.timeStart}–{appointmentEvent.timeEnd}
                        {' · '}{appointmentEvent.city}
                      </p>
                    </div>
                    <Link to={`/evento/${appointmentEvent.id}`} className="btn-ghost text-xs hidden sm:flex">
                      Vedi pagina evento
                    </Link>
                  </div>

                  <AppointmentsPanel event={appointmentEvent} />

                  {(state.slots[appointmentEvent.id] ?? []).length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-serif text-lg text-bark-900 mb-4">Anteprima vista acquirente</h3>
                      <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5">
                        <EventCalendar event={appointmentEvent} slots={state.slots[appointmentEvent.id] ?? []} readOnly />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Orders ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="text-center py-16 card">
              <ShoppingBag size={48} className="text-cream-300 mx-auto mb-4" />
              <p className="font-serif text-xl text-bark-700 mb-2">Nessun ordine</p>
              <p className="text-bark-400 font-sans text-sm mb-6">I tuoi ordini compariranno qui dopo l'acquisto.</p>
              <Link to="/prodotti" className="btn-primary inline-flex"><Plus size={16} /> Esplora prodotti</Link>
            </div>
          ) : (
            myOrders.map(order => (
              <div key={order.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-cream-50 border-b border-cream-200">
                  <div>
                    <p className="text-xs text-bark-400 font-sans">Ordine · {new Date(order.createdAt).toLocaleDateString('it-IT')}</p>
                    <p className="font-serif text-bark-900 font-medium">{order.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge border ${order.status === 'confermato' ? 'bg-blue-50 text-blue-700 border-blue-200' : order.status === 'consegnato' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {order.status}
                    </span>
                    <span className="font-serif text-bark-900 font-semibold">
                      €{order.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-4">
                  {order.items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-2">
                      <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="text-sm font-sans">
                        <p className="text-bark-900 line-clamp-1 max-w-[140px]">{product.title}</p>
                        <p className="text-bark-400 text-xs">×{quantity} · €{(product.price * quantity).toLocaleString('it-IT')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 bg-cream-50 border-t border-cream-100 text-xs font-sans text-bark-500">
                  📦 {order.address}, {order.city}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Fees ── */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Header con pulsante ricarica */}
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-bark-900">Le mie quote</h2>
            <button
              onClick={async () => {
                setFeesRefreshing(true);
                await refreshFees();
                setFeesRefreshing(false);
              }}
              disabled={feesRefreshing}
              className="flex items-center gap-2 text-sm text-bark-500 hover:text-bark-800 transition-colors disabled:opacity-50 font-sans"
            >
              <RefreshCw size={15} className={feesRefreshing ? 'animate-spin' : ''} />
              Aggiorna
            </button>
          </div>

          {/* Sommario */}
          {myFees.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Da pagare',
                  value: `€${myFees.filter(f=>f.status==='pending').reduce((s,f)=>s+f.amount,0).toFixed(2)}`,
                  sub: `${myFees.filter(f=>f.status==='pending').length} quote in attesa`,
                  color: 'bg-rose-50 border-rose-200 text-rose-800',
                },
                {
                  label: 'Già pagate',
                  value: `€${myFees.filter(f=>f.status==='paid').reduce((s,f)=>s+f.amount,0).toFixed(2)}`,
                  sub: `${myFees.filter(f=>f.status==='paid').length} quote pagate`,
                  color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                },
                {
                  label: 'Quote totali',
                  value: myFees.length,
                  sub: 'tutti gli stati',
                  color: 'bg-cream-100 border-cream-200 text-bark-700',
                },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
                  <p className="text-2xl font-serif font-semibold">{s.value}</p>
                  <p className="text-xs font-sans mt-0.5 opacity-70">{s.label} · {s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {myFees.length === 0 ? (
            <div className="text-center py-16 card">
              <Banknote size={48} className="text-cream-300 mx-auto mb-4" />
              <p className="font-serif text-xl text-bark-700 mb-2">Nessuna quota</p>
              <p className="text-bark-400 font-sans text-sm">
                Le quote per la pubblicazione di eventi e l'attivazione dell'evidenza appariranno qui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myFees.map(fee => {
                const FEE_TYPE_LABEL: Record<PendingFee['type'], string> = {
                  event_publish:   'Pubblicazione evento',
                  feature_event:   'Messa in evidenza — evento',
                  feature_product: 'Messa in evidenza — prodotto',
                };
                const FEE_STATUS: Record<PendingFee['status'], { label: string; color: string; icon: React.ReactNode }> = {
                  pending: { label: 'In attesa di pagamento', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <AlertCircle size={14} /> },
                  paid:    { label: 'Pagata',                color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <CheckCircle2 size={14} /> },
                  waived:  { label: 'Condonata',             color: 'bg-cream-100 border-cream-200 text-bark-500', icon: <XCircle size={14} /> },
                };
                const st = FEE_STATUS[fee.status];
                return (
                  <div key={fee.id} className={`border rounded-2xl p-4 sm:p-5 ${fee.status === 'pending' ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-cream-200'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-bark-900 font-sans">{FEE_TYPE_LABEL[fee.type]}</p>
                        <p className="text-xs text-bark-500 font-sans mt-0.5 truncate">{fee.referenceTitle}</p>
                        <p className="text-xs text-bark-400 font-sans mt-0.5">Creata il {fee.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="font-serif text-lg text-bark-900 font-semibold">€{fee.amount.toFixed(2)}</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-sans font-medium px-2.5 py-1 rounded-full border ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                      </div>
                    </div>
                    {fee.status === 'pending' && (
                      <div className="mt-3 pt-3 border-t border-amber-200/60">
                        <p className="text-xs text-amber-700 font-sans">
                          <strong>Come pagare:</strong> Il gestore della piattaforma ti contatterà via email o telefono per ricevere il pagamento di questa quota.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showProductForm && (
        <ProductForm
          initial={editingProduct}
          onClose={() => { setShowProductForm(false); setEditingProduct(undefined); }}
        />
      )}
      {showEventForm && (
        <EventForm
          initial={editingEvent}
          onClose={() => { setShowEventForm(false); setEditingEvent(undefined); }}
        />
      )}
    </div>
  );
}
