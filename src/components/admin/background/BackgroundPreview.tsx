import { memo } from "react";
import { BgType } from "@/lib/profile-utils";

interface BackgroundPreviewProps {
  type: BgType;
  preview: string;
  opacity: number;
}

function BackgroundPreviewImpl({ type, preview, opacity }: BackgroundPreviewProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>Apercu</label>
      <div
        style={{
          height: 80,
          borderRadius: 12,
          background: preview,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid #334155",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {type === "image" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: `rgba(10, 8, 20, ${opacity / 100})`,
            }}
          />
        )}
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

export const BackgroundPreview = memo(BackgroundPreviewImpl);
