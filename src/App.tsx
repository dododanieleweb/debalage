import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';

// Home is eager-loaded — it's what the user sees first
import Home from './pages/Home';

// All other pages are lazy-loaded — downloaded only when navigated to
const Events          = lazy(() => import('./pages/Events'));
const EventDetail     = lazy(() => import('./pages/EventDetail'));
const Products        = lazy(() => import('./pages/Products'));
const ProductDetail   = lazy(() => import('./pages/ProductDetail'));
const SellerProfile   = lazy(() => import('./pages/SellerProfile'));
const Sellers         = lazy(() => import('./pages/Sellers'));
const Cart            = lazy(() => import('./pages/Cart'));
const Wishlist        = lazy(() => import('./pages/Wishlist'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Orders          = lazy(() => import('./pages/Orders'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const ComeFunziona    = lazy(() => import('./pages/ComeFunziona'));
const Commissioni     = lazy(() => import('./pages/Commissioni'));
const GuideFotografiche = lazy(() => import('./pages/GuideFotografiche'));
const Privacy         = lazy(() => import('./pages/Privacy'));
const Termini         = lazy(() => import('./pages/Termini'));
const Cookie          = lazy(() => import('./pages/Cookie'));

// Minimal inline fallback — avoids a full-screen spinner for page transitions
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-vintage-300 border-t-vintage-600 rounded-full animate-spin" />
    </div>
  );
}

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
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/eventi"        element={<Events />} />
            <Route path="/evento/:id"    element={<EventDetail />} />
            <Route path="/prodotti"      element={<Products />} />
            <Route path="/prodotto/:id"  element={<ProductDetail />} />
            <Route path="/venditori"     element={<Sellers />} />
            <Route path="/venditore/:id" element={<SellerProfile />} />
            <Route path="/carrello"      element={<Cart />} />
            <Route path="/wishlist"      element={<Wishlist />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/ordini"        element={<Orders />} />
            <Route path="/admin"         element={<AdminDashboard />} />
            <Route path="/come-funziona"     element={<ComeFunziona />} />
            <Route path="/commissioni"       element={<Commissioni />} />
            <Route path="/guide-fotografiche" element={<GuideFotografiche />} />
            <Route path="/privacy"       element={<Privacy />} />
            <Route path="/termini"       element={<Termini />} />
            <Route path="/cookie"        element={<Cookie />} />
            <Route path="*" element={
              <div className="pt-32 min-h-screen text-center">
                <p className="font-serif text-6xl text-cream-300 mb-4">404</p>
                <p className="text-bark-400 font-sans">Pagina non trovata.</p>
                <a href="/" className="btn-primary mt-6 inline-flex">Torna alla home</a>
              </div>
            } />
          </Routes>
        </Suspense>
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
