import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";

interface UploadPayload {
  title: string;
  description?: string;
  duration?: number;
  video: File;
  thumbnail?: File;
}

export function useUploadTrainingVideo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadPayload) => {
      const fd = new FormData();
      fd.append("title", payload.title);
      if (payload.description) fd.append("description", payload.description);
      if (payload.duration) fd.append("duration", String(payload.duration));
      fd.append("video", payload.video);
      if (payload.thumbnail) fd.append("thumbnail", payload.thumbnail);

      return apiFetch("/training/upload", { method: "POST", body: fd });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-videos"] });
      toast.success("Video uploaded successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload video");
    },
  });
}
