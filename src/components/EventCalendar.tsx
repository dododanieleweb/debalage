import { useState } from 'react';
import { Clock, Users, Check, X, CalendarCheck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeSlot, Event } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  event: Event;
  slots: TimeSlot[];
  readOnly?: boolean;
}

type ConfirmState = { slot: TimeSlot; action: 'book' | 'cancel' } | null;

function slotStatus(slot: TimeSlot, userId: string | undefined) {
  if (slot.disabled) return 'disabled';
  const bookedByMe = userId ? slot.bookings.some(b => b.userId === userId) : false;
  if (bookedByMe) return 'mine';
  if (slot.bookings.length >= slot.maxCapacity) return 'full';
  if (slot.bookings.length >= slot.maxCapacity - 1) return 'last';
  return 'available';
}

const STATUS_STYLES = {
  available: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100',
  last:      'bg-amber-50  border-amber-200  hover:border-amber-400  hover:bg-amber-100',
  full:      'bg-red-50    border-red-200    cursor-not-allowed',
  mine:      'bg-blue-50   border-blue-300   ring-2 ring-blue-200',
  disabled:  'bg-cream-100 border-cream-200  cursor-not-allowed opacity-50',
};

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  available: { text: 'Disponibile', color: 'text-emerald-700' },
  last:      { text: 'Ultimi posti', color: 'text-amber-700' },
  full:      { text: 'Completo',    color: 'text-red-600'    },
  mine:      { text: 'Prenotato',   color: 'text-blue-700'   },
  disabled:  { text: 'Non disp.',   color: 'text-bark-400'   },
};

