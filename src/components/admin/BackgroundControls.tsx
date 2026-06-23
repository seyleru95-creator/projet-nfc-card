import { useEffect, useState, useCallback, useMemo } from "react";
import { ProfileData } from "@/types/profile";

type BgType = "solid" | "gradient" | "image";
type BgDirection = "circle at top" | "to bottom" | "to right" | "to bottom right";

interface BackgroundControlsProps {
  profile: ProfileData;
  userId: string;
  onSaveBackground: (payload: { type: BgType; value: string; opacity: number }) => Promise<void>;
  saving: boolean;
  msg: string;
  setMsg: (msg: string) => void;
}

const COLOR_HEX = /#[0-9a-fA-F]{6}/g;
const URL_RE = /url\(["']?(.*?)["']?\)/;

function parseBackground(profile: ProfileData): {
  type: BgType;
  color1: string;
  color2: string;
  direction: BgDirection;
  opacity: number;
  imageUrl: string;
} {
  const value = profile.background_value || "";
  const type: BgType = profile.background_type || "gradient";

  let color1 = "#7c6bda";
  let color2 = "#5b4fc8";
  let direction: BgDirection = "circle at top";
  let imageUrl = "";

  if (type === "solid") {
    color1 = value || color1;
  } else if (type === "gradient") {
    const matches = value.match(COLOR_HEX);
    if (matches && matches.length >= 2) {
      color1 = matches[0];
      color2 = matches[1];
    }
    if (value.startsWith("radial")) direction = "circle at top";
    else if (value.includes("to bottom right")) direction = "to bottom right";
    else if (value.includes("to right")) direction = "to right";
    else direction = "to bottom";
  } else if (type === "image") {
    const m = value.match(URL_RE);
    if (m?.[1]) imageUrl = m[1];
  }

  return {
    type,
    color1,
    color2,
    direction,
    opacity: profile.background_opacity ?? 45,
    imageUrl,
  };
}

export function BackgroundControls({
  profile,
  userId,
  onSaveBackground,
  saving,
  msg,
  setMsg,
}: BackgroundControlsProps) {
  void userId;

  const initial = useMemo(() => parseBackground(profile), [profile]);

  const [bgType, setBgType] = useState<BgType>(initial.type);
  const [bgColor1, setBgColor1] = useState(initial.color1);
  const [bgColor2, setBgColor2] = useState(initial.color2);
  const [bgDirection, setBgDirection] = useState<BgDirection>(initial.direction);
  const [bgOpacity, setBgOpacity] = useState(initial.opacity);
  const [bgImageUrl, setBgImageUrl] = useState(initial.imageUrl);

  useEffect(() => {
    setBgType(initial.type);
    setBgColor1(initial.color1);
    setBgColor2(initial.color2);
    setBgDirection(initial.direction);
    setBgOpacity(initial.opacity);
    setBgImageUrl(initial.imageUrl);
  }, [initial]);

  const buildValue = useCallback((): string => {
    if (bgType === "solid") return bgColor1;
    if (bgType === "gradient") {
      return bgDirection === "circle at top"
        ? `radial-gradient(circle at top, ${bgColor1}, ${bgColor2})`
        : `linear-gradient(${bgDirection}, ${bgColor1}, ${bgColor2})`;
    }
    return `url(${bgImageUrl})`;
  }, [bgType, bgColor1, bgColor2, bgDirection, bgImageUrl]);

  const bgPreview = useMemo(() => {
    if (bgType === "solid") return bgColor1;
    if (bgType === "gradient") {
      return bgDirection === "circle at top"
        ? `radial-gradient(circle at top, ${bgColor1}, ${bgColor2})`
        : `linear-gradient(${bgDirection}, ${bgColor1}, ${bgColor2})`;
    }
    return bgImageUrl ? `url(${bgImageUrl})` : "#1e1b4b";
  }, [bgType, bgColor1, bgColor2, bgDirection, bgImageUrl]);

  const handleDirectionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setBgDirection(e.target.value as BgDirection);
  }, []);

  const handleSave = useCallback(async () => {
    setMsg("");
    await onSaveBackground({
      type: bgType,
      value: buildValue(),
      opacity: bgOpacity,
    });
  }, [bgType, buildValue, bgOpacity, onSaveBackground, setMsg]);

  const handleImagePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImageUrl(reader.result as string);
        setMsg("Image chargee, cliquez Sauvegarder le fond.");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [setMsg],
  );

  return (
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
              {t === "solid" ? "Uni" : t === "gradient" ? "Degrade" : "Image"}
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
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Couleur 1</label>
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

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Couleur 2</label>
              <input
                type="color"
                value={bgColor2}
                onChange={(e) => setBgColor2(e.target.value)}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Direction</label>
            <select
              value={bgDirection}
              onChange={handleDirectionChange}
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
              onChange={handleImagePick}
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
                alt="Apercu fond"
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
        <label style={styles.label}>Apercu</label>
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

      <button onClick={handleSave} disabled={saving} style={styles.btnPrimary}>
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
  },
};
