code = """import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PASSWORD = "123";
const PROFILE_ID = "63f004d7-46e9-4f4f-8e23-a4fba1118bde";

type Profile = {
  id: string;
  name: string;
  subtitle: string;
  bio: string;
  photo_url: string | null;
  instagram: string;
  whatsapp: string;
  email: string;
  phone: string;
};

type GalleryItem = {
  id: number;
  url: string;
  caption: string;
};

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [authOk, setAuthOk] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (!authOk) {
    return (
      <div style={styles.authWrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === ADMIN_PASSWORD) {
              setAuthOk(true);
            } else {
              setErr("Code incorrect");
            }
          }}
          style={styles.authForm}
        >
          <h1 style={styles.authTitle}>Admin</h1>
          <input
            type="password"
            placeholder="Code admin"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={styles.input}
          />
          {err && <p style={styles.errText}>{err}</p>}
          <button type="submit" style={styles.btnPrimary}>
            Entrer
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newCaption, setNewCaption] = useState("");

  const avatarRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
    loadGallery();
  }, []);

  async function loadProfile() {
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", PROFILE_ID)
      .single();
    if (error) {
      console.error("Erreur loadProfile:", error.message);
    } else {
      setProfile(data);
    }
  }

  async function loadGallery() {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.error("Erreur loadGallery:", error.message);
    } else {
      setGallery(data);
    }
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("profile")
      .update({
        name: profile.name,
        subtitle: profile.subtitle,
        bio: profile.bio,
        instagram: profile.instagram,
        whatsapp: profile.whatsapp,
        email: profile.email,
        phone: profile.phone,
      })
      .eq("id", PROFILE_ID);
    setSaving(false);
    if (error) {
      setMsg("Erreur : " + error.message);
    } else {
      setMsg("Profil sauvegarde !");
    }
  }

  async function uploadAvatar(file: File) {
    const ext = file.name.split(".").pop();
    const path = "avatars/profile." + ext;
    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setMsg("Erreur avatar : " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    const photo_url = data.publicUrl + "?t=" + Date.now();
    await supabase.from("profile").update({ photo_url }).eq("id", PROFILE_ID);
    setProfile((p) => (p ? { ...p, photo_url } : p));
    setMsg("Avatar mis a jour !");
  }

  async function uploadGalleryPhoto(file: File) {
    const path = "gallery/" + Date.now() + "_" + file.name;
    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file);
    if (upErr) {
      setMsg("Erreur galerie : " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("gallery").insert({
      url: data.publicUrl,
      caption: newCaption || file.name,
    });
    if (dbErr) {
      setMsg("Erreur DB galerie : " + dbErr.message);
      return;
    }
    setNewCaption("");
    setMsg("Photo ajoutee !");
    loadGallery();
  }

  async function deleteGalleryItem(item: GalleryItem) {
    const urlParts = item.url.split("/media/");
    if (urlParts[1]) {
      await supabase.storage.from("media").remove([urlParts[1]]);
    }
    await supabase.from("gallery").delete().eq("id", item.id);
    setGallery((g) => g.filter((x) => x.id !== item.id));
    setMsg("Photo supprimee");
  }

  if (!profile) {
    return <p style={{ color: "white", padding: 32 }}>Chargement...</p>;
  }

  const profileFields: (keyof Profile)[] = [
    "name",
    "subtitle",
    "bio",
    "instagram",
    "whatsapp",
    "email",
    "phone",
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Back-office</h1>
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
                if (e.target.files && e.target.files[0]) {
                  uploadAvatar(e.target.files[0]);
                }
              }}
            />
            <button
              style={styles.btnSecondary}
              onClick={() => avatarRef.current && avatarRef.current.click()}
            >
              Changer avatar
            </button>
          </div>
        </div>
        {profileFields.map((field) => (
          <div key={field} style={{ marginBottom: 10 }}>
            abel style={styles.label}>{field}</label>
            {field === "bio" ? (
              <textarea
                value={(profile[field] as string) || ""}
                rows={3}
                style={{ ...styles.input, resize: "vertical" } as React.CSSProperties}
                onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              />
            ) : (
              <input
                type="text"
                value={(profile[field] as string) || ""}
                style={styles.input}
                onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              />
            )}
          </div>
        ))}
        <button onClick={saveProfile} disabled={saving} style={styles.btnPrimary}>
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {msg !== "" && (
          <p style={{ color: "#86efac", marginTop: 8, fontSize: 13 }}>{msg}</p>
        )}
      </section>
      <section style={styles.card}>
        <h2 style={styles.h2}>Galerie</h2>
        <div style={styles.galleryAddRow}>
          <input
            type="text"
            placeholder="Legende optionnelle"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            style={{ ...styles.input, flex: 1, minWidth: 140 } as React.CSSProperties}
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                uploadGalleryPhoto(e.target.files[0]);
              }
            }}
          />
          <button
            style={styles.btnPrimary}
            onClick={() => galleryRef.current && galleryRef.current.click()}
          >
            Ajouter photo
          </button>
        </div>
        <div style={styles.galleryGrid}>
          {gallery.map((item) => (
            <div key={item.id} style={styles.galleryItem}>
              <img src={item.url} alt={item.caption} style={styles.galleryImg} />
              <div style={styles.galleryCaption}>{item.caption}</div>
              <button onClick={() => deleteGalleryItem(item)} style={styles.deleteBtn}>
                X
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
  authWrapper: { minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" },
  authForm: { background: "#1e293b", padding: 32, borderRadius: 16, display: "flex", flexDirection: "column", gap: 12, width: 280 },
  authTitle: { color: "white", textAlign: "center", margin: 0 },
  page: { minHeight: "100vh", background: "#0f172a", color: "white", padding: 32, maxWidth: 800, margin: "0 auto" },
  card: { background: "#1e293b", borderRadius: 16, padding: 24, marginBottom: 24 },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  h2: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#a5b4fc" },
  label: { display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4, textTransform: "capitalize" },
  input: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 14, boxSizing: "border-box" },
  btnPrimary: { background: "#6366f1", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" },
  btnSecondary: { background: "#334155", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  errText: { color: "#f87171", margin: 0, fontSize: 12 },
  avatarRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  avatarImg: { width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid #6366f1" },
  avatarLabel: { color: "#94a3b8", fontSize: 12, margin: "0 0 6px" },
  galleryAddRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 },
  galleryItem: { position: "relative", borderRadius: 8, overflow: "hidden", background: "#0f172a" },
  galleryImg: { width: "100%", height: 120, objectFit: "cover", display: "block" },
  galleryCaption: { padding: "4px 8px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  deleteBtn: { position: "absolute", top: 4, right: 4, background: "#ef4444", border: "none", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 12, padding: "2px 6px" },
};
"""

with open("/Users/lousiffredi/Downloads/projet-nfc-card/src/routes/admin.tsx", "w") as f:
    f.write(code)

print("Fichier ecrit avec succes !")
