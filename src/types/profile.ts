export type ProfileData = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  subtitle: string;
  bio: string;
  photo_url: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  website: string;
  whatsapp: string;
  email: string;
  phone: string;
  background_type: "solid" | "gradient" | "image";
  background_value: string;
  background_opacity: number;
};

export type GalleryItem = {
  id: string;
  profile_id: string;
  image_url: string;
  caption: string;
};
