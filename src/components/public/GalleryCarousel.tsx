import { useEffect, useState } from "react";
import { GalleryItem } from "@/types/profile";
import { ChevronLeft, ChevronRight } from "./icons";

interface GalleryCarouselProps {
  gallery: GalleryItem[];
  currentIndex: number;
  onNavigate: (direction: -1 | 1) => void;
  onDotClick: (index: number) => void;
  onImageClick: () => void;
}

export function GalleryCarousel({
  gallery,
  currentIndex,
  onNavigate,
  onDotClick,
  onImageClick,
}: GalleryCarouselProps) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");
  const current = gallery[currentIndex];

  useEffect(() => {
    setImgState("loading");
  }, [currentIndex]);

  if (!current) return null;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm">
      {imgState === "loading" && <div className="absolute inset-0 animate-pulse bg-slate-700/40" />}
      {imgState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/60">
          <span className="text-xs text-slate-500">Image indisponible</span>
        </div>
      )}
      <img
        src={current.image_url}
        alt={current.caption || `Photo ${currentIndex + 1}`}
        className={`h-full w-full cursor-pointer object-cover transition-opacity duration-500 ${imgState === "loaded" ? "" : "opacity-0"}`}
        onClick={onImageClick}
        onLoad={() => setImgState("loaded")}
        onError={() => setImgState("error")}
      />

      <button
        onClick={() => onNavigate(-1)}
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        aria-label="Photo précédente"
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        onClick={() => onNavigate(1)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        aria-label="Photo suivante"
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {gallery.map((_, i) => (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Aller à la photo ${i + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
