import { useCallback, useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { GalleryItem } from "@/types/profile";

interface GalleryManagerProps {
  gallery: GalleryItem[];
  newCaption: string;
  setNewCaption: (caption: string) => void;
  onUploadGalleryPhoto: (file: File, caption: string) => Promise<void>;
  onDeleteGalleryItem: (itemId: string) => Promise<void>;
  saving: boolean;
}

export function GalleryManager({
  gallery,
  newCaption,
  setNewCaption,
  onUploadGalleryPhoto,
  onDeleteGalleryItem,
  saving,
}: GalleryManagerProps) {
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUploadGalleryPhoto(file, newCaption);
      }
      e.target.value = "";
    },
    [newCaption, onUploadGalleryPhoto],
  );

  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:p-8">
      <h2 className="mb-6 text-xl font-semibold text-sky-300">Galerie</h2>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <input
          type="text"
          placeholder="Legende optionnelle"
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/20"
        />

        <input
          type="file"
          accept="image/*"
          ref={galleryRef}
          className="hidden"
          onChange={handleFilePick}
        />

        <div className="group relative">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-sky-200 to-sky-400 opacity-40 blur-[15px] transition-opacity duration-300 group-hover:opacity-60"
          />
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={saving}
            className="relative inline-flex items-center gap-2.5 rounded-[30px] bg-gradient-to-r from-sky-100 to-sky-200 px-7 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 hover:scale-[1.01] hover:from-sky-50 hover:to-sky-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
            {saving ? "Envoi..." : "Ajouter photo"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group/item relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/30 hover:shadow-md"
          >
            <img
              src={item.image_url}
              alt={item.caption}
              loading="lazy"
              className="h-32 w-full object-cover"
            />
            <div className="truncate bg-black/50 px-3 py-1.5 text-center text-xs text-white">
              {item.caption}
            </div>
            <button
              type="button"
              onClick={() => onDeleteGalleryItem(item.id)}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/80 text-white opacity-70 transition-all duration-200 hover:scale-110 hover:bg-rose-500 hover:opacity-100"
              aria-label="Supprimer la photo"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}

        {gallery.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-slate-500">Aucune photo</p>
        )}
      </div>

    </section>
  );
}
