import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import debalageLogo from '../assets/debalage-logo.png';

export default function Footer() {
  return (
    <footer className="bg-bark-900 text-cream-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <img
                src={debalageLogo}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 object-contain"
              />
              <span className="font-serif text-2xl font-semibold text-cream-50">Debalage</span>
            </Link>
            <p className="text-sm text-cream-400 leading-relaxed mb-6">
              Il marketplace italiano per il vintage e l'usato di qualità. Vendite in case private, mercatini ed eventi in tutta Italia.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-bark-800 flex items-center justify-center text-cream-300 hover:bg-vintage-600 hover:text-white transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-bark-800 flex items-center justify-center text-cream-300 hover:bg-vintage-600 hover:text-white transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-bark-800 flex items-center justify-center text-cream-300 hover:bg-vintage-600 hover:text-white transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Esplora */}
          <div>
            <h4 className="font-serif text-cream-50 text-lg mb-5">Esplora</h4>
            <ul className="space-y-3">
              {[
                { to: '/eventi', label: 'Case & Eventi' },
                { to: '/prodotti', label: 'Tutti i prodotti' },
                { to: '/venditori', label: 'Venditori' },
                { to: '/prodotti?category=abbigliamento', label: 'Abbigliamento' },
                { to: '/prodotti?category=mobili', label: 'Mobili & Design' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-cream-400 hover:text-cream-100 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendi */}
          <div>
            <h4 className="font-serif text-cream-50 text-lg mb-5">Vendi con noi</h4>
            <ul className="space-y-3">
              {[
                { to: '/dashboard',         label: 'Dashboard venditore' },
                { to: '/come-funziona',     label: 'Come funziona' },
                { to: '/commissioni',       label: 'Commissioni' },
                { to: '/dashboard',         label: 'Organizza un evento' },
                { to: '/guide-fotografiche',label: 'Guide fotografiche' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-cream-400 hover:text-cream-100 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="font-serif text-cream-50 text-lg mb-5">Contatti</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-vintage-400 mt-0.5 shrink-0" />
                <span className="text-sm text-cream-400">Via della Moda 12<br />20121 Milano, Italia</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-vintage-400 shrink-0" />
                <a href="mailto:ciao@debalage.it" className="text-sm text-cream-400 hover:text-cream-100 transition-colors">
                  ciao@debalage.it
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-vintage-400 shrink-0" />
                <a href="tel:+390212345678" className="text-sm text-cream-400 hover:text-cream-100 transition-colors">
                  +39 02 1234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-bark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-500">
            © 2026 Debalage. Tutti i diritti riservati.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-cream-500 hover:text-cream-300 transition-colors">Privacy Policy</Link>
            <Link to="/termini" className="text-xs text-cream-500 hover:text-cream-300 transition-colors">Termini di servizio</Link>
            <Link to="/cookie" className="text-xs text-cream-500 hover:text-cream-300 transition-colors">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
