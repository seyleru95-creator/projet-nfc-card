import { createFileRoute } from "@tanstack/react-router";
import { Globe, Linkedin, Mail, MessageCircle, Phone, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { supabase } from "@/lib/supabase";
import { ProfileData, GalleryItem } from "@/types/profile";
import { formatLink, buildVCard } from "@/lib/profile-utils";
import { InstagramIcon, TikTokIcon } from "@/components/public/icons";
import { GalleryCarousel } from "@/components/public/GalleryCarousel";
import { GalleryModal } from "@/components/public/GalleryModal";

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

function SlugProfilePage() {
  const { slug } = Route.useParams();

  const SLIDE_INTERVAL = 4000;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const loadProfileBySlug = useCallback(async () => {
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
    setLoading(false);

    setGalleryLoading(true);
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
    setGalleryLoading(false);
  }, [slug]);

  useEffect(() => {
    loadProfileBySlug();
  }, [loadProfileBySlug]);

  useEffect(() => {
    if (gallery.length <= 1 || modalOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [gallery, modalOpen]);

  const vcardData = buildVCard(profile);

  const saveContact = () => {
    if (!profile) return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // iPhone : pas d'attribut download → Safari ouvre la fiche contact native.
    // Android : l'OS bloque l'ouverture directe de Contacts depuis le web
    // (activité INSERT non "browsable"), donc on télécharge le .vcf complet →
    // un tap sur la notification ouvre l'import Contacts. Desktop : téléchargement.
    const blob = new Blob([vcardData], { type: "text/vcard;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    if (!isIOS) {
      a.download = `${(profile.name || "contact").replace(/\s+/g, "-").toLowerCase()}.vcf`;
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const navigateSlide = useCallback(
    (direction: -1 | 1) => {
      setCurrentIndex((prev) => (prev + direction + gallery.length) % gallery.length);
    },
    [gallery.length],
  );

  const navigateModal = useCallback(
    (direction: -1 | 1) => {
      setModalIndex((prev) => (prev + direction + gallery.length) % gallery.length);
    },
    [gallery.length],
  );

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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-3 py-6 sm:px-4 sm:py-16">
        <main className="glass-panel animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm rounded-[2rem] p-4 text-card-foreground duration-700 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="photo-ring h-28 w-28 overflow-hidden rounded-full sm:h-48 sm:w-48">
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

            <h1 className="mt-4 text-xl font-semibold tracking-tight text-card-foreground sm:mt-5 sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-base">
              {profile.subtitle}
            </p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-card-foreground/90 sm:mt-3 sm:max-w-sm sm:text-[15px]">
              {profile.bio}
            </p>
          </div>

          {activeLinks.length > 0 && (
            <div className="mt-4 flex w-full flex-col gap-2 sm:mt-6 sm:gap-3">
              {activeLinks.map(({ key, label, icon }) => {
                const rawValue = profile[key] as string;
                const href = formatLink(key, rawValue);

                return (
                  <a
                    key={key}
                    href={href}
                    target={key === "email" || key === "phone" ? undefined : "_blank"}
                    rel={key === "email" || key === "phone" ? undefined : "noopener noreferrer"}
                    className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/65 px-3 py-3 text-sm font-medium text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/85 hover:shadow-md active:scale-[0.98] sm:px-4 sm:py-4"
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

          {vcardData && (
            <div className="mt-3 sm:mt-4">
              <button
                type="button"
                onClick={saveContact}
                className="w-full rounded-2xl border border-border/70 bg-card/85 px-4 py-3 text-sm font-semibold text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-md active:scale-[0.98] sm:py-3.5"
              >
                Enregistrer le contact
              </button>
            </div>
          )}

          {/* QR Code modal */}
          {qrOpen && vcardData && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
              onClick={() => setQrOpen(false)}
            >
              <div
                className="relative w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setQrOpen(false)}
                  className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
                <p className="mb-1 text-base font-semibold text-slate-800">
                  Scanner pour ajouter
                </p>
                <p className="mb-5 text-xs text-slate-500">
                  Pointez l'appareil photo sur le QR code
                </p>
                <div className="flex justify-center">
                  <QRCode
                    value={vcardData}
                    size={200}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
                <p className="mt-4 text-[11px] text-slate-400">
                  Compatible iPhone et Android
                </p>
              </div>
            </div>
          )}

          {(gallery.length > 0 || galleryLoading) && (
            <div className="mt-8">
              <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Gallery
              </h2>

              {galleryLoading && gallery.length === 0 ? (
                <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-slate-700/30" />
              ) : (
                <GalleryCarousel
                  gallery={gallery}
                  currentIndex={currentIndex}
                  onNavigate={navigateSlide}
                  onDotClick={setCurrentIndex}
                  onImageClick={() => {
                    setModalIndex(currentIndex);
                    setModalOpen(true);
                  }}
                />
              )}

              <GalleryModal
                gallery={gallery}
                modalIndex={modalIndex}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onNavigate={navigateModal}
              />
            </div>
          )}

          <footer className="mt-8 pb-2 text-center">
            {vcardData && (
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="mb-2 block w-full text-[11px] text-muted-foreground/70 underline underline-offset-2 transition-colors hover:text-muted-foreground"
              >
                Partager via QR code
              </button>
            )}
            <p className="text-[11px] text-muted-foreground">{profile.name} — Personal Profile</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
