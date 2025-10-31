import { Copy, Check, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Array<{ id: string; name: string }>;
}

export const ChatMessage = ({ content, type, attachments }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[85%] ${type === 'user' ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            type === 'user'
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          }`}
        >
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file) => (
                <Badge key={file.id} variant="secondary" className="text-xs">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {file.name}
                </Badge>
              ))}
            </div>
          )}
          {type === 'assistant' ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
          type === 'user' ? 'order-2 ml-2' : 'order-1 mr-2'
        }`}
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
