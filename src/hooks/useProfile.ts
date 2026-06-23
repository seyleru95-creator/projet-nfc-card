import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ProfileData } from "@/types/profile";

export function useProfile(userId: string) {
  const queryClient = useQueryClient();

  // Query to fetch profile data
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery<ProfileData | null, Error>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

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
    },
    enabled: !!userId,
  });

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ProfileData>) => {
      const { error } = await supabase
        .from("profile")
        .update(updates)
        .eq("id", profile?.id || "")
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  // Mutation to update avatar
  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) throw new Error("No profile ID");

      const ext = file.name.split(".").pop();
      const path = `avatars/${profile.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile").getPublicUrl(path);

      const photoUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profile")
        .update({ photo_url: photoUrl })
        .eq("id", profile.id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      return photoUrl;
    },
    onSuccess: (photoUrl) => {
      queryClient.setQueryData<ProfileData | null>(["profile", userId], (old) =>
        old ? { ...old, photo_url: photoUrl } : old,
      );
    },
  });

  // Mutation to update background
  const updateBackgroundMutation = useMutation({
    mutationFn: async (background: {
      type: "solid" | "gradient" | "image";
      value: string;
      opacity: number;
    }) => {
      if (!profile?.id) throw new Error("No profile ID");

      const { error } = await supabase
        .from("profile")
        .update({
          background_type: background.type,
          background_value: background.value,
          background_opacity: background.opacity,
        })
        .eq("id", profile.id)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  return {
    profile,
    isLoading,
    isError,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    updateAvatar: updateAvatarMutation.mutateAsync,
    updateBackground: updateBackgroundMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    isUpdatingBackground: updateBackgroundMutation.isPending,
  };
}
