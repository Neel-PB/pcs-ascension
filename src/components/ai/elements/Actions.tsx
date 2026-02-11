import { Copy, RefreshCcw, ThumbsUp, ThumbsDown, Check } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Action {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

interface ActionsProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  className?: string;
}

export const Actions = ({ onCopy, onRegenerate, onFeedback, className }: ActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback?.(type);
  };

  return (
    <TooltipProvider>
      <div className={cn(
        'absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-1',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        className
      )}>
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-1 py-1">
          {onCopy && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onRegenerate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={onRegenerate}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Regenerate</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onFeedback && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'h-7 w-7',
                      feedback === 'positive' && 'text-green-500'
                    )}
                    onClick={() => handleFeedback('positive')}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Good response</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'h-7 w-7',
                      feedback === 'negative' && 'text-red-500'
                    )}
                    onClick={() => handleFeedback('negative')}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bad response</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
