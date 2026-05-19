import { useState } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export default function AuthModal() {
  const { state, closeAuth, login, register, openAuth, notify } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number>(0);

  const isLogin = state.authMode === 'login';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setCity('');
    setRole('buyer');
    setError('');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Rate limiting lato client: blocco dopo 5 tentativi falliti per 2 minuti
    if (isLogin && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Troppi tentativi. Riprova tra ${remaining} secondi.`);
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        const err = await login(email, password);
        if (err) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          if (newAttempts >= 5) {
            setLockedUntil(Date.now() + 2 * 60 * 1000); // 2 minuti
            setLoginAttempts(0);
            setError('Troppi tentativi falliti. Account bloccato per 2 minuti.');
          } else if (err.toLowerCase().includes('invalid login') || err.toLowerCase().includes('invalid credentials')) {
            setError(`Email o password non corretti. (${5 - newAttempts} tentativi rimasti)`);
          } else if (err.toLowerCase().includes('email not confirmed')) {
            setError('Email non confermata. Controlla la tua casella di posta.');
          } else if (err.toLowerCase().includes('too many requests')) {
            setError('Troppi tentativi. Aspetta qualche minuto e riprova.');
          } else {
            setError(err);
          }
        } else {
          setLoginAttempts(0);
          notify('Bentornato!');
          closeAuth();
          resetForm();
        }
      } else {
        if (!name.trim() || !city.trim()) {
          setError('Compila tutti i campi richiesti.');
          return;
        }
        if (password.length < 8) {
          setError('La password deve essere di almeno 8 caratteri.');
          return;
        }
        if (!/[0-9!@#$%^&*]/.test(password)) {
          setError('La password deve contenere almeno un numero o un carattere speciale (!@#$%^&*).');
          return;
        }
        const err = await register(name.trim(), email, password, city.trim(), role);
        if (err) {
          if (err.toLowerCase().includes('already registered') || err.toLowerCase().includes('already exists')) {
            setError('Email già registrata. Accedi o usa un\'altra email.');
          } else {
            setError(err);
          }
        } else {
          notify('Registrazione completata! Benvenuto su Debalage 🎉', 'success');
          closeAuth();
          resetForm();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (mode: 'login' | 'register') => {
    resetForm();
    openAuth(mode);
  };

  if (!state.isAuthOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-bark-900/60 backdrop-blur-sm"
      onClick={closeAuth}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-bark-800 to-bark-900 px-8 py-8 text-center">
          <button
            onClick={closeAuth}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
          <span className="font-serif text-2xl text-cream-50">Debalage</span>
          <p className="text-cream-300 text-sm font-sans mt-1">
            {isLogin ? 'Accedi al tuo account' : 'Crea un account gratuito'}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans">
                  Nome completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Il tuo nome"
                  className="input"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nome@esempio.com"
                className="input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isLogin ? '••••••••' : 'Min. 8 caratteri con numero o simbolo'}
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-400 hover:text-bark-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* City (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans">
                  Città <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Milano, Roma, Torino..."
                  className="input"
                  required
                />
              </div>
            )}

            {/* Role (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-bark-700 mb-1.5 font-sans">
                  Ruolo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'buyer', label: '🛍️ Acquirente', desc: 'Compro prodotti' },
                    { value: 'seller', label: '🏪 Venditore', desc: 'Vendo prodotti' },
                    { value: 'both', label: '⚡ Entrambi', desc: 'Compro e vendo' },
                  ] as const).map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-sans transition-all ${
                        role === r.value
                          ? 'bg-bark-800 text-cream-50 border-bark-800'
                          : 'border-cream-200 text-bark-600 hover:border-bark-400'
                      }`}
                    >
                      <span className="block text-base mb-0.5">{r.label.split(' ')[0]}</span>
                      <span className="block font-medium">{r.label.split(' ').slice(1).join(' ')}</span>
                      <span className="block text-[10px] opacity-70">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-rose-600 font-sans bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> {isLogin ? 'Accesso…' : 'Registrazione…'}</>
              ) : isLogin ? (
                <><LogIn size={16} /> Accedi</>
              ) : (
                <><UserPlus size={16} /> Registrati gratis</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-bark-500 font-sans">
              {isLogin ? 'Non hai un account?' : 'Hai già un account?'}{' '}
              <button
                onClick={() => switchMode(isLogin ? 'register' : 'login')}
                className="text-vintage-600 font-medium hover:underline"
              >
                {isLogin ? 'Registrati gratis' : 'Accedi'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
