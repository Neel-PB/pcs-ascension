import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIHub } from '@/hooks/useAIHub';

export const AIHubTrigger = () => {
  const { setOpen } = useAIHub();

  return (
    <Button
      onClick={() => setOpen(true)}
      className="fixed right-6 bottom-[5%] z-50 h-12 px-6 rounded-full shadow-lg hover:shadow-xl transition-all"
      aria-label="Open AI Assistant"
    >
      <Sparkles className="h-5 w-5 mr-2" />
      AI Assistant
    </Button>
  );
};
