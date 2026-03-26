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
      return apiFetch<TrainingVideo[]>("/training/uploaded-videos").catch(() => [] as TrainingVideo[]);
    },
    staleTime: 5 * 60 * 1000,
  });
}
