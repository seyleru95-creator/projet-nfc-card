import { memo } from "react";
import { BgDirection, BG_DIRECTION_LABELS } from "@/lib/profile-utils";

interface BackgroundColorControlsProps {
  color1: string;
  color2: string;
  direction: BgDirection;
  onColor1Change: (value: string) => void;
  onColor2Change: (value: string) => void;
  onDirectionChange: (value: BgDirection) => void;
}

const DIRECTIONS: BgDirection[] = ["circle at top", "to bottom", "to right", "to bottom right"];

function BackgroundColorControlsImpl({
  color1,
  color2,
  direction,
  onColor1Change,
  onColor2Change,
  onDirectionChange,
}: BackgroundColorControlsProps) {
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Couleur 1</label>
          <input
            type="color"
            value={color1}
            onChange={(e) => onColor1Change(e.target.value)}
            style={colorInputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Couleur 2</label>
          <input
            type="color"
            value={color2}
            onChange={(e) => onColor2Change(e.target.value)}
            style={colorInputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Direction</label>
        <select
          value={direction}
          onChange={(e) => onDirectionChange(e.target.value as BgDirection)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {BG_DIRECTION_LABELS[d]}
            </option>
          ))}
        </select>
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

const colorInputStyle = {
  width: "100%",
  height: 48,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
} as const;

const inputStyle = {
  width: "100%",
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: 12,
  padding: "14px 16px",
  color: "white",
  fontSize: 15,
  boxSizing: "border-box",
  transition: "all 0.2s ease",
} as const;

export const BackgroundColorControls = memo(BackgroundColorControlsImpl);
