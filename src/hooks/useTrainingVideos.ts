import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export interface TrainingVideo {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  created_at: string;
  updated_at: string;
  // Extended fields from uploaded videos
  title?: string;
  description?: string;
  thumbnail_url?: string;
  duration?: number;
  status?: string;
  uploader?: { first_name?: string; last_name?: string; email?: string };
}

export function useTrainingVideos() {
  return useQuery<TrainingVideo[]>({
    queryKey: ["training-videos"],
    queryFn: async () => {
      // Fetch both legacy GCS list and uploaded videos, merge
      const [legacy, uploaded] = await Promise.all([
        apiFetch<TrainingVideo[]>("/training/videos").catch(() => [] as TrainingVideo[]),
        apiFetch<TrainingVideo[]>("/training/uploaded-videos").catch(() => [] as TrainingVideo[]),
      ]);

      // Deduplicate by id
      const map = new Map<string, TrainingVideo>();
      for (const v of legacy) map.set(v.id, v);
      for (const v of uploaded) map.set(v.id, v);
      return Array.from(map.values());
    },
    staleTime: 5 * 60 * 1000,
  });
}
