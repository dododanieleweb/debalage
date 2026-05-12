import { useRef, useState, useCallback } from 'react';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/uploadImage';

interface UploadTask {
  id: string;
  name: string;
  progress: number; // 0–1
  error?: string;
}

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: 'products' | 'events';
  userId: string;
  /** Max number of images allowed — defaults to 10 */
  maxFiles?: number;
}

export default function ImageUploader({
  value,
  onChange,
  folder,
  userId,
  maxFiles = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [dragging, setDragging] = useState(false);

  const activeTasks = tasks.filter(t => !t.error);
  const slotsLeft = Math.max(0, maxFiles - value.length);
  const canAdd = slotsLeft > 0 && activeTasks.length < slotsLeft;

  const processFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter(f => f.type.startsWith('image/'));
      const currentSlots = Math.max(0, maxFiles - value.length);
      const toUpload = images.slice(0, currentSlots);
      if (toUpload.length === 0) return;

      const newTasks: UploadTask[] = toUpload.map(f => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        progress: 0,
      }));
      setTasks(prev => [...prev, ...newTasks]);

      const collected: string[] = [];

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const tid = newTasks[i].id;
        try {
          const url = await uploadImage(file, {
            folder,
            userId,
            onProgress: p =>
              setTasks(prev =>
                prev.map(t => (t.id === tid ? { ...t, progress: p } : t)),
              ),
          });
          collected.push(url);
          setTasks(prev => prev.filter(t => t.id !== tid));
        } catch {
          setTasks(prev =>
            prev.map(t =>
              t.id === tid ? { ...t, progress: 0, error: 'Upload fallito' } : t,
            ),
          );
        }
      }

      if (collected.length > 0) {
        onChange([...value, ...collected]);
      }
    },
    [value, onChange, folder, userId, maxFiles],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    // reset so the same file can be re-selected after removing it
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeUrl = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <div className="space-y-3">
      {/* ── Confirmed image thumbnails ─────────────────────────── */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, idx) => (
            <div
              key={url}
              className="relative group aspect-square rounded-xl overflow-hidden bg-cream-100 border border-cream-200"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                }}
              />
              <button
                type="button"
                onClick={() => removeUrl(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-bark-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Rimuovi immagine"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── In-progress / error upload rows ───────────────────── */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                task.error ? 'bg-rose-50 border border-rose-100' : 'bg-cream-50'
              }`}
            >
              {task.error ? (
                <AlertCircle size={16} className="text-rose-500 shrink-0" />
              ) : (
                <Loader2 size={16} className="text-vintage-600 shrink-0 animate-spin" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs text-bark-700 truncate font-sans">{task.name}</p>
                {task.error ? (
                  <p className="text-xs text-rose-500 font-sans mt-0.5">{task.error}</p>
                ) : (
                  <div className="mt-1.5 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-vintage-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(task.progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {task.error && (
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="text-bark-400 hover:text-bark-700 transition-colors"
                  aria-label="Rimuovi errore"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Drop zone ─────────────────────────────────────────── */}
      {canAdd && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors select-none ${
            dragging
              ? 'border-vintage-400 bg-vintage-50'
              : 'border-cream-300 hover:border-vintage-300 hover:bg-cream-50'
          }`}
        >
          <Upload size={22} className="mx-auto mb-2 text-bark-400" />
          <p className="text-sm font-sans text-bark-600">
            Trascina qui le foto, o{' '}
            <span className="text-vintage-600 font-medium">sfoglia</span>
          </p>
          <p className="text-xs text-bark-400 mt-1 font-sans">
            JPG · PNG · WEBP — compressa automaticamente
            {value.length > 0 && (
              <>
                {' '}
                &nbsp;·&nbsp; {slotsLeft} {slotsLeft === 1 ? 'rimasta' : 'rimaste'}
              </>
            )}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* ── Limit reached message ─────────────────────────────── */}
      {!canAdd && tasks.length === 0 && value.length >= maxFiles && (
        <p className="text-xs text-bark-400 font-sans text-center py-2">
          Limite di {maxFiles} {maxFiles === 1 ? 'foto' : 'foto'} raggiunto.
        </p>
      )}
    </div>
  );
}
