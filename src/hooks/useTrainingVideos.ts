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
}

export function useTrainingVideos() {
  return useQuery<TrainingVideo[]>({
    queryKey: ["training-videos"],
    queryFn: () => apiFetch<TrainingVideo[]>("/training/videos"),
    staleTime: 5 * 60 * 1000,
  });
}
