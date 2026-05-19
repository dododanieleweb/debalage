import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Calendar, Trash2, CheckCircle, ArrowLeft, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeeType } from '../types';

const FEE_LABELS: Record<FeeType, { label: string; icon: React.ReactNode; color: string }> = {
  event_publish:    { label: 'Pubblicazione evento',   icon: <Calendar size={16} />,  color: 'text-bark-700 bg-bark-50 border-bark-200' },
  feature_event:    { label: 'Evento in evidenza',     icon: <Star size={16} />,      color: 'text-vintage-700 bg-vintage-50 border-vintage-200' },
  feature_product:  { label: 'Prodotto in evidenza',   icon: <Star size={16} />,      color: 'text-amber-700 bg-amber-50 border-amber-200' },
};

export default function FeeCheckout() {
  const { state, removeFromFeeCart, checkoutFeeCart, notify } = useApp();
  const navigate = useNavigate();

  const { feeCart } = state;
  const total = feeCart.reduce((s, i) => s + i.amount, 0);

  const handleConfirm = async () => {
    const ok = await checkoutFeeCart();
    if (ok) {
      notify('Quote registrate! L\'amministratore ti contatterà per il pagamento.', 'success');
      navigate('/dashboard?tab=fees');
    } else {
      notify('Errore durante il salvataggio delle quote. Riprova.', 'error');
    }
  };

  if (!state.user) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <p className="text-bark-500 font-sans">Accedi per visualizzare il carrello quote.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-bark-500 hover:text-bark-800 transition-colors mb-6 font-sans"
        >
          <ArrowLeft size={16} />
          Torna indietro
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-vintage-100 flex items-center justify-center">
            <ShoppingCart size={20} className="text-vintage-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-bark-900">Riepilogo quote</h1>
            <p className="text-sm text-bark-500 font-sans">Conferma le quote per la piattaforma</p>
          </div>
        </div>

        {feeCart.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl shadow-sm border border-cream-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={28} className="text-cream-400" />
            </div>
            <h2 className="font-serif text-xl text-bark-700 mb-2">Nessuna quota in attesa</h2>
            <p className="text-sm text-bark-400 font-sans mb-6">
              Le quote compaiono qui quando pubblichi un evento o attivi l'opzione "in evidenza".
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Vai alla dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Fee list */}
            <div className="bg-white rounded-3xl shadow-sm border border-cream-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-cream-100">
                <p className="text-sm font-medium text-bark-700 font-sans">
                  {feeCart.length} {feeCart.length === 1 ? 'quota' : 'quote'} in attesa
                </p>
              </div>

              <ul className="divide-y divide-cream-100">
                {feeCart.map(item => {
                  const meta = FEE_LABELS[item.type];
                  return (
                    <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                      {/* Icon badge */}
                      <div className={`flex items-center gap-1.5 text-xs font-medium font-sans border px-2 py-1 rounded-full shrink-0 ${meta.color}`}>
                        {meta.icon}
                        {meta.label}
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-bark-800 font-sans truncate">{item.referenceTitle}</p>
                      </div>

                      {/* Amount */}
                      <span className="text-sm font-semibold text-bark-900 font-sans shrink-0">
                        €{item.amount.toFixed(2)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromFeeCart(item.id)}
                        className="p-1.5 rounded-full text-bark-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                        title="Rimuovi"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-cream-200 p-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-bark-500 font-sans">Totale quote</span>
                <span className="text-2xl font-serif font-semibold text-bark-900">€{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-bark-400 font-sans mb-6 leading-relaxed">
                Le quote non vengono addebitate automaticamente. Dopo la conferma l'amministratore della piattaforma
                ti contatterà per concordare il pagamento.
              </p>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6">
                <Banknote size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-sans leading-relaxed">
                  I tuoi eventi e prodotti sono già <strong>attivi e visibili</strong>.
                  La quota verrà saldata in accordo con il gestore della piattaforma.
                </p>
              </div>

              <button
                onClick={handleConfirm}
                className="btn-primary w-full justify-center"
              >
                <CheckCircle size={18} />
                Conferma e invia richiesta
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full justify-center mt-3"
              >
                Vai alla dashboard (paga dopo)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
