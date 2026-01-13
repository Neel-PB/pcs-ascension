import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ScreenshotSelectionOverlay } from './ScreenshotSelectionOverlay';
import { capturePageScreenshot, CaptureArea } from '@/lib/capturePageScreenshot';

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
  const [showSelector, setShowSelector] = useState(false);

  const handleRetake = () => {
    setShowSelector(true);
  };

  const handleAreaSelected = async (area: CaptureArea) => {
    setShowSelector(false);
    setIsCapturing(true);

    const blob = await capturePageScreenshot(area);

    if (blob) {
      onCapture(blob);
      toast.success('Screenshot updated');
    } else {
      toast.error('Failed to capture screenshot');
    }

    setIsCapturing(false);
  };

  const handleCancelSelection = () => {
    setShowSelector(false);
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
      <>
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
              onClick={handleRetake}
              disabled={isCapturing}
            >
              <Camera className="h-4 w-4 mr-1" />
              {isCapturing ? 'Capturing...' : 'Retake'}
            </Button>
          </div>
        </div>

        {showSelector && (
          <ScreenshotSelectionOverlay
            onSelect={handleAreaSelected}
            onCancel={handleCancelSelection}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleRetake}
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

      {showSelector && (
        <ScreenshotSelectionOverlay
          onSelect={handleAreaSelected}
          onCancel={handleCancelSelection}
        />
      )}
    </>
  );
};
