import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';
import { Shimmer } from './Shimmer';

interface ResponseProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const Response = ({ content, isStreaming, className }: ResponseProps) => {
  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      {content ? (
        <>
          <MarkdownRenderer content={content} />
          {isStreaming && (
            <div className="mt-4">
              <Shimmer lines={2} />
            </div>
          )}
        </>
      ) : (
        <Shimmer lines={3} />
      )}
    </div>
  );
};
