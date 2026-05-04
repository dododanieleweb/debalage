import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STATUS_CONFIG = {
  confermato: { label: 'Confermato', icon: <Package size={15} />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  spedito:    { label: 'Spedito',    icon: <Truck size={15} />,   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  consegnato: { label: 'Consegnato', icon: <CheckCircle size={15} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  annullato:  { label: 'Annullato',  icon: <XCircle size={15} />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function Orders() {
  const { state, openAuth } = useApp();
  const { user, orders } = state;

  if (!user) {
    return (
      <div className="pt-32 min-h-screen max-w-2xl mx-auto px-4 text-center">
        <div className="bg-cream-100 rounded-3xl p-12">
          <ShoppingBag size={64} className="text-cream-400 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-bark-900 mb-3">Accedi per vedere gli ordini</h2>
          <p className="text-bark-500 font-sans mb-8">Devi essere autenticato per vedere il tuo storico ordini.</p>
          <button onClick={() => openAuth('login')} className="btn-primary">Accedi</button>
        </div>
      </div>
    );
  }

  const myOrders = orders.filter(o => o.userId === user.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (myOrders.length === 0) {
    return (
      <div className="pt-32 min-h-screen max-w-2xl mx-auto px-4 text-center">
        <div className="bg-cream-100 rounded-3xl p-12">
          <ShoppingBag size={64} className="text-cream-400 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-bark-900 mb-3">Nessun ordine ancora</h2>
          <p className="text-bark-500 font-sans mb-8">Sfoglia il catalogo e acquista i tuoi pezzi vintage preferiti!</p>
          <Link to="/prodotti" className="btn-primary inline-flex">
            Esplora i prodotti <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="btn-ghost">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="font-serif text-3xl text-bark-900">I miei ordini</h1>
        <span className="badge bg-bark-100 text-bark-600">{myOrders.length}</span>
      </div>

      <div className="space-y-6">
        {myOrders.map(order => {
          const cfg = STATUS_CONFIG[order.status];
          const date = new Date(order.createdAt).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={order.id} className="card overflow-hidden">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-cream-50 border-b border-cream-200">
                <div>
                  <p className="text-xs text-bark-400 font-sans uppercase tracking-wide mb-0.5">Ordine</p>
                  <p className="font-serif text-bark-900 font-medium">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-bark-400 font-sans">{date}</p>
                  <p className="font-serif text-bark-900 font-semibold">€{order.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                </div>
                <span className={`badge border ${cfg.color} flex items-center gap-1.5`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-cream-100">
                {order.items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-4 px-6 py-4">
                    <Link to={`/prodotto/${product.id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 rounded-xl object-cover bg-cream-100 shrink-0 hover:opacity-90 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/prodotto/${product.id}`}
                        className="font-serif text-bark-900 hover:text-vintage-700 transition-colors line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-bark-400 font-sans mt-0.5">
                        {product.category}{product.era ? ` · ${product.era}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-bark-900">€{(product.price * quantity).toLocaleString('it-IT')}</p>
                      {quantity > 1 && (
                        <p className="text-xs text-bark-400 font-sans">×{quantity}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-cream-50 border-t border-cream-200">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-sans">
                  <div className="flex items-start gap-1.5 text-bark-500">
                    <Package size={14} className="mt-0.5 shrink-0" />
                    <span>
                      {order.address}, {order.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-bark-500">
                    <span>
                      Subtotale: <strong className="text-bark-800">€{order.subtotal.toLocaleString('it-IT')}</strong>
                    </span>
                    <span>
                      Spedizione:{' '}
                      <strong className={order.shipping === 0 ? 'text-emerald-600' : 'text-bark-800'}>
                        {order.shipping === 0 ? 'Gratuita' : `€${order.shipping.toFixed(2)}`}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
