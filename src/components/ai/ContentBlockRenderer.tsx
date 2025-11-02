import { ContentBlock } from '@/types/contentBlock';
import { Response } from './elements/Response';
import { Reasoning } from './elements/Reasoning';
import { Task } from './elements/Task';
import { Actions } from './elements/Actions';
import { toast } from 'sonner';

interface ContentBlockRendererProps {
  block: ContentBlock;
  onRegenerate?: (blockId: string) => void;
  onTaskToggle?: (blockId: string, taskId: string) => void;
}

export const ContentBlockRenderer = ({ 
  block, 
  onRegenerate,
  onTaskToggle 
}: ContentBlockRendererProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    toast.success('Copied to clipboard');
  };

  const handleRegenerate = () => {
    onRegenerate?.(block.id);
    toast.info('Regenerating response...');
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    toast.success(`Thanks for your feedback!`);
    console.log('Feedback:', type, 'for block:', block.id);
  };

  switch (block.type) {
    case 'user-input':
      return (
        <div className="flex justify-end mb-6">
          <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground">
            <p className="text-sm whitespace-pre-wrap">{block.content}</p>
          </div>
        </div>
      );

    case 'ai-response':
      return (
        <div className="relative group mb-12">
          {/* Reasoning block (if present) */}
          {block.metadata?.reasoning && (
            <Reasoning 
              reasoning={block.metadata.reasoning}
              isStreaming={block.metadata.isStreaming}
            />
          )}

          {/* Main response */}
          <Response 
            content={block.content}
            isStreaming={block.metadata.isStreaming}
          />

          {/* Tasks (if present) */}
          {block.metadata?.tasks && block.metadata.tasks.length > 0 && (
            <div className="mt-6 space-y-2">
              {block.metadata.tasks.map(task => (
                <Task 
                  key={task.id} 
                  task={task}
                  onToggle={(taskId) => onTaskToggle?.(block.id, taskId)}
                />
              ))}
            </div>
          )}

          {/* Floating actions */}
          {!block.metadata?.isStreaming && (
            <Actions 
              onCopy={handleCopy}
              onRegenerate={() => handleRegenerate()}
              onFeedback={handleFeedback}
            />
          )}
        </div>
      );

    case 'task-list':
      return (
        <div className="space-y-2 mb-8">
          {block.metadata?.tasks?.map(task => (
            <Task 
              key={task.id} 
              task={task}
              onToggle={(taskId) => onTaskToggle?.(block.id, taskId)}
            />
          ))}
        </div>
      );

    default:
      return null;
  }
};
