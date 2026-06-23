import { useState, useCallback, useMemo, useRef } from "react";
import { Camera, Save } from "lucide-react";
import { ProfileData } from "@/types/profile";

interface ProfileFormProps {
  profile: ProfileData;
  userId: string;
  onSave: () => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  saving: boolean;
  msg: string;
  setMsg: (msg: string) => void;
}

type EditableField =
  | "name"
  | "subtitle"
  | "bio"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "website"
  | "whatsapp"
  | "email"
  | "phone";

const FIELD_LABELS: Record<EditableField, string> = {
  name: "Nom",
  subtitle: "Sous-titre",
  bio: "Bio",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  website: "Site web",
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Telephone",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/20";

export function ProfileForm({
  profile,
  userId,
  onSave,
  onUploadAvatar,
  saving,
  msg,
  setMsg,
}: ProfileFormProps) {
  void userId;

  const [draft, setDraft] = useState<ProfileData>(profile);
  const avatarRef = useRef<HTMLInputElement>(null);

  const profileFields = useMemo<EditableField[]>(
    () => [
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
    ],
    [],
  );

  const handleFieldChange = useCallback(
    (field: EditableField) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDraft((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const handleSave = useCallback(async () => {
    setMsg("");
    Object.assign(profile, draft);
    await onSave();
  }, [draft, onSave, profile, setMsg]);

  const handleAvatarPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUploadAvatar(file);
      }
      e.target.value = "";
    },
    [onUploadAvatar],
  );

  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:p-8">
      <h2 className="mb-6 text-xl font-semibold text-sky-300">Profil</h2>

      <div className="mb-6 flex items-center gap-5">
        <img
          src={profile.photo_url || "https://ui-avatars.com/api/?name=Admin"}
          alt="avatar"
          className="h-24 w-24 rounded-full border-[3px] border-sky-300/50 object-cover shadow-[0_4px_12px_rgba(56,189,248,0.3)]"
        />
        <div>
          <p className="mb-2 text-sm text-slate-400">Photo de profil</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={avatarRef}
            onChange={handleAvatarPick}
          />
          <button
            type="button"
            onClick={() => avatarRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-all hover:border-sky-300/30 hover:bg-white/[0.1]"
          >
            <Camera className="h-4 w-4" aria-hidden />
            Changer avatar
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {profileFields.map((field) => (
          <div
            key={field}
            className={`flex flex-col gap-2 ${field === "bio" ? "sm:col-span-2" : ""}`}
          >
            <label htmlFor={`field-${field}`} className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {FIELD_LABELS[field]}
            </label>
            {field === "bio" ? (
              <textarea
                id={`field-${field}`}
                value={draft[field] || ""}
                rows={3}
                className={`${inputClass} resize-y`}
                onChange={handleFieldChange(field)}
              />
            ) : (
              <input
                id={`field-${field}`}
                type="text"
                value={draft[field] || ""}
                placeholder={field === "linkedin" ? "https://linkedin.com/in/ton-profil" : ""}
                className={inputClass}
                onChange={handleFieldChange(field)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="group relative">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-sky-200 to-sky-400 opacity-40 blur-[15px] transition-opacity duration-300 group-hover:opacity-60"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="relative inline-flex items-center gap-2.5 rounded-[30px] bg-gradient-to-r from-sky-100 to-sky-200 px-7 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 hover:scale-[1.01] hover:from-sky-50 hover:to-sky-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
        {msg && (
          <p
            role="status"
            className={`text-sm ${msg.toLowerCase().includes("erreur") ? "text-rose-300" : "text-emerald-300"}`}
          >
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}