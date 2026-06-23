import { createFileRoute } from "@tanstack/react-router";
import { Globe, Linkedin, Mail, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProfileData, GalleryItem } from "@/types/profile";
import { formatLink, buildVCard } from "@/lib/profile-utils";

export const Route = createFileRoute("/$slug")({
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap",
      },
    ],
    meta: [
      { title: "Profile" },
      { name: "description", content: "Carte de profil NFC" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Profile" },
      { property: "og:description", content: "Carte de profil NFC" },
    ],
  }),
  component: SlugProfilePage,
});

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function SlugProfilePage() {
  // --------------------------------------------------
  // Logique globale :
  // 1. Récupérer le slug depuis l’URL
  // 2. Charger le bon profil depuis Supabase avec ce slug
  // 3. Charger uniquement la galerie liée à ce profil
  // 4. Réutiliser le design actuel de ta carte publique
  // --------------------------------------------------

  const { slug } = Route.useParams();

  const SLIDE_INTERVAL = 4000;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfileBySlug();
  }, [slug]);

  async function loadProfileBySlug() {
    setLoading(true);
    setNotFound(false);
    setProfile(null);
    setGallery([]);
    setCurrentIndex(0);
    setModalIndex(0);
    setModalOpen(false);

    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("slug", slug)
      .single();

    if (profileError || !profileData) {
      console.error("Erreur profil slug :", profileError);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData as ProfileData);

    const { data: galleryData, error: galleryError } = await supabase
      .from("gallery")
      .select("*")
      .eq("profile_id", profileData.id)
      .order("id", { ascending: false });

    if (galleryError) {
      console.error("Erreur galerie :", galleryError);
      setGallery([]);
    } else {
      setGallery((galleryData || []) as GalleryItem[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (gallery.length <= 1 || modalOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [gallery, modalOpen]);

  useEffect(() => {
    if (!modalOpen || gallery.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
      if (event.key === "ArrowLeft") {
        setModalIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
      if (event.key === "ArrowRight") {
        setModalIndex((prev) => (prev + 1) % gallery.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, gallery.length]);

  const downloadVCard = () => {
    const vcard = buildVCard(profile);
    if (!vcard) return;

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profile?.name || "contact").replace(/\s+/g, "-").toLowerCase()}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const goToNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const goToPreviousModal = () => {
    setModalIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const goToNextModal = () => {
    setModalIndex((prev) => (prev + 1) % gallery.length);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, oklch(0.78 0.09 285), oklch(0.62 0.08 260) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "white" }}>Chargement...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, oklch(0.78 0.09 285), oklch(0.62 0.08 260) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "24px",
            padding: "24px",
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(14px)",
            color: "white",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
            Profil introuvable
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", margin: 0 }}>
            Aucun profil public trouvé pour le slug : <strong>{slug}</strong>
          </p>
        </div>
      </div>
    );
  }

  const links: {
    key: keyof ProfileData;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: "instagram", label: "Instagram", icon: <InstagramIcon className="size-[18px]" /> },
    { key: "tiktok", label: "TikTok", icon: <TikTokIcon className="size-[18px]" /> },
    { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="size-[18px]" /> },
    { key: "website", label: "Website", icon: <Globe className="size-[18px]" /> },
    { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="size-[18px]" /> },
    { key: "email", label: "Email", icon: <Mail className="size-[18px]" /> },
    { key: "phone", label: "Phone", icon: <Phone className="size-[18px]" /> },
  ];

  const activeLinks = links.filter(({ key }) => {
    const value = profile[key];
    return typeof value === "string" && value.trim() !== "";
  });

  const bgStyle: React.CSSProperties =
    profile.background_type === "image"
      ? {
          backgroundImage: profile.background_value.startsWith("url(")
            ? profile.background_value
            : `url("${profile.background_value}")`,
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
          <div className="flex flex-col items-center text-center">
            <div className="photo-ring h-40 w-40 overflow-hidden rounded-full sm:h-48 sm:w-48">
              <img
                src={
                  profile.photo_url ||
                  "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name)
                }
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

          {activeLinks.length > 0 && (
            <div className="mt-6 flex w-full flex-col gap-3">
              {activeLinks.map(({ key, label, icon }) => {
                const rawValue = profile[key] as string;
                const href = formatLink(key, rawValue);

                return (
                  <a
                    key={key}
                    href={href}
                    target={key === "email" || key === "phone" ? undefined : "_blank"}
                    rel={key === "email" || key === "phone" ? undefined : "noopener noreferrer"}
                    className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/65 px-4 py-3.5 text-sm font-medium text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/85 hover:shadow-md active:scale-[0.98] sm:py-4"
                    aria-label={`${label} : ${rawValue}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/70 text-primary transition-colors duration-200 group-hover:bg-primary/12 group-hover:text-primary">
                        {icon}
                      </span>
                      <span>{label}</span>
                    </span>
                    <svg
                      className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={downloadVCard}
              className="w-full rounded-2xl border border-border/70 bg-card/85 px-4 py-3.5 text-sm font-semibold text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-md active:scale-[0.98]"
            >
              Enregistrer le contact
            </button>
          </div>

          {gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Gallery
              </h2>

              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm">
                <img
                  src={gallery[currentIndex].image_url}
                  alt={gallery[currentIndex].caption || `Photo ${currentIndex + 1}`}
                  className="h-full w-full cursor-pointer object-cover transition-opacity duration-500"
                  loading="lazy"
                  onClick={() => {
                    setModalIndex(currentIndex);
                    setModalOpen(true);
                  }}
                />

                <button
                  onClick={goToPreviousSlide}
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Photo précédente"
                  type="button"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNextSlide}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Photo suivante"
                  type="button"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                      aria-label={`Aller à la photo ${i + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              {modalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                  onClick={() => setModalOpen(false)}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Galerie photo"
                >
                  <div
                    className="relative max-h-[90vh] max-w-[90vw]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setModalOpen(false)}
                      className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
                      type="button"
                      aria-label="Fermer la galerie"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    {gallery.length > 1 && (
                      <button
                        onClick={goToPreviousModal}
                        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        type="button"
                        aria-label="Voir la photo précédente"
                      >
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {gallery.length > 1 && (
                      <button
                        onClick={goToNextModal}
                        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        type="button"
                        aria-label="Voir la photo suivante"
                      >
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    <img
                      src={gallery[modalIndex].image_url}
                      alt={gallery[modalIndex].caption || `Photo ${modalIndex + 1}`}
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

          <footer className="mt-8 pb-2 text-center">
            <p className="text-[11px] text-muted-foreground">{profile.name} — Personal Profile</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
