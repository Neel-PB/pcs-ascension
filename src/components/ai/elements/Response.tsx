import { cn } from '@/lib/utils';
import { memo, type ComponentProps } from 'react';
import { Streamdown } from 'streamdown';
import { Shimmer } from './Shimmer';

interface ResponseProps extends ComponentProps<typeof Streamdown> {
  content?: string;
  isStreaming?: boolean;
}

export const Response = memo(
  ({ content, isStreaming, className, children, ...props }: ResponseProps) => {
    const displayContent = children || content;
    
    return (
      <>
        {displayContent ? (
          <>
            <Streamdown
              className={cn(
                'prose prose-sm max-w-none dark:prose-invert size-full text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
                '[&_h1]:text-lg [&_h1]:font-semibold',
                '[&_h2]:text-base [&_h2]:font-semibold',
                '[&_h3]:text-sm [&_h3]:font-semibold',
                '[&_h4]:text-sm [&_h4]:font-medium',
                className
              )}
              parseIncompleteMarkdown={isStreaming}
              {...props}
            >
              {displayContent}
            </Streamdown>
            {isStreaming && (
              <div className="mt-4">
                <Shimmer lines={2} />
              </div>
            )}
          </>
        ) : (
          <Shimmer lines={3} />
        )}
      </>
    );
  },
  (prevProps, nextProps) => 
    prevProps.content === nextProps.content && 
    prevProps.children === nextProps.children &&
    prevProps.isStreaming === nextProps.isStreaming
);

Response.displayName = 'Response';
