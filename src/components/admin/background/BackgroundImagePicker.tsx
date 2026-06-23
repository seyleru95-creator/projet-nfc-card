import { memo, useCallback, useRef } from "react";

interface BackgroundImagePickerProps {
  imageUrl: string;
  opacity: number;
  uploading: boolean;
  onPick: (file: File) => void;
  onOpacityChange: (value: number) => void;
}

function BackgroundImagePickerImpl({
  imageUrl,
  opacity,
  uploading,
  onPick,
  onOpacityChange,
}: BackgroundImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onPick(file);
      e.target.value = "";
    },
    [onPick],
  );

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Image de fond</label>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          id="bg-upload"
          style={{ display: "none" }}
          onChange={handleFile}
          disabled={uploading}
        />

        <label htmlFor="bg-upload" style={uploadButtonStyle}>
          {uploading ? "Envoi en cours..." : "Choisir une image"}
        </label>

        {imageUrl && (
          <img
            src={imageUrl}
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
        <label style={labelStyle}>Overlay sombre : {opacity}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  color: "#94a3b8",
  marginBottom: 6,
  fontWeight: 500,
} as const;

const uploadButtonStyle = {
  display: "inline-block",
  background: "#334155",
  color: "white",
  borderRadius: 8,
  padding: "8px 16px",
  fontSize: 13,
  cursor: "pointer",
} as const;

export const BackgroundImagePicker = memo(BackgroundImagePickerImpl);
