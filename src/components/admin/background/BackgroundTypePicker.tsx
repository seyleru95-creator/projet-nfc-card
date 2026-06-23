import { memo } from "react";
import { BgType, BG_TYPE_LABELS } from "@/lib/profile-utils";

interface BackgroundTypePickerProps {
  value: BgType;
  onChange: (type: BgType) => void;
}

const TYPES: BgType[] = ["solid", "gradient", "image"];

function BackgroundTypePickerImpl({ value, onChange }: BackgroundTypePickerProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>Type de fond</label>
      <div style={{ display: "flex", gap: 8 }}>
        {TYPES.map((t) => {
          const isActive = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 8,
                border: isActive ? "2px solid #a78bfa" : "2px solid #334155",
                background: isActive ? "#3b1fa3" : "#0f172a",
                color: "white",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {BG_TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  color: "#94a3b8",
  marginBottom: 6,
  fontWeight: 500,
} as const;

export const BackgroundTypePicker = memo(BackgroundTypePickerImpl);
