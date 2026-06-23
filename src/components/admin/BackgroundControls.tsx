import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileData } from "@/types/profile";
import {
  BgType,
  BgDirection,
  ParsedBackground,
  parseBackground,
  buildBackgroundValue,
  buildBackgroundPreview,
} from "@/lib/profile-utils";
import { useBackgroundUploader } from "@/hooks/useBackgroundUploader";
import { BackgroundTypePicker } from "./background/BackgroundTypePicker";
import { BackgroundColorControls } from "./background/BackgroundColorControls";
import { BackgroundImagePicker } from "./background/BackgroundImagePicker";
import { BackgroundPreview } from "./background/BackgroundPreview";

interface BackgroundControlsProps {
  profile: ProfileData;
  onSaveBackground: (payload: { type: BgType; value: string; opacity: number }) => Promise<void>;
  saving: boolean;
  msg: string;
  setMsg: (msg: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
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
  h2: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    color: "#c7d2fe",
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
  },
};

function applyInitial(initial: ParsedBackground) {
  return {
    type: initial.type,
    color1: initial.color1,
    color2: initial.color2,
    direction: initial.direction,
    opacity: initial.opacity,
    imageUrl: initial.imageUrl,
  };
}

export function BackgroundControls({
  profile,
  onSaveBackground,
  saving,
  msg,
  setMsg,
}: BackgroundControlsProps) {
  const initial = useMemo(() => parseBackground(profile), [profile]);

  const [bgType, setBgType] = useState<BgType>(initial.type);
  const [bgColor1, setBgColor1] = useState(initial.color1);
  const [bgColor2, setBgColor2] = useState(initial.color2);
  const [bgDirection, setBgDirection] = useState<BgDirection>(initial.direction);
  const [bgOpacity, setBgOpacity] = useState(initial.opacity);
  const [bgImageUrl, setBgImageUrl] = useState(initial.imageUrl);

  useEffect(() => {
    const next = applyInitial(initial);
    setBgType(next.type);
    setBgColor1(next.color1);
    setBgColor2(next.color2);
    setBgDirection(next.direction);
    setBgOpacity(next.opacity);
    setBgImageUrl(next.imageUrl);
  }, [initial]);

  const { uploadBackgroundImage, uploading } = useBackgroundUploader(profile.id);

  const handleImagePick = useCallback(
    async (file: File) => {
      try {
        setMsg("");
        const publicUrl = await uploadBackgroundImage(file);
        setBgImageUrl(publicUrl);
        setMsg("Image uploadee, cliquez Sauvegarder le fond.");
      } catch (err) {
        setMsg("Erreur upload image : " + (err instanceof Error ? err.message : String(err)));
      }
    },
    [uploadBackgroundImage, setMsg],
  );

  const handleSave = useCallback(async () => {
    setMsg("");
    const value = buildBackgroundValue(bgType, bgColor1, bgColor2, bgDirection, bgImageUrl);
    await onSaveBackground({ type: bgType, value, opacity: bgOpacity });
  }, [bgType, bgColor1, bgColor2, bgDirection, bgImageUrl, bgOpacity, onSaveBackground, setMsg]);

  const preview = useMemo(
    () => buildBackgroundPreview(bgType, bgColor1, bgColor2, bgDirection, bgImageUrl),
    [bgType, bgColor1, bgColor2, bgDirection, bgImageUrl],
  );

  return (
    <section style={styles.card}>
      <h2 style={styles.h2}>Fond de la carte</h2>

      <BackgroundTypePicker value={bgType} onChange={setBgType} />

      {bgType === "solid" && (
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              color: "#94a3b8",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Couleur
          </label>
          <input
            type="color"
            value={bgColor1}
            onChange={(e) => setBgColor1(e.target.value)}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          />
        </div>
      )}

      {bgType === "gradient" && (
        <BackgroundColorControls
          color1={bgColor1}
          color2={bgColor2}
          direction={bgDirection}
          onColor1Change={setBgColor1}
          onColor2Change={setBgColor2}
          onDirectionChange={setBgDirection}
        />
      )}

      {bgType === "image" && (
        <BackgroundImagePicker
          imageUrl={bgImageUrl}
          opacity={bgOpacity}
          uploading={uploading}
          onPick={handleImagePick}
          onOpacityChange={setBgOpacity}
        />
      )}

      <BackgroundPreview type={bgType} preview={preview} opacity={bgOpacity} />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || uploading}
        style={styles.btnPrimary}
      >
        {saving ? "Sauvegarde..." : "Sauvegarder le fond"}
      </button>

      {msg && (
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
  );
}
