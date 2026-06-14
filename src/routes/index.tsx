import { createFileRoute } from "@tanstack/react-router";
import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PROFILE_ID = "63f004d7-46e9-4f4f-8e23-a4fba1118bde";

type ProfileData = {
  name: string;
  subtitle: string;
  bio: string;
  photo_url: string;
  instagram: string;
  tiktok: string;
  website: string;
  whatsapp: string;
  email: string;
  phone: string;
  background_type: "solid" | "gradient" | "image";
  background_value: string;
  background_opacity: number;
};

type GalleryItem = {
  id: string;
  image_url: string;
  caption: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" },
    ],
    meta: [
      { title: "Profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function Index() {
  const SLIDE_INTERVAL = 3000;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  useEffect(() => {
    supabase
      .from("profile")
      .select("*")
      .eq("id", PROFILE_ID)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });

    supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => { if (data) setGallery(data); });
  }, []);

  useEffect(() => {
  if (gallery.length === 0 || modalOpen) return;

  const timer = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  }, SLIDE_INTERVAL);

  return () => clearInterval(timer);
}, [gallery, modalOpen]); // ← RETIRER currentIndex des dépendances

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, oklch(0.78 0.09 285), oklch(0.62 0.08 260) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "white" }}>Chargement...</p>
      </div>
    );
  }

  const links: { key: keyof ProfileData; label: string; icon: React.ReactNode }[] = [
    { key: "instagram", label: "Instagram", icon: <InstagramIcon className="size-[18px]" /> },
    { key: "tiktok", label: "TikTok", icon: <TikTokIcon className="size-[18px]" /> },
    { key: "website", label: "Website", icon: <Globe className="size-[18px]" /> },
    { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="size-[18px]" /> },
    { key: "email", label: "Email", icon: <Mail className="size-[18px]" /> },
    { key: "phone", label: "Phone", icon: <Phone className="size-[18px]" /> },
  ];

  const activeLinks = links.filter(({ key }) => profile[key]);

  // ← Fond lu depuis Supabase
  const bgStyle: React.CSSProperties =
    profile.background_type === "image"
      ? {
          backgroundImage: profile.background_value,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: profile.background_value };

  const overlayOpacity = (profile.background_opacity ?? 45) / 100;

  return (
    <div className="relative min-h-screen" style={bgStyle}>
      {profile.background_type === "image" && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundColor: `rgba(10, 8, 20, ${overlayOpacity})` }}
        />
      )}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:py-16">
        <main className="glass-panel animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm rounded-[2rem] p-6 text-card-foreground duration-700 sm:p-8">

          {/* Hero */}
          <div className="flex flex-col items-center text-center">
            <div className="photo-ring h-40 w-40 overflow-hidden rounded-full sm:h-48 sm:w-48">
              <img
                src={profile.photo_url || "https://ui-avatars.com/api/?name=" + profile.name}
                alt={profile.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
              {profile.subtitle}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-card-foreground/90 sm:max-w-sm sm:text-[15px]">
              {profile.bio}
            </p>
          </div>

          {/* Liens */}
          {activeLinks.length > 0 && (
            <div className="mt-6 flex w-full flex-col gap-3">
              {activeLinks.map(({ key, label, icon }) => (
                <a
                  key={key}
                  href={profile[key] as string}
                  target={key === "email" || key === "phone" ? undefined : "_blank"}
                  rel={key === "email" || key === "phone" ? undefined : "noopener noreferrer"}
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/65 px-4 py-3.5 text-sm font-medium text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/85 hover:shadow-md active:scale-[0.98] sm:py-4"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/70 text-primary transition-colors duration-200 group-hover:bg-primary/12 group-hover:text-primary">
                      {icon}
                    </span>
                    <span>{label}</span>
                  </span>
                  <svg className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* Galerie */}
          {gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Gallery
              </h2>

              {/* Carrousel */}
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm aspect-[4/3]">

                <img
                  src={gallery[currentIndex].image_url}
                  alt={gallery[currentIndex].caption || ""}
                  className="h-full w-full object-cover cursor-pointer transition-opacity duration-500"
                  loading="lazy"
                  onClick={() => {
                  setModalIndex(currentIndex); // ← mémoriser l'index au moment du clic
                  setModalOpen(true);
                  }}
                />

                {/* Flèche gauche */}
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Photo précédente"
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Flèche droite */}
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % gallery.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Photo suivante"
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Points indicateurs */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                      aria-label={`Aller à la photo ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Modal */}
              {modalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                  onClick={() => setModalOpen(false)}
                >
                  <div
                    className="relative max-h-[90vh] max-w-[90vw]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setModalOpen(false)}
                      className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
                    >
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <img
                      src={gallery[modalIndex].image_url}
                      alt={gallery[modalIndex].caption || ""}
                      className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                    />
                    {gallery[modalIndex].caption && (
                      <p className="mt-2 text-center text-sm text-white/80">
                        {gallery[modalIndex].caption}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-8 pb-2 text-center">
            <p className="text-[11px] text-muted-foreground">{profile.name} — Personal Profile</p>
          </footer>

        </main>
      </div>
    </div>
  );
}