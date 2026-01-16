import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFeedbackStore } from '@/stores/useFeedbackStore';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { ScreenshotSelectionOverlay } from './ScreenshotSelectionOverlay';
import { capturePageScreenshot } from '@/lib/capturePageScreenshot';
import { toast } from 'sonner';

type CaptureArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface FeedbackTriggerProps {
  enableScreenshotCapture?: boolean;
}

export const FeedbackTrigger: React.FC<FeedbackTriggerProps> = ({ 
  enableScreenshotCapture = true 
}) => {
  const { setOpen, setScreenshot } = useFeedbackStore();
  const [showSelector, setShowSelector] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleClick = () => {
    if (enableScreenshotCapture) {
      setShowSelector(true);
    } else {
      // Open panel directly without screenshot capture
      setOpen(true);
    }
  };

  const handleAreaSelected = async (area: CaptureArea) => {
    setShowSelector(false);

    // Wait for the selector overlay to unmount before capturing (prevents dim/washed captures)
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    setIsCapturing(true);

    const blob = await capturePageScreenshot(area);

    if (blob) {
      setScreenshot(blob);
      toast.success('Screenshot captured');
    } else {
      toast.info('Could not capture screenshot - you can upload manually');
    }

    setOpen(true);
    setIsCapturing(false);
  };

  const handleCancel = () => {
    setShowSelector(false);
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isCapturing}
        variant="ghost"
        className="fixed right-0 bottom-4 h-12 w-6 rounded-l-xl rounded-r-none bg-primary hover:bg-primary/90 shadow-xl active:scale-95 transition-all duration-300 ease-out z-50 flex items-center justify-center text-white"
        aria-label="Open Feedback"
        data-feedback-ui="trigger"
      >
        {isCapturing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MessageSquarePlus className="h-5 w-5" />
        )}
      </Button>

      {showSelector && (
        <ScreenshotSelectionOverlay
          onSelect={handleAreaSelected}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
