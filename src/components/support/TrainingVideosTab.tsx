import { useState } from "react";
import { Play, X, Upload, Loader2 } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTrainingVideos, type TrainingVideo } from "@/hooks/useTrainingVideos";
import { useRBAC } from "@/hooks/useRBAC";
import { UploadTrainingVideoDialog } from "./UploadTrainingVideoDialog";
import { apiFetch } from "@/lib/apiFetch";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TrainingVideosTab() {
  const { data: videos = [], isLoading, error } = useTrainingVideos();
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { hasPermission } = useRBAC();
  const canUpload = hasPermission("support.upload_video");

  const handleVideoClick = async (video: TrainingVideo) => {
    setLoadingVideoId(video.id);
    try {
      const res = await apiFetch<{ videoUrl: string; thumbnailUrl?: string }>(`/training/videos/${video.id}/url`);
      setPlaybackUrl(res.videoUrl);
    } catch {
      setPlaybackUrl(video.url);
    } finally {
      setLoadingVideoId(null);
      setActiveVideo(video);
    }
  };

  const handleClosePlayer = () => {
    setActiveVideo(null);
    setPlaybackUrl(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive">Failed to load training videos. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header row */}
      {(canUpload || videos.length > 0) && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{videos.length} video{videos.length !== 1 ? "s" : ""}</span>
          {canUpload && (
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Video
            </Button>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-sm text-muted-foreground">No training videos available yet.</p>
          {canUpload && (
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload your first video
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group bg-card rounded-lg border hover:shadow-md transition-all cursor-pointer overflow-hidden"
              onClick={() => setActiveVideo(video)}
            >
              {/* Thumbnail / play overlay */}
              <div className="relative flex items-center justify-center bg-muted h-36 overflow-hidden">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/90 text-primary-foreground group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 ml-0.5" />
                  </div>
                </div>
                {video.status === "processing" && (
                  <span className="absolute top-2 right-2 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded">Processing</span>
                )}
              </div>

              <div className="p-4 space-y-1">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {video.title || formatName(video.name)}
                </h3>
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(video.size)}
                  {video.uploader && ` · ${video.uploader.first_name || ""} ${video.uploader.last_name || ""}`.trim()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {activeVideo && (
            <div className="space-y-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">{activeVideo.title || formatName(activeVideo.name)}</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveVideo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-black aspect-video">
                <video controls autoPlay className="w-full h-full" src={activeVideo.url}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <UploadTrainingVideoDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
