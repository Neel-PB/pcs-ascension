import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ScreenshotCaptureProps {
  onCapture: (blob: Blob) => void;
  previewUrl: string | null;
  onClear: () => void;
}

export const ScreenshotCapture: React.FC<ScreenshotCaptureProps> = ({
  onCapture,
  previewUrl,
  onClear,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreen = async () => {
    try {
      setIsCapturing(true);
      
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        },
        audio: false,
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait a moment for the video to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
          1.0
        );
      });

      onCapture(blob);
      toast.success('Screenshot captured');
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        toast.error('Screen capture permission denied');
      } else {
        toast.error('Failed to capture screenshot');
        console.error('Screenshot capture error:', error);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    onCapture(file);
    toast.success('Image uploaded');
  };

  if (previewUrl) {
    return (
      <div className="relative group">
        <img
          src={previewUrl}
          alt="Screenshot preview"
          className="w-full h-40 object-cover rounded-lg border border-border"
        />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={captureScreen}
            disabled={isCapturing}
          >
            <Camera className="h-4 w-4 mr-1" />
            Retake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={captureScreen}
            disabled={isCapturing}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {isCapturing ? 'Capturing...' : 'Capture Screen'}
          </Button>
          <label>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
              asChild
            >
              <span>
                <Upload className="h-4 w-4" />
                Upload Image
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Capture your screen or upload an existing screenshot
        </p>
      </div>
    </div>
  );
};
