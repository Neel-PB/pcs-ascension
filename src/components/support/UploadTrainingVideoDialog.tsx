import { useState, useRef, type ChangeEvent } from "react";
import { Upload, X, Film, Image } from "@/lib/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUploadTrainingVideo } from "@/hooks/useUploadTrainingVideo";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadTrainingVideoDialog({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const upload = useUploadTrainingVideo();

  const reset = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const handleSubmit = () => {
    if (!videoFile || !title.trim()) return;
    upload.mutate(
      { title: title.trim(), description: description.trim() || undefined, video: videoFile, thumbnail: thumbnailFile || undefined },
      { onSuccess: () => { reset(); onOpenChange(false); } }
    );
  };

  const onVideoPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setVideoFile(f);
  };

  const onThumbPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setThumbnailFile(f);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Training Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="vid-title">Title *</Label>
            <Input id="vid-title" placeholder="e.g. Introduction to Analytics" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="vid-desc">Description</Label>
            <Textarea id="vid-desc" placeholder="Brief description of the video…" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Video file */}
          <div className="space-y-1.5">
            <Label>Video File *</Label>
            <input ref={videoRef} type="file" accept=".mp4,.webm,.mov,video/*" className="hidden" onChange={onVideoPick} />
            {videoFile ? (
              <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{videoFile.name}</span>
                <span className="text-muted-foreground text-xs">{formatSize(videoFile.size)}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setVideoFile(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="w-full rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-accent/30 transition-colors"
              >
                <Upload className="h-5 w-5 mx-auto mb-1" />
                Click to browse or drag & drop (.mp4, .webm, .mov)
              </button>
            )}
          </div>

          {/* Thumbnail (optional) */}
          <div className="space-y-1.5">
            <Label>Thumbnail (optional)</Label>
            <input ref={thumbRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/*" className="hidden" onChange={onThumbPick} />
            {thumbnailFile ? (
              <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <Image className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{thumbnailFile.name}</span>
                <span className="text-muted-foreground text-xs">{formatSize(thumbnailFile.size)}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setThumbnailFile(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbRef.current?.click()}
                className="w-full rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground hover:border-primary/50 hover:bg-accent/30 transition-colors"
              >
                <Image className="h-4 w-4 mx-auto mb-1" />
                Add a thumbnail image
              </button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !videoFile || upload.isPending}>
            {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
