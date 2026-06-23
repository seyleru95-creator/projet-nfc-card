import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface BackgroundUploaderResult {
  uploadBackgroundImage: (file: File) => Promise<string>;
  uploading: boolean;
  error: string | null;
}

export function useBackgroundUploader(profileId: string | undefined): BackgroundUploaderResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadBackgroundImage = useCallback(
    async (file: File): Promise<string> => {
      if (!profileId) {
        const message = "Profil non charge, reessayez.";
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setUploading(true);
      try {
        const ext = file.name.split(".").pop() || "bin";
        const path = `backgrounds/${profileId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("profile")
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("profile").getPublicUrl(path);
        const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

        return publicUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Echec de l'upload";
        setError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [profileId],
  );

  return { uploadBackgroundImage, uploading, error };
}
