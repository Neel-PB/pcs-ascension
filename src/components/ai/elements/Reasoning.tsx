import { useState, useEffect, useRef } from 'react';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ReasoningBlock } from '@/types/contentBlock';

interface ReasoningProps {
  reasoning: ReasoningBlock;
  isStreaming?: boolean;
  defaultOpen?: boolean;
}

export const Reasoning = ({ reasoning, isStreaming, defaultOpen = false }: ReasoningProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || isStreaming);
  const prevStreamingRef = useRef(isStreaming);

  // Auto-collapse only when streaming transitions from true to false
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 500);
      prevStreamingRef.current = isStreaming;
      return () => clearTimeout(timer);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Strip markdown bold syntax from reasoning content
  const cleanContent = reasoning.content.replace(/\*\*/g, '');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
        <Brain className="h-3 w-3" />
        <span className="font-medium">
          {isStreaming 
            ? 'Thinking...' 
            : `Thought for ${(reasoning.duration! / 1000).toFixed(1)}s`
          }
        </span>
        {isOpen ? (
          <ChevronDown className="h-3 w-3 transition-transform" />
        ) : (
          <ChevronRight className="h-3 w-3 transition-transform" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 pl-5">
        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {cleanContent}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
