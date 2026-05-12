import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductCondition, ProductStatus } from '../types';
import { CONDITIONS } from '../data/mockData';
import ImageUploader from './ImageUploader';

interface Props {
  initial?: Product;
  onClose: () => void;
}

const CATEGORIES_LIST = [
  'Abbigliamento', 'Accessori', 'Mobili', 'Illuminazione', 'Gioielli',
  'Elettronica', 'Vinili', 'Ceramiche', 'Libri', 'Arte', 'Altro',
];

const ERAS = ['1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];

export default function ProductForm({ initial, onClose }: Props) {
  const { state, addProduct, updateProduct, notify } = useApp();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'Abbigliamento');
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '');
  const [condition, setCondition] = useState<ProductCondition>(initial?.condition ?? 'buono');
  const [era, setEra] = useState(initial?.era ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [material, setMaterial] = useState(initial?.material ?? '');
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [eventId, setEventId] = useState(initial?.eventId ?? '');
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(', '));
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice?.toString() ?? '');
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'available');
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);

    if (!title || !description || images.length === 0 || !price) {
      notify('Compila tutti i campi obbligatori', 'error');
      return;
    }

    const product: Product = {
      id: initial?.id ?? `p_${Date.now()}`,
      title,
      description,
      category,
      subcategory: subcategory || undefined,
      condition,
      era: era || undefined,
      brand: brand || undefined,
      material: material || undefined,
      dimensions: dimensions || undefined,
      images,
      sellerId: state.user!.id,
      eventId: eventId || undefined,
      tags,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      status,
      featured,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
      views: initial?.views ?? 0,
      saves: initial?.saves ?? 0,
    };

    if (isEdit) {
      updateProduct(product);
      notify('Prodotto aggiornato!', 'success');
    } else {
      addProduct(product);
      notify('Prodotto aggiunto!', 'success');
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
            {isEdit ? 'Modifica prodotto' : 'Aggiungi prodotto'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-bark-500 hover:bg-cream-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
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
              placeholder="es. Abito cocktail anni '60"
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
              placeholder="Descrizione dettagliata del prodotto..."
              required
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Sottocategoria</label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="input"
                placeholder="es. Abiti, Poltrone..."
              />
            </div>
          </div>

          {/* Condition & Era */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Condizione</label>
              <select value={condition} onChange={e => setCondition(e.target.value as ProductCondition)} className="input">
                {Object.entries(CONDITIONS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Epoca</label>
              <select value={era} onChange={e => setEra(e.target.value)} className="input">
                <option value="">— Non specificato —</option>
                {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Brand & Material */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Marca / Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="input"
                placeholder="es. Chanel, Thorens..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Materiale</label>
              <input
                type="text"
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="input"
                placeholder="es. Pelle, Seta, Teak..."
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Dimensioni</label>
            <input
              type="text"
              value={dimensions}
              onChange={e => setDimensions(e.target.value)}
              className="input"
              placeholder="es. 80×90×75 cm, H 35 cm"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
              Immagini <span className="text-rose-500">*</span>
              <span className="text-bark-400 normal-case ml-1 font-normal">(fino a 5)</span>
            </label>
            <ImageUploader
              folder="products"
              userId={state.user!.id}
              maxFiles={5}
              value={images}
              onChange={setImages}
            />
            {images.length === 0 && (
              <p className="mt-1.5 text-xs text-rose-500 font-sans">
                Aggiungi almeno una foto per continuare.
              </p>
            )}
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">
                Prezzo (€) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="input"
                placeholder="es. 125.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Prezzo originale (€)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value)}
                className="input"
                placeholder="Lascia vuoto se nessuno sconto"
              />
            </div>
          </div>

          {/* Status & Event */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Stato</label>
              <select value={status} onChange={e => setStatus(e.target.value as ProductStatus)} className="input">
                <option value="available">Disponibile</option>
                <option value="reserved">Riservato</option>
                <option value="sold">Venduto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark-600 mb-1.5 font-sans uppercase tracking-wide">Evento associato</label>
              <select value={eventId} onChange={e => setEventId(e.target.value)} className="input">
                <option value="">— Nessun evento —</option>
                {state.events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title.length > 40 ? ev.title.slice(0, 40) + '…' : ev.title}
                  </option>
                ))}
              </select>
            </div>
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
              placeholder="vintage, anni60, seta, moda"
            />
          </div>

          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setFeatured(!featured)}
              className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${featured ? 'bg-vintage-600' : 'bg-cream-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${featured ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm font-sans text-bark-700">In evidenza</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-cream-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Annulla
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Plus size={16} />
              {isEdit ? 'Salva modifiche' : 'Aggiungi prodotto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
