import { ProfileData } from "@/types/profile";

export type BgType = "solid" | "gradient" | "image";
export type BgDirection = "circle at top" | "to bottom" | "to right" | "to bottom right";

const COLOR_HEX = /#[0-9a-fA-F]{6}/g;
const URL_RE = /url\(["']?(.*?)["']?\)/;

export interface ParsedBackground {
  type: BgType;
  color1: string;
  color2: string;
  direction: BgDirection;
  opacity: number;
  imageUrl: string;
}

export function parseBackground(profile: ProfileData): ParsedBackground {
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

export function buildBackgroundValue(
  type: BgType,
  color1: string,
  color2: string,
  direction: BgDirection,
  imageUrl: string,
): string {
  if (type === "solid") return color1;
  if (type === "gradient") {
    return direction === "circle at top"
      ? `radial-gradient(circle at top, ${color1}, ${color2})`
      : `linear-gradient(${direction}, ${color1}, ${color2})`;
  }
  return `url(${imageUrl})`;
}

export function buildBackgroundPreview(
  type: BgType,
  color1: string,
  color2: string,
  direction: BgDirection,
  imageUrl: string,
): string {
  if (type === "solid") return color1;
  if (type === "gradient") {
    return direction === "circle at top"
      ? `radial-gradient(circle at top, ${color1}, ${color2})`
      : `linear-gradient(${direction}, ${color1}, ${color2})`;
  }
  return imageUrl ? `url(${imageUrl})` : "#1e1b4b";
}

export const BG_TYPE_LABELS: Record<BgType, string> = {
  solid: "Uni",
  gradient: "Degrade",
  image: "Image",
};

export const BG_DIRECTION_LABELS: Record<BgDirection, string> = {
  "circle at top": "Radial",
  "to bottom": "Vertical",
  "to right": "Horizontal",
  "to bottom right": "Diagonal",
};

/**
 * Format a link based on the profile data key and value
 * @param key - The profile data key (e.g., 'website', 'linkedin')
 * @param value - The value to format as a URL
 * @returns Formatted URL string
 */
export const formatLink = (key: keyof ProfileData, value: string): string => {
  if (!value) return "#";

  switch (key) {
    case "instagram":
      return value.startsWith("http") ? value : `https://instagram.com/${value.replace("@", "")}`;

    case "tiktok":
      return value.startsWith("http") ? value : `https://www.tiktok.com/@${value.replace("@", "")}`;

    case "linkedin":
      return value.startsWith("http")
        ? value
        : `https://www.linkedin.com/in/${value.replace(/^@/, "").replace(/^\/+/, "")}`;

    case "website":
      return value.startsWith("http") ? value : `https://${value}`;

    case "whatsapp":
      return `https://wa.me/${value.replace(/\D/g, "")}`;

    case "email":
      return `mailto:${value}`;

    case "phone":
      return `tel:${value}`;

    default:
      return value;
  }
};

/**
 * Build a vCard string from profile data
 * @param profile - The profile data to convert to vCard format
 * @returns vCard formatted string
 */
export const buildVCard = (profile: ProfileData | null): string => {
  if (!profile) return "";

  const cleanText = (value?: string) =>
    (value || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  // Sépare "Prénom Nom" → firstName="Prénom", lastName="Nom"
  const parts = (profile.name || "").trim().split(/\s+/);
  const firstName = cleanText(parts.slice(0, -1).join(" ") || parts[0]);
  const lastName = cleanText(parts.length > 1 ? parts[parts.length - 1] : "");

  const websiteUrl = profile.website ? formatLink("website", profile.website) : "";
  const linkedinUrl = profile.linkedin ? formatLink("linkedin", profile.linkedin) : "";
  const instagramUrl = profile.instagram ? formatLink("instagram", profile.instagram) : "";
  const tiktokUrl = profile.tiktok ? formatLink("tiktok", profile.tiktok) : "";
  const whatsappUrl = profile.whatsapp ? formatLink("whatsapp", profile.whatsapp) : "";
  const emailUrl = profile.email || "";
  const phoneUrl = profile.phone || "";

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${cleanText(profile.name)}`,
    `N:${lastName};${firstName};;;`,
    profile.subtitle ? `TITLE:${cleanText(profile.subtitle)}` : "",
    profile.bio ? `NOTE:${cleanText(profile.bio)}` : "",
    profile.photo_url ? `PHOTO:${profile.photo_url}` : "",
    websiteUrl ? `URL:${websiteUrl}` : "",
    linkedinUrl ? `URL:${linkedinUrl}` : "",
    instagramUrl ? `URL:${instagramUrl}` : "",
    tiktokUrl ? `URL:${tiktokUrl}` : "",
    whatsappUrl ? `URL:${whatsappUrl}` : "",
    emailUrl ? `EMAIL:${emailUrl}` : "",
    phoneUrl ? `TEL:${phoneUrl}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
};
