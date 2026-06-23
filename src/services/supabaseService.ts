import { supabase } from "@/lib/supabase";
import { ProfileData, GalleryItem } from "@/types/profile";

export interface ProfileService {
  getProfile(userId: string): Promise<ProfileData | null>;
  updateProfile(userId: string, updates: Partial<ProfileData>): Promise<void>;
  uploadAvatar(userId: string, file: File): Promise<string>;
  updateBackground(
    userId: string,
    background: {
      type: "solid" | "gradient" | "image";
      value: string;
      opacity: number;
    },
  ): Promise<void>;
  deleteProfile(userId: string): Promise<void>;
}

export interface GalleryService {
  getGallery(profileId: string): Promise<GalleryItem[]>;
  addGalleryItem(profileId: string, file: File, caption: string): Promise<void>;
  deleteGalleryItem(profileId: string, itemId: string): Promise<void>;
}

export class SupabaseProfileService implements ProfileService {
  async getProfile(userId: string): Promise<ProfileData | null> {
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      slug: data.slug || "",
      name: data.name || "",
      subtitle: data.subtitle || "",
      bio: data.bio || "",
      photo_url: data.photo_url || "",
      instagram: data.instagram || "",
      tiktok: data.tiktok || "",
      linkedin: data.linkedin || "",
      website: data.website || "",
      whatsapp: data.whatsapp || "",
      email: data.email || "",
      phone: data.phone || "",
      background_type: data.background_type || "gradient",
      background_value: data.background_value || "",
      background_opacity: data.background_opacity ?? 45,
    };
  }

  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<void> {
    const { error } = await supabase
      .from("profile")
      .update(updates)
      .eq("user_id", userId)
      .eq("id", updates.id ?? "");

    if (error) throw error;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError) throw profileError;
    if (!profileData) throw new Error("Profile not found");

    const ext = file.name.split(".").pop();
    const path = `avatars/${profileData.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile")
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("profile").getPublicUrl(path);
    const photoUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profile")
      .update({ photo_url: photoUrl })
      .eq("id", profileData.id)
      .eq("user_id", userId);

    if (updateError) throw updateError;

    return photoUrl;
  }

  async updateBackground(
    userId: string,
    background: {
      type: "solid" | "gradient" | "image";
      value: string;
      opacity: number;
    },
  ): Promise<void> {
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError) throw profileError;
    if (!profileData) throw new Error("Profile not found");

    const { error } = await supabase
      .from("profile")
      .update({
        background_type: background.type,
        background_value: background.value,
        background_opacity: background.opacity,
      })
      .eq("id", profileData.id)
      .eq("user_id", userId);

    if (error) throw error;
  }

  async deleteProfile(userId: string): Promise<void> {
    const { error } = await supabase.from("profile").delete().eq("user_id", userId);
    if (error) throw error;
  }
}

export class SupabaseGalleryService implements GalleryService {
  async getGallery(profileId: string): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("profile_id", profileId)
      .order("id", { ascending: false });

    if (error) throw error;
    return (data || []) as GalleryItem[];
  }

  async addGalleryItem(profileId: string, file: File, caption: string): Promise<void> {
    const path = `gallery/${profileId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("gallery").getPublicUrl(path);

    const { error: insertError } = await supabase.from("gallery").insert({
      profile_id: profileId,
      image_url: data.publicUrl,
      caption: caption || file.name,
    });

    if (insertError) throw insertError;
  }

  async deleteGalleryItem(profileId: string, itemId: string): Promise<void> {
    const { data: item } = await supabase
      .from("gallery")
      .select("image_url, profile_id")
      .eq("id", itemId)
      .eq("profile_id", profileId)
      .single();

    if (!item) {
      throw new Error("Gallery item not found or not owned by this profile");
    }

    const urlParts = item.image_url.split("/gallery/");
    if (urlParts[1]) {
      await supabase.storage.from("gallery").remove([urlParts[1]]);
    }

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", itemId)
      .eq("profile_id", profileId);

    if (error) throw error;
  }
}

export const createProfileService = (): ProfileService => new SupabaseProfileService();
export const createGalleryService = (): GalleryService => new SupabaseGalleryService();
