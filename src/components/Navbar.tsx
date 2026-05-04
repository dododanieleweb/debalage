import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Search, User, LogOut, LayoutDashboard, ChevronDown, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { state, logout, openAuth, cartCount } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/prodotti?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/eventi', label: 'Casa & Eventi' },
    { to: '/prodotti', label: 'Prodotti' },
    { to: '/venditori', label: 'Venditori' },
    { to: '/come-funziona', label: 'Come funziona' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif text-xl font-semibold text-bark-900 group-hover:text-vintage-600 transition-colors">
                Debalage
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.to)
                      ? 'text-bark-900 bg-cream-100'
                      : 'text-bark-600 hover:text-bark-900 hover:bg-cream-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-bark-600 hover:text-bark-900 hover:bg-cream-100 transition-colors"
                aria-label="Cerca"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 rounded-full text-bark-600 hover:text-bark-900 hover:bg-cream-100 transition-colors"
                aria-label="Lista desideri"
              >
                <Heart size={20} />
                {state.wishlist.length > 0 && (
                  <span className="absolute -mt-5 ml-3 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {state.wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/carrello"
                className="relative p-2 rounded-full text-bark-600 hover:text-bark-900 hover:bg-cream-100 transition-colors"
                aria-label="Carrello"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-bark-800 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {state.user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-cream-100 transition-colors"
                  >
                    <img
                      src={state.user.avatar}
                      alt={state.user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="hidden sm:block text-sm font-medium text-bark-800">
                      {state.user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-bark-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-cream-200 py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-cream-100 mb-1">
                        <p className="text-sm font-medium text-bark-900">{state.user.name}</p>
                        <p className="text-xs text-bark-400">{state.user.city}</p>
                      </div>
                      {(state.user.role === 'seller' || state.user.role === 'both') && (
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-bark-700 hover:bg-cream-50 transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard venditore
                        </Link>
                      )}
                      <Link
                        to="/ordini"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-bark-700 hover:bg-cream-50 transition-colors"
                      >
                        <Package size={16} />
                        I miei ordini
                        {state.orders.filter(o => o.userId === state.user!.id).length > 0 && (
                          <span className="ml-auto w-5 h-5 bg-bark-100 text-bark-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                            {state.orders.filter(o => o.userId === state.user!.id).length}
                          </span>
                        )}
                      </Link>
                      <Link
                        to={`/venditore/${state.user.id}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-bark-700 hover:bg-cream-50 transition-colors"
                      >
                        <User size={16} />
                        Il mio profilo
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-bark-700 hover:bg-cream-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Esci
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="hidden sm:flex btn-primary !py-2 !px-4 !text-xs"
                >
                  Accedi
                </button>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full text-bark-600 hover:bg-cream-100 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-cream-200 py-4 px-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-bark-700 hover:bg-cream-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!state.user && (
              <div className="pt-2 border-t border-cream-100 flex gap-2">
                <button onClick={() => openAuth('login')} className="btn-primary flex-1 justify-center">
                  Accedi
                </button>
                <button onClick={() => openAuth('register')} className="btn-secondary flex-1 justify-center">
                  Registrati
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-bark-900/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search size={20} className="text-bark-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotti, marchi, categorie..."
                className="flex-1 text-bark-900 text-lg placeholder-bark-300 outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-bark-400 hover:text-bark-700"
              >
                <X size={20} />
              </button>
            </form>
            <div className="mt-3 pt-3 border-t border-cream-100 flex flex-wrap gap-2">
              {['Abbigliamento anni \'60', 'Mobili design', 'Vinili', 'Gioielli vintage', 'Ceramiche'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); }}
                  className="px-3 py-1 bg-cream-100 text-bark-600 rounded-full text-xs hover:bg-cream-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click-away for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
