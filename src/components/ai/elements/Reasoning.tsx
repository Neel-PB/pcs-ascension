import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ReasoningBlock } from '@/types/contentBlock';

interface ReasoningProps {
  reasoning: ReasoningBlock;
  isStreaming?: boolean;
  defaultOpen?: boolean;
}

export const Reasoning = ({ reasoning, isStreaming, defaultOpen = false }: ReasoningProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || isStreaming);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full">
        {isOpen ? (
          <ChevronDown className="h-4 w-4 transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform" />
        )}
        <Brain className="h-4 w-4" />
        <span className="font-medium">
          {isStreaming ? 'Thinking...' : 'View reasoning'}
        </span>
        {reasoning.duration && !isStreaming && (
          <span className="text-xs text-muted-foreground ml-auto">
            {(reasoning.duration / 1000).toFixed(1)}s
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className={cn(
          'rounded-lg border border-border bg-muted/30 p-4',
          'text-sm text-muted-foreground leading-relaxed whitespace-pre-line'
        )}>
          {reasoning.content}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