export default function EventCalendar({ event, slots, readOnly = false }: Props) {
  const { state, bookSlot, cancelBooking, openAuth, notify, getUserBookedSlot } = useApp();
  const userId = state.user?.id;
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [page, setPage] = useState(0);

  const bookedSlot = getUserBookedSlot(event.id);
  const SLOTS_PER_PAGE = 8;
  const activeSlots = slots.filter(s => !s.disabled);
  const totalPages = Math.ceil(slots.length / SLOTS_PER_PAGE);
  const visibleSlots = slots.slice(page * SLOTS_PER_PAGE, (page + 1) * SLOTS_PER_PAGE);

  const handleSlotClick = (slot: TimeSlot) => {
    if (readOnly) return;
    if (!state.user) { openAuth('login'); return; }
    const st = slotStatus(slot, userId);
    if (st === 'disabled' || st === 'full') return;
    if (st === 'mine') {
      setConfirm({ slot, action: 'cancel' });
    } else {
      if (bookedSlot && bookedSlot.id !== slot.id) {
        notify('Hai già una prenotazione per questo evento. Annullala prima di sceglierne un\'altra.', 'info');
        return;
      }
      setConfirm({ slot, action: 'book' });
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.action === 'book') {
      bookSlot(event.id, confirm.slot.id);
      notify(`Prenotazione confermata: ${confirm.slot.startTime}–${confirm.slot.endTime}`);
    } else {
      cancelBooking(event.id, confirm.slot.id);
      notify('Prenotazione annullata', 'info');
    }
    setConfirm(null);
  };

  const totalBooked  = slots.reduce((s, sl) => s + sl.bookings.length, 0);
  const totalCapacity = activeSlots.reduce((s, sl) => s + sl.maxCapacity, 0);
  const occupancy = totalCapacity ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header summary */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-cream-50 border border-cream-200 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <CalendarCheck size={20} className="text-vintage-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-bark-900 font-sans">Appuntamenti da 30 minuti</p>
            <p className="text-xs text-bark-400 font-sans">
              {event.timeStart} – {event.timeEnd} · {slots.filter(s => !s.disabled).length} fasce orarie
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="font-serif text-xl text-bark-900">{totalBooked}</div>
            <div className="text-[10px] uppercase tracking-wide text-bark-400 font-sans">Prenotati</div>
          </div>
          <div>
            <div className="font-serif text-xl text-bark-900">{totalCapacity - totalBooked}</div>
            <div className="text-[10px] uppercase tracking-wide text-bark-400 font-sans">Liberi</div>
          </div>
          <div>
            <div className="font-serif text-xl text-bark-900">{occupancy}%</div>
            <div className="text-[10px] uppercase tracking-wide text-bark-400 font-sans">Occupato</div>
          </div>
        </div>
      </div>

      {/* My booking banner */}
      {bookedSlot && !readOnly && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3">
          <Check size={18} className="text-blue-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 font-sans">
              Hai prenotato: <strong>{bookedSlot.startTime}–{bookedSlot.endTime}</strong>
            </p>
            <p className="text-xs text-blue-600 font-sans">Riceverai un promemoria via email prima dell'evento</p>
          </div>
          <button
            onClick={() => setConfirm({ slot: bookedSlot, action: 'cancel' })}
            className="text-xs text-blue-600 hover:text-red-600 font-medium font-sans underline transition-colors"
          >
            Annulla
          </button>
        </div>
      )}

      {/* Legend */}
      {!readOnly && (
        <div className="flex flex-wrap gap-3 text-xs font-sans">
          {Object.entries(STATUS_LABEL).filter(([k]) => k !== 'disabled').map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                key === 'available' ? 'bg-emerald-400' :
                key === 'last'      ? 'bg-amber-400'   :
                key === 'full'      ? 'bg-red-400'     :
                                     'bg-blue-400'
              }`} />
              <span className="text-bark-500">{val.text}</span>
            </span>
          ))}
        </div>
      )}

      {/* Slots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleSlots.map(slot => {
          const st = slotStatus(slot, userId);
          const label = STATUS_LABEL[st];
          const free = slot.maxCapacity - slot.bookings.length;
          const pct  = (slot.bookings.length / slot.maxCapacity) * 100;

          return (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={st === 'disabled' || st === 'full' || readOnly}
              className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${STATUS_STYLES[st]} ${!readOnly && st !== 'disabled' && st !== 'full' ? 'cursor-pointer active:scale-[0.98]' : ''}`}
            >
              {/* Time */}
              <div className="shrink-0 text-center">
                <div className="font-serif text-lg text-bark-900 leading-none">{slot.startTime}</div>
                <div className="text-[10px] text-bark-400 font-sans mt-0.5">{slot.endTime}</div>
              </div>

              <div className="flex-1 min-w-0">
                {/* Capacity bar */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-medium font-sans ${label.color}`}>{label.text}</span>
                  <span className="flex items-center gap-1 text-xs text-bark-400 font-sans">
                    <Users size={11} />
                    {slot.bookings.length}/{slot.maxCapacity}
                  </span>
                </div>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      st === 'full' ? 'bg-red-400' :
                      st === 'mine' ? 'bg-blue-400' :
                      st === 'last' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {st !== 'full' && st !== 'mine' && st !== 'disabled' && (
                  <p className="text-[10px] text-bark-400 font-sans mt-1">
                    {free} {free === 1 ? 'posto libero' : 'posti liberi'}
                  </p>
                )}
              </div>

              {/* Icon */}
              {st === 'mine' && <Check size={18} className="text-blue-500 shrink-0" />}
              {st === 'full' && <X    size={18} className="text-red-400  shrink-0" />}
              {st === 'disabled' && <span className="text-bark-300 text-xs font-sans shrink-0">—</span>}

              {/* Hover avatars (booked users) */}
              {slot.bookings.length > 0 && (
                <div className="absolute -top-2 -right-2 flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {slot.bookings.slice(0, 3).map(b => (
                    <img key={b.id} src={b.userAvatar} alt={b.userName} title={b.userName}
                      className="w-5 h-5 rounded-full ring-1 ring-white object-cover" />
                  ))}
                  {slot.bookings.length > 3 && (
                    <span className="w-5 h-5 rounded-full bg-bark-700 ring-1 ring-white text-[8px] text-white flex items-center justify-center font-sans">
                      +{slot.bookings.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-full border border-cream-200 flex items-center justify-center text-bark-500 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-sans text-bark-500">
            Orari {page * SLOTS_PER_PAGE + 1}–{Math.min((page + 1) * SLOTS_PER_PAGE, slots.length)} di {slots.length}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-8 h-8 rounded-full border border-cream-200 flex items-center justify-center text-bark-500 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-bark-900/50 backdrop-blur-sm"
          onClick={() => setConfirm(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${confirm.action === 'book' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {confirm.action === 'book'
                ? <CalendarCheck size={24} className="text-emerald-600" />
                : <AlertCircle   size={24} className="text-red-500"     />
              }
            </div>
            <h3 className="font-serif text-xl text-bark-900 text-center mb-1">
              {confirm.action === 'book' ? 'Conferma prenotazione' : 'Annulla prenotazione'}
            </h3>
            <p className="text-sm text-bark-500 font-sans text-center mb-5">
              {confirm.action === 'book'
                ? <>Prenoti il tuo posto per le <strong className="text-bark-900">{confirm.slot.startTime}–{confirm.slot.endTime}</strong></>
                : <>Annulli la prenotazione per le <strong className="text-bark-900">{confirm.slot.startTime}–{confirm.slot.endTime}</strong></>
              }
            </p>

            {/* Event recap */}
            <div className="bg-cream-50 rounded-2xl px-4 py-3 mb-5 text-xs font-sans text-bark-600 space-y-1">
              <p><strong>Evento:</strong> {event.title}</p>
              <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p><strong>Dove:</strong> {event.address}, {event.city}</p>
              <p><strong>Durata:</strong> 30 minuti</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1 justify-center border border-cream-200">
                Indietro
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-sans font-medium text-sm transition-all ${
                  confirm.action === 'book'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {confirm.action === 'book' ? <><Check size={16} /> Prenota</> : <><X size={16} /> Annulla</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
