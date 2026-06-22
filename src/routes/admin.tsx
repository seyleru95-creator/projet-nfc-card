import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type ProfileData = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  subtitle: string;
  bio: string;
  photo_url: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
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

function AdminPage() {
  // --------------------------------------------------
  // Logique globale :
  // 1. Vérifier si un utilisateur Supabase est connecté
  // 2. Si non, rediriger vers /auth
  // 3. Si oui, afficher le vrai dashboard admin
  // 4. Toutes les données sont chargées selon le user connecté
  // --------------------------------------------------

  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: "/auth" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      navigate({ to: "/auth" });
      return;
    }

    const { data: userData, error } = await supabase.auth.getUser();

    if (error || !userData.user) {
      navigate({ to: "/auth" });
      return;
    }

    setUserId(userData.user.id);
    setCheckingAuth(false);
  }

  if (checkingAuth) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.authForm}>
          <h1 style={styles.authTitle}>Vérification...</h1>
          <p style={{ color: "#cbd5e1", margin: 0, textAlign: "center" }}>
            Connexion en cours.
          </p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <AdminDashboard userId={userId} />;
}

function AdminDashboard({ userId }: { userId: string }) {
  // --------------------------------------------------
  // Logique globale :
  // 1. Charger le profil du user connecté
  // 2. Charger la galerie liée à ce profil
  // 3. Sauvegarder les changements sans ID en dur
  // 4. Garder l'interface existante pour ne pas casser ton flow
  // --------------------------------------------------

  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newCaption, setNewCaption] = useState("");

  const [bgType, setBgType] = useState<"solid" | "gradient" | "image">("gradient");
  const [bgColor1, setBgColor1] = useState("#7c6bda");
  const [bgColor2, setBgColor2] = useState("#5b4fc8");
  const [bgDirection, setBgDirection] = useState("circle at top");
  const [bgOpacity, setBgOpacity] = useState(45);
  const [bgImageUrl, setBgImageUrl] = useState("");

  const avatarRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (profile?.id) {
      loadGallery(profile.id);
    }
  }, [profile?.id]);

  async function loadProfile() {
    setMsg("");

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Erreur loadProfile:", error.message);
      setMsg("Erreur chargement profil : " + error.message);
      return;
    }

    const normalized: ProfileData = {
      id: data.id,
      user_id: data.user_id,
      slug: data.slug || "",
      name: data.name || "",
      subtitle: data.subtitle || "",
      bio: data.bio || "",
      photo_url: data.photo_url || "",
      instagram: data.instagram || "",
      tiktok: data.tiktok || "",
      linkedin: data.linkedin || "",
      website: data.website || "",
      whatsapp: data.whatsapp || "",
      email: data.email || "",
      phone: data.phone || "",
      background_type: data.background_type || "gradient",
      background_value: data.background_value || "",
      background_opacity: data.background_opacity ?? 45,
    };

    setProfile(normalized);

    if (normalized.background_type) setBgType(normalized.background_type);
    if (normalized.background_opacity !== null) setBgOpacity(normalized.background_opacity);

    if (normalized.background_value) {
      const val = normalized.background_value;

      if (normalized.background_type === "solid") {
        setBgColor1(val);
      } else if (normalized.background_type === "gradient") {
        const colorMatches = val.match(/#[0-9a-fA-F]{6}/g);
        if (colorMatches && colorMatches.length >= 2) {
          setBgColor1(colorMatches[0]);
          setBgColor2(colorMatches[1]);
        }

        if (val.startsWith("radial")) setBgDirection("circle at top");
        else if (val.includes("to bottom right")) setBgDirection("to bottom right");
        else if (val.includes("to right")) setBgDirection("to right");
        else setBgDirection("to bottom");
      } else if (normalized.background_type === "image") {
        const urlMatch = val.match(/url\(["']?(.*?)["']?\)/);
        if (urlMatch?.[1]) setBgImageUrl(urlMatch[1]);
      }
    }
  }

  async function loadGallery(profileId: string) {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("profile_id", profileId)
      .order("id", { ascending: false });

    if (error) {
      console.error("Erreur loadGallery:", error.message);
      setMsg("Erreur chargement galerie : " + error.message);
      return;
    }

    setGallery((data || []) as GalleryItem[]);
  }

  async function saveProfile() {
    if (!profile) return;

    setSaving(true);
    setMsg("");

    const payload = {
      name: profile.name,
      subtitle: profile.subtitle,
      bio: profile.bio,
      instagram: profile.instagram,
      tiktok: profile.tiktok,
      linkedin: profile.linkedin,
      website: profile.website,
      whatsapp: profile.whatsapp,
      email: profile.email,
      phone: profile.phone,
    };

    const { error } = await supabase
      .from("profile")
      .update(payload)
      .eq("id", profile.id)
      .eq("user_id", userId);

    setSaving(false);

    if (error) {
      setMsg("Erreur : " + error.message);
    } else {
      setMsg("Profil sauvegardé !");
    }
  }

  async function uploadAvatar(file: File) {
    if (!profile) return;

    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("profile")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setMsg("Erreur avatar : " + upErr.message);
      return;
    }

    const { data } = supabase.storage.from("profile").getPublicUrl(path);
    const photo_url = data.publicUrl + "?t=" + Date.now();

    const { error } = await supabase
      .from("profile")
      .update({ photo_url })
      .eq("id", profile.id)
      .eq("user_id", userId);

    if (error) {
      setMsg("Erreur MAJ avatar : " + error.message);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, photo_url } : prev));
    setMsg("Avatar mis à jour !");
  }

  async function uploadGalleryPhoto(file: File) {
    if (!profile) return;

    const path = `gallery/${profile.id}-${Date.now()}-${file.name}`;

    const { error: upErr } = await supabase.storage
      .from("gallery")
      .upload(path, file);

    if (upErr) {
      setMsg("Erreur galerie : " + upErr.message);
      return;
    }

    const { data } = supabase.storage.from("gallery").getPublicUrl(path);

    const { error: dbErr } = await supabase.from("gallery").insert({
      profile_id: profile.id,
      image_url: data.publicUrl,
      caption: newCaption || file.name,
    });

    if (dbErr) {
      setMsg("Erreur DB galerie : " + dbErr.message);
      return;
    }

    setNewCaption("");
    setMsg("Photo ajoutée !");
    loadGallery(profile.id);
  }

  async function deleteGalleryItem(item: GalleryItem) {
    if (!profile) return;

    const urlParts = item.image_url.split("/gallery/");

    if (urlParts[1]) {
      await supabase.storage.from("gallery").remove([urlParts[1]]);
    }

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", item.id)
      .eq("profile_id", profile.id);

    if (error) {
      setMsg("Erreur suppression : " + error.message);
      return;
    }

    setGallery((g) => g.filter((x) => x.id !== item.id));
    setMsg("Photo supprimée");
  }

  async function saveBg() {
    if (!profile) return;

    let value = "";

    if (bgType === "solid") {
      value = bgColor1;
    } else if (bgType === "gradient") {
      value =
        bgDirection === "circle at top"
          ? `radial-gradient(circle at top, ${bgColor1}, ${bgColor2})`
          : `linear-gradient(${bgDirection}, ${bgColor1}, ${bgColor2})`;
    } else {
      value = `url(${bgImageUrl})`;
    }

    const { error } = await supabase
      .from("profile")
      .update({
        background_type: bgType,
        background_value: value,
        background_opacity: bgOpacity,
      })
      .eq("id", profile.id)
      .eq("user_id", userId);

    if (error) setMsg("Erreur fond : " + error.message);
    else setMsg("Fond sauvegardé !");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMsg("Erreur déconnexion : " + error.message);
      return;
    }

    navigate({ to: "/auth" });
  }

  const bgPreview =
    bgType === "solid"
      ? bgColor1
      : bgType === "gradient"
        ? bgDirection === "circle at top"
          ? `radial-gradient(circle at top, ${bgColor1}, ${bgColor2})`
          : `linear-gradient(${bgDirection}, ${bgColor1}, ${bgColor2})`
        : bgImageUrl
          ? `url(${bgImageUrl})`
          : "#1e1b4b";

  if (!profile) {
    return <p style={{ color: "white", padding: 32 }}>Chargement...</p>;
  }

  const profileFields: (keyof ProfileData)[] = [
    "name",
    "subtitle",
    "bio",
    "instagram",
    "tiktok",
    "linkedin",
    "website",
    "whatsapp",
    "email",
    "phone",
  ];

  return (
    <div style={styles.page}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ ...styles.h1, marginBottom: 0 }}>Paramètres du profil</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/$slug"
            params={{ slug: profile.slug }}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-card/65 px-4 py-2.5 text-sm font-medium text-card-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/85 hover:shadow-md"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voir le profil
          </Link>

          <button type="button" onClick={handleLogout} style={styles.btnSecondary}>
            Déconnexion
          </button>
        </div>
      </div>

      <section style={styles.card}>
        <h2 style={styles.h2}>Profil</h2>

        <div style={styles.avatarRow}>
          <img
            src={profile.photo_url || "https://ui-avatars.com/api/?name=Admin"}
            alt="avatar"
            style={styles.avatarImg}
          />

          <div>
            <p style={styles.avatarLabel}>Photo de profil</p>
            <input
              type="file"
              accept="image/*"
              ref={avatarRef}
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) uploadAvatar(e.target.files[0]);
              }}
            />
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => avatarRef.current?.click()}
            >
              Changer avatar
            </button>
          </div>
        </div>

        {profileFields.map((field) => (
          <div key={field} style={{ marginBottom: 10 }}>
            <label style={styles.label}>{field}</label>

            {field === "bio" ? (
              <textarea
                value={(profile[field] as string) || ""}
                rows={3}
                style={{ ...styles.input, resize: "vertical" }}
                onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              />
            ) : (
              <input
                type="text"
                value={(profile[field] as string) || ""}
                style={styles.input}
                placeholder={field === "linkedin" ? "https://linkedin.com/in/ton-profil" : ""}
                onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              />
            )}
          </div>
        ))}

        <button onClick={saveProfile} disabled={saving} style={styles.btnPrimary}>
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>

        {msg !== "" && (
          <p
            style={{
              color: msg.toLowerCase().includes("erreur") ? "#fca5a5" : "#86efac",
              marginTop: 8,
              fontSize: 13,
            }}
          >
            {msg}
          </p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>Fond de la carte</h2>

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Type de fond</label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["solid", "gradient", "image"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBgType(t)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: bgType === t ? "2px solid #a78bfa" : "2px solid #334155",
                  background: bgType === t ? "#3b1fa3" : "#0f172a",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: bgType === t ? 600 : 400,
                }}
              >
                {t === "solid" ? "Uni" : t === "gradient" ? "Dégradé" : "Image"}
              </button>
            ))}
          </div>
        </div>

        {bgType === "solid" && (
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Couleur</label>
            <input
              type="color"
              value={bgColor1}
              onChange={(e) => setBgColor1(e.target.value)}
              style={{ width: "100%", height: 48, borderRadius: 8, border: "none", cursor: "pointer" }}
            />
          </div>
        )}

        {bgType === "gradient" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Couleur 1</label>
                <input
                  type="color"
                  value={bgColor1}
                  onChange={(e) => setBgColor1(e.target.value)}
                  style={{ width: "100%", height: 48, borderRadius: 8, border: "none", cursor: "pointer" }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.label}>Couleur 2</label>
                <input
                  type="color"
                  value={bgColor2}
                  onChange={(e) => setBgColor2(e.target.value)}
                  style={{ width: "100%", height: 48, borderRadius: 8, border: "none", cursor: "pointer" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Direction</label>
              <select
                value={bgDirection}
                onChange={(e) => setBgDirection(e.target.value)}
                style={{ ...styles.input, cursor: "pointer" }}
              >
                <option value="circle at top">Radial</option>
                <option value="to bottom">Vertical</option>
                <option value="to right">Horizontal</option>
                <option value="to bottom right">Diagonal</option>
              </select>
            </div>
          </>
        )}

        {bgType === "image" && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Image de fond</label>

              <input
                type="file"
                accept="image/*"
                id="bg-upload"
                style={{ display: "none" }}
                onChange={async (e) => {
                  if (!profile) return;

                  const file = e.target.files?.[0];
                  if (!file) return;

                  const path = `backgrounds/${profile.id}-${Date.now()}-${file.name}`;

                  const { data, error } = await supabase.storage
                    .from("profile")
                    .upload(path, file, { upsert: true });

                  if (error) {
                    setMsg("Erreur upload fond : " + error.message);
                    return;
                  }

                  const { data: urlData } = supabase.storage
                    .from("profile")
                    .getPublicUrl(data.path);

                  setBgImageUrl(urlData.publicUrl);
                  setMsg("Image chargée, clique Sauvegarder.");
                }}
              />

              <label
                htmlFor="bg-upload"
                style={{
                  display: "inline-block",
                  background: "#334155",
                  color: "white",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Choisir une image
              </label>

              {bgImageUrl && (
                <img
                  src={bgImageUrl}
                  alt="Aperçu fond"
                  style={{
                    marginTop: 8,
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Overlay sombre : {bgOpacity}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Aperçu</label>
          <div
            style={{
              height: 80,
              borderRadius: 12,
              background: bgPreview,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid #334155",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {bgType === "image" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: `rgba(10, 8, 20, ${bgOpacity / 100})`,
                }}
              />
            )}
          </div>
        </div>

        <button onClick={saveBg} style={styles.btnPrimary}>
          Sauvegarder le fond
        </button>
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>Galerie</h2>

        <div style={styles.galleryAddRow}>
          <input
            type="text"
            placeholder="Légende optionnelle"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            style={{ ...styles.input, flex: 1, minWidth: 140 }}
          />

          <input
            type="file"
            accept="image/*"
            ref={galleryRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) uploadGalleryPhoto(e.target.files[0]);
            }}
          />

          <button
            type="button"
            style={styles.btnPrimary}
            onClick={() => galleryRef.current?.click()}
          >
            Ajouter photo
          </button>
        </div>

        <div style={styles.galleryGrid}>
          {gallery.map((item) => (
            <div key={item.id} style={styles.galleryItem}>
              <img src={item.image_url} alt={item.caption} style={styles.galleryImg} />
              <div style={styles.galleryCaption}>{item.caption}</div>
              <button
                type="button"
                onClick={() => deleteGalleryItem(item)}
                style={styles.deleteBtn}
              >
                ✕
              </button>
            </div>
          ))}

          {gallery.length === 0 && (
            <p style={{ color: "#475569", fontSize: 13 }}>Aucune photo</p>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  authWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  authForm: {
    background: "rgba(30, 41, 59, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    padding: 32,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  },
  authTitle: {
    color: "white",
    textAlign: "center",
    margin: "0 0 12px 0",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "32px 16px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(30, 41, 59, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
  },
  h1: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
    background: "linear-gradient(to right, #6366f1, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  h2: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    color: "#c7d2fe",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 12,
    padding: "14px 16px",
    color: "white",
    fontSize: 15,
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  btnPrimary: {
    background: "linear-gradient(to right, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(99, 102, 241, 0.5)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    "&:disabled": {
      opacity: "0.6",
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    },
  },
  btnSecondary: {
    background: "rgba(51, 65, 85, 0.6)",
    color: "white",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(51, 65, 85, 0.8)",
      transform: "translateY(-2px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  errText: {
    color: "#f87171",
    margin: "8px 0 0 0",
    fontSize: 13,
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #6366f1",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  avatarLabel: {
    color: "#94a3b8",
    fontSize: 14,
    margin: "0 0 8px 0",
  },
  galleryAddRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
  },
  galleryItem: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
    },
  },
  galleryImg: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  galleryCaption: {
    padding: "8px 12px",
    fontSize: 12,
    color: "#94a3b8",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    background: "rgba(15, 23, 42, 0.6)",
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(239, 68, 68, 0.8)",
    border: "none",
    borderRadius: "50%",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#ef4444",
      transform: "scale(1.1)",
    },
  },
};