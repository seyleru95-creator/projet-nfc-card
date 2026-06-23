import { useCallback, useEffect, useRef, useState } from "react";
import { GalleryItem } from "@/types/profile";
import { ChevronLeft, ChevronRight, CloseIcon } from "./icons";

interface GalleryModalProps {
  gallery: GalleryItem[];
  modalIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
}

export function GalleryModal({
  gallery,
  modalIndex,
  isOpen,
  onClose,
  onNavigate,
}: GalleryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");

  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => closeRef.current?.focus(), 0);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    setImgState("loading");
  }, [modalIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        onNavigate(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        onNavigate(1);
        return;
      }
      if (event.key === "Tab") {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNavigate, getFocusableElements]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galerie photo"
    >
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
          type="button"
          aria-label="Fermer la galerie"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {gallery.length > 1 && (
          <button
            onClick={() => onNavigate(-1)}
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            type="button"
            aria-label="Voir la photo précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {gallery.length > 1 && (
          <button
            onClick={() => onNavigate(1)}
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            type="button"
            aria-label="Voir la photo suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div className="relative">
          {imgState === "loading" && (
            <div className="flex h-[50vh] w-[50vw] items-center justify-center rounded-2xl bg-slate-800/60">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          )}
          {imgState === "error" && (
            <div className="flex h-[50vh] w-[50vw] items-center justify-center rounded-2xl bg-slate-800/60">
              <span className="text-sm text-slate-500">Image indisponible</span>
            </div>
          )}
          <img
            src={gallery[modalIndex].image_url}
            alt={gallery[modalIndex].caption || `Photo ${modalIndex + 1}`}
            className={`max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl ${imgState === "loaded" ? "" : "opacity-0"}`}
            onLoad={() => setImgState("loaded")}
            onError={() => setImgState("error")}
          />
        </div>

        {gallery[modalIndex].caption && (
          <p className="mt-2 text-center text-sm text-white/80">{gallery[modalIndex].caption}</p>
        )}
      </div>
    </div>
  );
}
