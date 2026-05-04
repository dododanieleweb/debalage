import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { state, removeFromCart, updateQuantity, clearCart, placeOrder, cartTotal, notify, openAuth } = useApp();
  const { cart } = state;
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping'>('cart');
  const [addressError, setAddressError] = useState('');

  const shipping = cartTotal > 100 ? 0 : 8.9;
  const total = cartTotal + shipping;

  const handleProceedToShipping = () => {
    if (!state.user) {
      openAuth('login');
      return;
    }
    setCheckoutStep('shipping');
  };

  const handleCheckout = useCallback(async () => {
    if (!address.trim() || !city.trim()) {
      setAddressError('Inserisci indirizzo e città di consegna.');
      return;
    }
    setAddressError('');
    const order = await placeOrder(address.trim(), city.trim());
    if (order) {
      notify('Ordine confermato! Riceverai una email di conferma.', 'success');
      navigate('/ordini');
    }
  }, [address, city, placeOrder, notify, navigate]);

  if (cart.length === 0) {
    return (
      <div className="pt-32 min-h-screen max-w-2xl mx-auto px-4 text-center">
        <div className="bg-cream-100 rounded-3xl p-12">
          <ShoppingBag size={64} className="text-cream-400 mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-bark-900 mb-3">Il carrello è vuoto</h2>
          <p className="text-bark-500 font-sans mb-8">Aggiungi qualche pezzo vintage che ti ha colpito!</p>
          <Link to="/prodotti" className="btn-primary inline-flex">
            Esplora i prodotti <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-center gap-4 mb-8">
        {checkoutStep === 'shipping' ? (
          <button onClick={() => setCheckoutStep('cart')} className="btn-ghost">
            <ArrowLeft size={16} /> Carrello
          </button>
        ) : (
          <Link to="/prodotti" className="btn-ghost">
            <ArrowLeft size={16} /> Continua lo shopping
          </Link>
        )}
        <h1 className="font-serif text-3xl text-bark-900">
          {checkoutStep === 'cart' ? 'Il tuo carrello' : 'Dati di consegna'}
        </h1>
        {checkoutStep === 'cart' && (
          <span className="badge bg-bark-100 text-bark-600">
            {cart.reduce((s, i) => s + i.quantity, 0)} articoli
          </span>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8 font-sans text-sm">
        <span className={`flex items-center gap-2 ${checkoutStep === 'cart' ? 'text-bark-900 font-medium' : 'text-bark-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${checkoutStep === 'cart' ? 'bg-bark-900 text-white' : 'bg-emerald-500 text-white'}`}>
            {checkoutStep === 'shipping' ? '✓' : '1'}
          </span>
          Carrello
        </span>
        <span className="text-bark-300">→</span>
        <span className={`flex items-center gap-2 ${checkoutStep === 'shipping' ? 'text-bark-900 font-medium' : 'text-bark-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${checkoutStep === 'shipping' ? 'bg-bark-900 text-white' : 'bg-cream-200 text-bark-500'}`}>
            2
          </span>
          Consegna
        </span>
        <span className="text-bark-300">→</span>
        <span className="flex items-center gap-2 text-bark-400">
          <span className="w-6 h-6 rounded-full bg-cream-200 text-bark-500 flex items-center justify-center text-xs font-bold">3</span>
          Conferma
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items / Shipping form */}
        <div className="lg:col-span-2 space-y-4">
          {checkoutStep === 'cart' ? (
            <>
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="card p-5 flex gap-4">
                  <Link to={`/prodotto/${product.id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-24 h-24 rounded-xl object-cover bg-cream-100 shrink-0 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/prodotto/${product.id}`}
                          className="font-serif text-bark-900 hover:text-vintage-700 transition-colors line-clamp-2 leading-snug"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-bark-400 font-sans mt-1">
                          {product.category}{product.era ? ` · ${product.era}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(product.id);
                          notify('Prodotto rimosso dal carrello', 'info');
                        }}
                        className="text-bark-300 hover:text-rose-500 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 bg-cream-100 rounded-full px-1">
                        <button
                          onClick={() =>
                            quantity > 1
                              ? updateQuantity(product.id, quantity - 1)
                              : removeFromCart(product.id)
                          }
                          className="w-7 h-7 rounded-full flex items-center justify-center text-bark-600 hover:bg-cream-200 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium font-sans text-bark-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-bark-600 hover:bg-cream-200 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="font-serif text-xl text-bark-900 font-semibold">
                        €{(product.price * quantity).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    clearCart();
                    notify('Carrello svuotato', 'info');
                  }}
                  className="btn-ghost text-rose-500 hover:bg-rose-50 text-xs"
                >
                  <Trash2 size={14} /> Svuota carrello
                </button>
              </div>
            </>
          ) : (
            /* Shipping form */
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-vintage-600" />
                <h3 className="font-serif text-xl text-bark-900">Indirizzo di consegna</h3>
              </div>

              {state.user && (
                <div className="bg-cream-50 border border-cream-200 rounded-xl px-4 py-3 text-sm font-sans text-bark-600">
                  Consegna per: <strong className="text-bark-900">{state.user.name}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans uppercase tracking-wide">
                  Indirizzo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Via Roma 10, Interno 5"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans uppercase tracking-wide">
                  Città <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Milano"
                  className="input"
                />
              </div>

              {addressError && (
                <p className="text-xs text-rose-600 font-sans bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {addressError}
                </p>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-sans text-amber-800">
                🔒 I dati di consegna vengono usati solo per questa transazione demo.
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="font-serif text-xl text-bark-900 mb-5">Riepilogo ordine</h3>

            {/* Items summary */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-2 text-xs font-sans text-bark-600">
                  <img src={product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  <span className="flex-1 line-clamp-1">{product.title}</span>
                  <span className="shrink-0 font-medium text-bark-800">
                    ×{quantity} €{(product.price * quantity).toLocaleString('it-IT')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm font-sans border-t border-cream-200 pt-4 mb-5">
              <div className="flex justify-between text-bark-600">
                <span>Subtotale ({cart.reduce((s, i) => s + i.quantity, 0)} articoli)</span>
                <span>€{cartTotal.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between text-bark-600">
                <span>Spedizione</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                  {shipping === 0 ? 'Gratuita' : `€${shipping.toFixed(2)}`}
                </span>
              </div>
              {cartTotal < 100 && (
                <p className="text-xs text-bark-400 bg-cream-50 rounded-lg p-2">
                  Aggiungi €{(100 - cartTotal).toLocaleString('it-IT')} per la spedizione gratuita
                </p>
              )}
              <div className="border-t border-cream-200 pt-3 flex justify-between font-serif text-bark-900 text-lg font-semibold">
                <span>Totale</span>
                <span>€{total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                onClick={handleProceedToShipping}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                {state.user ? 'Dati di consegna' : 'Accedi per continuare'}
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                Conferma ordine <ArrowRight size={18} />
              </button>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-bark-400 font-sans">
              <span>🔒 Pagamento sicuro</span>
              <span>·</span>
              <span>📦 Imballaggio curato</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
