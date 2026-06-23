import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGallery } from "@/hooks/useGallery";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { BackgroundControls } from "@/components/admin/BackgroundControls";
import { GalleryManager } from "@/components/admin/GalleryManager";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - NFC Profile" },
      {
        name: "description",
        content: "Tableau de bord d'administration pour les profils NFC",
      },
    ],
  }),
  component: AdminPage,
});

function LoadingShell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_80%_20%,#1a2c4c_0%,#0b111e_60%)] px-5 py-10 text-white sm:px-6 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]"
      />
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="mb-4 text-base font-bold uppercase tracking-[0.2em] text-sky-300 sm:text-lg">
          NFC Card Admin
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const { userId, loading: checkingAuth, handleLogout } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    updateAvatar,
    updateBackground,
    isUpdatingProfile,
    isUpdatingAvatar,
    isUpdatingBackground,
  } = useProfile(userId || "");
  const {
    gallery,
    isLoading: isGalleryLoading,
    addGalleryItem,
    deleteGalleryItem,
    isAddingGalleryItem,
    isDeletingGalleryItem,
  } = useGallery(profile?.id || "");

  const [msg, setMsg] = useState("");
  const [newCaption, setNewCaption] = useState("");

  useEffect(() => {
    if (!checkingAuth && !userId) {
      navigate({ to: "/auth" });
    }
  }, [checkingAuth, userId, navigate]);

  if (checkingAuth || isProfileLoading || isGalleryLoading) {
    return <LoadingShell title="Chargement..." subtitle="Connexion en cours." />;
  }

  if (!userId) {
    return null;
  }

  if (!profile) {
    return (
      <LoadingShell title="Profil introuvable" subtitle="Aucun profil lie a ce compte." />
    );
  }

  const isSaving =
    isUpdatingProfile ||
    isUpdatingAvatar ||
    isUpdatingBackground ||
    isAddingGalleryItem ||
    isDeletingGalleryItem;

  const saveProfile = async () => {
    setMsg("");
    try {
      await updateProfile({
        name: profile.name || "",
        subtitle: profile.subtitle || "",
        bio: profile.bio || "",
        instagram: profile.instagram || "",
        tiktok: profile.tiktok || "",
        linkedin: profile.linkedin || "",
        website: profile.website || "",
        whatsapp: profile.whatsapp || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
      setMsg("Profil sauvegarde !");
    } catch (err) {
      setMsg("Erreur : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const uploadAvatar = async (file: File) => {
    setMsg("");
    try {
      await updateAvatar(file);
      setMsg("Avatar mis a jour !");
    } catch (err) {
      setMsg("Erreur avatar : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const uploadGalleryPhoto = async (file: File, caption: string) => {
    setMsg("");
    try {
      await addGalleryItem({ file, caption });
      setNewCaption("");
      setMsg("Photo ajoutee !");
    } catch (err) {
      setMsg("Erreur galerie : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    setMsg("");
    try {
      await deleteGalleryItem(itemId);
      setMsg("Photo supprimee");
    } catch (err) {
      setMsg("Erreur suppression : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const saveBackground = async (payload: {
    type: "solid" | "gradient" | "image";
    value: string;
    opacity: number;
  }) => {
    setMsg("");
    try {
      await updateBackground(payload);
      setMsg("Fond sauvegarde !");
    } catch (err) {
      setMsg("Erreur fond : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_80%_20%,#1a2c4c_0%,#0b111e_60%)] px-5 py-10 text-white sm:px-6 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]"
      />

      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center sm:mb-12">
          <p className="mb-3 text-base font-bold uppercase tracking-[0.2em] text-sky-300 sm:text-lg">
            NFC Card Admin
          </p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Parametres du profil
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Mets a jour les informations de ta carte, le fond et la galerie.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/$slug"
            params={{ slug: profile.slug }}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/30 hover:bg-white/[0.08] hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voir le profil
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300/30 hover:bg-white/[0.08] hover:text-rose-200 hover:shadow-md"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Deconnexion
          </button>
        </div>

        <ProfileForm
          profile={profile}
          userId={userId}
          onSave={saveProfile}
          onUploadAvatar={uploadAvatar}
          saving={isUpdatingProfile || isUpdatingAvatar}
          msg={msg}
          setMsg={setMsg}
        />

        <BackgroundControls
          profile={profile}
          userId={userId}
          onSaveBackground={saveBackground}
          saving={isUpdatingBackground}
          msg={msg}
          setMsg={setMsg}
        />

        <GalleryManager
          profile={profile}
          userId={userId}
          gallery={gallery}
          newCaption={newCaption}
          setNewCaption={setNewCaption}
          onUploadGalleryPhoto={uploadGalleryPhoto}
          onDeleteGalleryItem={handleDeleteGalleryItem}
          saving={isAddingGalleryItem || isDeletingGalleryItem}
          msg={msg}
          setMsg={setMsg}
        />

        {isSaving && (
          <p className="mt-6 text-center text-sm text-slate-400">Sauvegarde en cours...</p>
        )}
      </div>
    </div>
  );
}