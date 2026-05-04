import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import SellerProfile from './pages/SellerProfile';
import Sellers from './pages/Sellers';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import ComeFunziona from './pages/ComeFunziona';
import Commissioni from './pages/Commissioni';
import GuideFotografiche from './pages/GuideFotografiche';
import Privacy from './pages/Privacy';
import Termini from './pages/Termini';
import Cookie from './pages/Cookie';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppShell() {
  const { state } = useApp();
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vintage-300 border-t-vintage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-lg text-bark-600">Caricamento…</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventi" element={<Events />} />
          <Route path="/evento/:id" element={<EventDetail />} />
          <Route path="/prodotti" element={<Products />} />
          <Route path="/prodotto/:id" element={<ProductDetail />} />
          <Route path="/venditori" element={<Sellers />} />
          <Route path="/venditore/:id" element={<SellerProfile />} />
          <Route path="/carrello" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ordini" element={<Orders />} />
          <Route path="/come-funziona" element={<ComeFunziona />} />
          <Route path="/commissioni" element={<Commissioni />} />
          <Route path="/guide-fotografiche" element={<GuideFotografiche />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/termini" element={<Termini />} />
          <Route path="/cookie" element={<Cookie />} />
          <Route path="*" element={
            <div className="pt-32 min-h-screen text-center">
              <p className="font-serif text-6xl text-cream-300 mb-4">404</p>
              <p className="text-bark-400 font-sans">Pagina non trovata.</p>
              <a href="/" className="btn-primary mt-6 inline-flex">Torna alla home</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
      <Notification />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
