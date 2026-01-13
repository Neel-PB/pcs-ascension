import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScreenshotCapture } from './ScreenshotCapture';
import { useFeedbackStore } from '@/stores/useFeedbackStore';
import { useFeedback, uploadScreenshot, CreateFeedbackInput } from '@/hooks/useFeedback';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess }) => {
  const { capturedScreenshot, screenshotPreviewUrl, setScreenshot, clearScreenshot } = useFeedbackStore();
  const { createFeedback } = useFeedback();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CreateFeedbackInput['type']>('bug');
  const [priority, setPriority] = useState<CreateFeedbackInput['priority']>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl: string | null = null;

      // Upload screenshot if exists
      if (capturedScreenshot) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          screenshotUrl = await uploadScreenshot(capturedScreenshot, userData.user.id);
        }
      }

      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };

      await createFeedback.mutateAsync({
        title: title.trim(),
        type,
        priority,
        description: description.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        browser_info: browserInfo,
      });

      // Reset form
      setTitle('');
      setType('bug');
      setPriority('medium');
      setDescription('');
      clearScreenshot();
      
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Screenshot (Optional)</Label>
        <ScreenshotCapture
          onCapture={setScreenshot}
          previewUrl={screenshotPreviewUrl}
          onClear={clearScreenshot}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of your feedback"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">🐛 Bug Report</SelectItem>
              <SelectItem value="feature">✨ Feature Request</SelectItem>
              <SelectItem value="improvement">🔧 Improvement</SelectItem>
              <SelectItem value="question">❓ Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed information about your feedback..."
          rows={4}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !title.trim() || !description.trim()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </>
        )}
      </Button>
    </form>
  );
};
