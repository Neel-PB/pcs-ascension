import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const voiceIcon = 'h-3.5 w-3.5 shrink-0';

/** Web Speech API error codes — `network` means the browser could not reach the speech service (often cloud), not your mic. */
function getSpeechErrorToast(error: string): { title: string; description: string } | null {
  switch (error) {
    case 'aborted':
    case 'no-speech':
      return null;
    case 'network':
      return {
        title: 'Voice input unavailable',
        description:
          'Speech recognition needs a working internet connection. Some networks or VPNs block the speech service—try typing instead.',
      };
    case 'not-allowed':
    case 'service-not-allowed':
      return {
        title: 'Microphone blocked',
        description: 'Allow microphone access for this site in your browser settings.',
      };
    case 'audio-capture':
      return {
        title: 'No microphone',
        description: 'Connect a microphone or close other apps that may be using it.',
      };
    default:
      return {
        title: 'Voice input failed',
        description: 'Try again or type your message instead.',
      };
  }
}

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        const code = event.error as string;
        setIsRecording(false);
        const toastContent = getSpeechErrorToast(code);
        if (!toastContent) return;
        if (import.meta.env.DEV) {
          console.warn('[SpeechRecognition]', code);
        }
        toast.error(toastContent.title, { description: toastContent.description });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Not supported", {
        description: "Voice recording is not supported in your browser.",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "ghost"}
      size="icon"
      className={cn(
        'h-6 w-6 shrink-0 rounded-lg p-0 min-w-0 [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:shrink-0',
        isRecording ? 'animate-pulse' : 'hover:bg-accent',
      )}
      onClick={toggleRecording}
      disabled={disabled}
    >
      {isRecording ? (
        <Square className={cn(voiceIcon, 'fill-current')} />
      ) : (
        <Mic className={voiceIcon} />
      )}
    </Button>
  );
};
