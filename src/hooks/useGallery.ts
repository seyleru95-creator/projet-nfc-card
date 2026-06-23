import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { GalleryItem } from "@/types/profile";

export function useGallery(profileId: string) {
  const queryClient = useQueryClient();

  // Query to fetch gallery items
  const {
    data: gallery = [],
    isLoading,
    isError,
    error,
  } = useQuery<GalleryItem[], Error>({
    queryKey: ["gallery", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("profile_id", profileId)
        .order("id", { ascending: false });

      if (error) throw error;

      return data as GalleryItem[];
    },
    enabled: !!profileId,
  });

  // Mutation to add gallery item
  const addGalleryItemMutation = useMutation({
    mutationFn: async (fileWithCaption: { file: File; caption: string }) => {
      if (!profileId) throw new Error("No profile ID");

      const { file, caption } = fileWithCaption;
      const path = `gallery/${profileId}-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery").getPublicUrl(path);

      const { error: insertError } = await supabase.from("gallery").insert({
        profile_id: profileId,
        image_url: publicUrl,
        caption: caption || file.name,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", profileId] });
    },
  });

  // Mutation to delete gallery item
  const deleteGalleryItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // First get the item to delete its storage file
      const { data: item } = await supabase
        .from("gallery")
        .select("image_url")
        .eq("id", itemId)
        .single();

      if (item) {
        // Delete from storage
        const urlParts = item.image_url.split("/gallery/");
        if (urlParts[1]) {
          await supabase.storage.from("gallery").remove([urlParts[1]]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", itemId)
        .eq("profile_id", profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", profileId] });
    },
  });

  return {
    gallery,
    isLoading,
    isError,
    error,
    addGalleryItem: addGalleryItemMutation.mutateAsync,
    deleteGalleryItem: deleteGalleryItemMutation.mutateAsync,
    isAddingGalleryItem: addGalleryItemMutation.isPending,
    isDeletingGalleryItem: deleteGalleryItemMutation.isPending,
  };
}
