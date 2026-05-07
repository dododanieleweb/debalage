import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Store, Euro, Save, TrendingUp,
  Calendar, CheckCircle2, Clock, XCircle, Shield, Search, ChevronUp, ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type SortKey = 'name' | 'role' | 'city' | 'joinedAt';
type RoleFilter = 'all' | 'buyer' | 'seller' | 'both' | 'admin';

const ROLE_LABELS: Record<string, string> = {
  buyer:  'Acquirente',
  seller: 'Venditore',
  both:   'Entrambi',
  admin:  'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  buyer:  'bg-sky-100 text-sky-700',
  seller: 'bg-emerald-100 text-emerald-700',
  both:   'bg-violet-100 text-violet-700',
  admin:  'bg-rose-100 text-rose-700',
};

export default function AdminDashboard() {
  const { state, updateEventFee, notify } = useApp();

  // Guard: only admin can access
  if (!state.loading && (!state.user || state.user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  // ── Fee form ────────────────────────────────────────────────────────────────
  const [feeInput, setFeeInput]   = useState<string>(String(state.eventFee));
  const [feeSaving, setFeeSaving] = useState(false);

  const handleSaveFee = async () => {
    const parsed = parseFloat(feeInput.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) return;
    setFeeSaving(true);
    await updateEventFee(parsed);
    notify('Quota evento aggiornata', 'success');
    setFeeSaving(false);
  };

  // ── User stats ──────────────────────────────────────────────────────────────
  const allUsers = state.users;
  const buyers   = allUsers.filter(u => u.role === 'buyer');
  const sellers  = allUsers.filter(u => u.role === 'seller');
  const both     = allUsers.filter(u => u.role === 'both');
  const admins   = allUsers.filter(u => u.role === 'admin');
  const verified = allUsers.filter(u => u.verified);

  // ── Event stats ─────────────────────────────────────────────────────────────
  const upcoming  = state.events.filter(e => e.status === 'upcoming').length;
  const ongoing   = state.events.filter(e => e.status === 'ongoing').length;
  const completed = state.events.filter(e => e.status === 'completed').length;

  // ── User table ──────────────────────────────────────────────────────────────
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortKey, setSortKey]       = useState<SortKey>('joinedAt');
  const [sortAsc, setSortAsc]       = useState(false);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return [...allUsers]
      .filter(u => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.city.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let va: string, vb: string;
        if (sortKey === 'name')     { va = a.name;     vb = b.name; }
        else if (sortKey === 'role'){ va = a.role;     vb = b.role; }
        else if (sortKey === 'city'){ va = a.city;     vb = b.city; }
        else                        { va = a.joinedAt; vb = b.joinedAt; }
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [allUsers, search, roleFilter, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
      : <ChevronDown size={13} className="opacity-30" />;

  return (
    <div className="pt-16 min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-bark-900 text-cream-50 pt-12 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-vintage-300" />
            <p className="text-xs font-sans uppercase tracking-widest text-vintage-300">Pannello riservato</p>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-2">Dashboard Amministratore</h1>
          <p className="text-cream-400 font-sans text-sm">
            Gestisci quote, utenti ed eventi della piattaforma
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* ── 1. Quota evento ─────────────────────────────────────────────── */}
        <section>
          <h2 className="font-serif text-2xl text-bark-900 mb-5 flex items-center gap-2">
            <Euro size={22} className="text-vintage-600" /> Quota pubblicazione evento
          </h2>
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex-1">
              <label className="block text-xs font-medium text-bark-600 font-sans mb-1.5 uppercase tracking-wide">
                Importo quota (€) — pagato dal venditore per ogni evento pubblicato
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400 font-serif text-lg">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={feeInput}
                  onChange={e => setFeeInput(e.target.value)}
                  className="input pl-8 text-lg font-serif max-w-xs"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-bark-400 font-sans mt-2">
                Quota corrente salvata: <strong className="text-bark-700">€{state.eventFee.toFixed(2)}</strong>
                {state.eventFee === 0 && <span className="ml-2 text-amber-600">• Gratuito al momento</span>}
              </p>
            </div>
            <button
              onClick={handleSaveFee}
              disabled={feeSaving}
              className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {feeSaving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvataggio…</>
                : <><Save size={16} />Salva quota</>
              }
            </button>
          </div>
        </section>

        {/* ── 2. Stats utenti ─────────────────────────────────────────────── */}
        <section>
          <h2 className="font-serif text-2xl text-bark-900 mb-5 flex items-center gap-2">
            <Users size={22} className="text-vintage-600" /> Utenti registrati
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Totale',      value: allUsers.length,  icon: <Users size={18} />,        color: 'bg-bark-800 text-cream-50' },
              { label: 'Acquirenti',  value: buyers.length,    icon: <ShoppingBag size={18} />,   color: 'bg-sky-50 text-sky-700 border border-sky-200' },
              { label: 'Venditori',   value: sellers.length,   icon: <Store size={18} />,         color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
              { label: 'Entrambi',    value: both.length,      icon: <TrendingUp size={18} />,    color: 'bg-violet-50 text-violet-700 border border-violet-200' },
              { label: 'Verificati',  value: verified.length,  icon: <CheckCircle2 size={18} />,  color: 'bg-vintage-50 text-vintage-700 border border-vintage-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                <div className="flex items-center justify-between mb-3 opacity-70">{s.icon}</div>
                <div className="font-serif text-3xl font-semibold">{s.value}</div>
                <div className="text-xs font-sans mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
          {admins.length > 0 && (
            <p className="mt-3 text-xs text-bark-400 font-sans">
              + {admins.length} amministratore{admins.length > 1 ? 'i' : ''} ({admins.map(a => a.name).join(', ')})
            </p>
          )}
        </section>

        {/* ── 3. Stats eventi ─────────────────────────────────────────────── */}
        <section>
          <h2 className="font-serif text-2xl text-bark-900 mb-5 flex items-center gap-2">
            <Calendar size={22} className="text-vintage-600" /> Panoramica eventi
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'In programma', value: upcoming,  icon: <Clock size={18} />,       color: 'bg-amber-50 text-amber-700 border border-amber-200' },
              { label: 'In corso',     value: ongoing,   icon: <TrendingUp size={18} />,   color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
              { label: 'Conclusi',     value: completed, icon: <XCircle size={18} />,      color: 'bg-cream-100 text-bark-500 border border-cream-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                <div className="opacity-70 mb-3">{s.icon}</div>
                <div className="font-serif text-3xl font-semibold">{s.value}</div>
                <div className="text-xs font-sans mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Lista utenti ─────────────────────────────────────────────── */}
        <section>
          <h2 className="font-serif text-2xl text-bark-900 mb-5 flex items-center gap-2">
            <Users size={22} className="text-vintage-600" /> Tutti gli utenti
            <span className="font-sans text-sm text-bark-400 font-normal">({filteredUsers.length})</span>
          </h2>

          {/* Filtri */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca per nome, email, città..."
                className="input pl-9 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'buyer', 'seller', 'both', 'admin'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
                    roleFilter === r
                      ? 'bg-bark-800 text-cream-50'
                      : 'bg-white border border-cream-200 text-bark-600 hover:border-bark-400'
                  }`}
                >
                  {r === 'all' ? 'Tutti' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Tabella */}
          <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-100 bg-cream-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-bark-500 font-sans uppercase tracking-wide">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-bark-800">
                        Utente <SortIcon k="name" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-bark-500 font-sans uppercase tracking-wide hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-bark-500 font-sans uppercase tracking-wide">
                      <button onClick={() => handleSort('role')} className="flex items-center gap-1 hover:text-bark-800">
                        Ruolo <SortIcon k="role" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-bark-500 font-sans uppercase tracking-wide hidden md:table-cell">
                      <button onClick={() => handleSort('city')} className="flex items-center gap-1 hover:text-bark-800">
                        Città <SortIcon k="city" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-bark-500 font-sans uppercase tracking-wide hidden lg:table-cell">
                      <button onClick={() => handleSort('joinedAt')} className="flex items-center gap-1 hover:text-bark-800">
                        Iscritto il <SortIcon k="joinedAt" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-bark-400 font-sans text-sm">
                        Nessun utente trovato
                      </td>
                    </tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-bark-900 font-sans">
                              {user.name}
                              {user.verified && (
                                <span className="ml-1.5 text-[10px] text-vintage-600">✓</span>
                              )}
                            </p>
                            <p className="text-xs text-bark-400 font-sans sm:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-bark-500 font-sans hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold font-sans ${ROLE_COLORS[user.role] ?? 'bg-cream-100 text-bark-600'}`}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-bark-500 font-sans hidden md:table-cell">
                        {user.city || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-bark-400 font-sans hidden lg:table-cell">
                        {user.joinedAt
                          ? new Date(user.joinedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Nota impostazione admin ─────────────────────────────────────── */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide font-sans mb-1">Come impostare un utente come Admin</p>
          <p className="text-sm text-amber-800 font-sans">
            Vai su <strong>Supabase → Table Editor → profiles</strong>, trova l'utente e modifica il campo <code className="bg-amber-100 px-1 rounded">role</code> impostandolo a <code className="bg-amber-100 px-1 rounded">admin</code>.
            L'utente dovrà poi fare log out e log in per vedere il pannello.
          </p>
        </section>

      </div>
    </div>
  );
}
