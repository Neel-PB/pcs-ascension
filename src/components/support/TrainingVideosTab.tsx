import { useState } from "react";
import { Play, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTrainingVideos, type TrainingVideo } from "@/hooks/useTrainingVideos";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")          // strip extension
    .replace(/[-_]/g, " ")            // dashes/underscores → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case
}

export function TrainingVideosTab() {
  const { data: videos = [], isLoading, error } = useTrainingVideos();
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null);

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

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No training videos available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group bg-card rounded-lg border hover:shadow-md transition-all cursor-pointer overflow-hidden"
            onClick={() => setActiveVideo(video)}
          >
            {/* Thumbnail / play overlay */}
            <div className="relative flex items-center justify-center bg-muted h-36">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/90 text-primary-foreground group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 ml-0.5" />
              </div>
            </div>

            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {formatName(video.name)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(video.size)} · {video.contentType.split("/")[1]?.toUpperCase() || "VIDEO"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {activeVideo && (
            <div className="space-y-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">{formatName(activeVideo.name)}</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveVideo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-black aspect-video">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={activeVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
