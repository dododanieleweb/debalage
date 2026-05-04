import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Notification() {
  const { state } = useApp();
  if (!state.notification) return null;

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-cream-200 px-5 py-3.5 max-w-sm">
        {icons[state.notification.type]}
        <p className="text-sm font-sans text-bark-800">{state.notification.message}</p>
      </div>
    </div>
  );
}
