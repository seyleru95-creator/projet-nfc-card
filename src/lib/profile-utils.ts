import { ProfileData } from "@/types/profile";

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

  const websiteUrl = profile.website ? formatLink("website", profile.website) : "";
  const linkedinUrl = profile.linkedin ? formatLink("linkedin", profile.linkedin) : "";
  const instagramUrl = profile.instagram ? formatLink("instagram", profile.instagram) : "";
  const tiktokUrl = profile.tiktok ? formatLink("tiktok", profile.tiktok) : "";
  const whatsappUrl = profile.whatsapp ? formatLink("whatsapp", profile.whatsapp) : "";
  const emailUrl = profile.email ? formatLink("email", profile.email) : "";
  const phoneUrl = profile.phone ? formatLink("phone", profile.phone) : "";

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${cleanText(profile.name)}`,
    profile.subtitle ? `NOTE:${cleanText(profile.subtitle)}` : "",
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
