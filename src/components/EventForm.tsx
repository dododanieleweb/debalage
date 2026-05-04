import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Event, EventType, EventStatus } from '../types';
import { EVENT_TYPES } from '../data/mockData';

interface Props {
  initial?: Event;
  onClose: () => void;
}

export default function EventForm({ initial, onClose }: Props) {
  const { state, addEvent, updateEvent, initEventSlots, notify } = useApp();
  const isEdit = !!initial;

  const [type, setType] = useState<EventType>(initial?.type ?? 'casa_privata');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [timeStart, setTimeStart] = useState(initial?.timeStart ?? '09:00');
  const [timeEnd, setTimeEnd] = useState(initial?.timeEnd ?? '18:00');
  const [image, setImage] = useState(initial?.image ?? '');
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(', '));
  const [maxAttendees, setMaxAttendees] = useState(initial?.maxAttendees?.toString() ?? '');
  const [slotMaxCapacity, setSlotMaxCapacity] = useState(initial?.slotMaxCapacity?.toString() ?? '4');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '0');
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? 'upcoming');
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);

    if (!title || !description || !address || !city || !date || !image) {
      notify('Compila tutti i campi obbligatori', 'error');
      return;
    }

    const event: Event = {
      id: initial?.id ?? `ev_${Date.now()}`,
      title,
      description,
      type,
      sellerId: state.user!.id,
      address,
      city,
      date,
      endDate: endDate || undefined,
      timeStart,
      timeEnd,
      image,
      tags,
      status,
      productsCount: initial?.productsCount ?? 0,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      currentAttendees: initial?.currentAttendees ?? 0,
      price: parseFloat(price) || 0,
      featured,
      slotMaxCapacity: type === 'casa_privata' ? (parseInt(slotMaxCapacity) || 4) : undefined,
    };

    if (isEdit) {
      updateEvent(event);
      notify('Evento aggiornato!', 'success');
    } else {
      addEvent(event);
      if (type === 'casa_privata') {
        initEventSlots(event.id, timeStart, timeEnd, parseInt(slotMaxCapacity) || 4);
      }
      notify('Evento creato!', 'success');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center p-4 bg-bark-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-cream-200">
          <h2 className="font-serif text-2xl text-bark-900">
            {isEdit ? 'Modifica evento' : 'Crea evento'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-bark-500 hover:bg-cream-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-2 font-sans uppercase tracking-wide">Tipo evento</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(EVENT_TYPES).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k as EventType)}
                  className={`p-3 rounded-xl border text-sm font-sans text-center transition-all ${
                    type === k
                      ? 'bg-bark-800 text-cream-50 border-bark-800'
                      : 'border-cream-200 text-bark-600 hover:border-bark-400'
                  }`}
                >
                  <span className="block text-xl mb-1">{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
              Titolo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input"
              placeholder="es. Vendita in Casa — Moda Anni '60"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
              Descrizione <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Descrivi l'evento..."
              required
            />
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
                Indirizzo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="input"
                placeholder="Via Roma 10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
                Città <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="input"
                placeholder="Milano"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
                Data inizio <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Data fine (opzionale)</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Ora inizio</label>
              <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Ora fine</label>
              <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className="input" />
            </div>
          </div>

          {/* Slot config (only for casa_privata) */}
          {type === 'casa_privata' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-rose-800 font-sans">🏠 Configurazione slot — Casa Privata</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans">Max persone per slot (30 min)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={slotMaxCapacity}
                    onChange={e => setSlotMaxCapacity(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans">Max partecipanti totali</label>
                  <input
                    type="number"
                    min={1}
                    value={maxAttendees}
                    onChange={e => setMaxAttendees(e.target.value)}
                    className="input"
                    placeholder="Es. 30"
                  />
                </div>
              </div>
              {!isEdit && (
                <p className="text-xs text-rose-600 font-sans">
                  Gli slot da 30 minuti verranno generati automaticamente alla creazione dell'evento.
                </p>
              )}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
              URL immagine copertina <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={image}
              onChange={e => setImage(e.target.value)}
              className="input"
              placeholder="https://images.unsplash.com/..."
              required
            />
            {image && (
              <img
                src={image}
                alt="preview"
                className="mt-2 h-28 w-full object-cover rounded-xl"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
              Tag <span className="text-bark-400 normal-case ml-1 font-normal">(separati da virgola)</span>
            </label>
            <input
              type="text"
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
              className="input"
              placeholder="vintage, moda, anni60"
            />
          </div>

          {/* Status & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Stato</label>
              <select value={status} onChange={e => setStatus(e.target.value as EventStatus)} className="input">
                <option value="upcoming">In arrivo</option>
                <option value="ongoing">In corso</option>
                <option value="completed">Concluso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Prezzo ingresso (€)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="input"
                placeholder="0 = gratuito"
              />
            </div>
          </div>

          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setFeatured(!featured)}
              className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${featured ? 'bg-vintage-600' : 'bg-cream-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${featured ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm font-sans text-bark-700">In evidenza nella home</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-cream-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Annulla
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Plus size={16} />
              {isEdit ? 'Salva modifiche' : 'Crea evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
