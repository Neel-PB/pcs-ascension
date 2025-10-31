import { useEffect, useRef, useState } from 'react';
import { X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIHub } from '@/hooks/useAIHub';
import { useResizable } from '@/hooks/useResizable';
import { ChatMessageList } from './chat/ChatMessageList';
import { PillChatBar } from './PillChatBar';
import { AIWelcomeCards } from './AIWelcomeCards';

interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'excel' | 'text' | 'csv';
  data: string;
  mimeType: string;
  size: number;
  extractedText?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  attachments?: Array<{ id: string; name: string }>;
}

const MIN_WIDTH = 360;
const MAX_WIDTH_VW = 0.7;
const SNAP_POINTS = [400, 520, 640, 820];

export const AIHubPanel = () => {
  const { isOpen, setOpen } = useAIHub();
  const [currentInput, setCurrentInput] = useState('');
  const [fileAttachments, setFileAttachments] = useState<ProcessedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { isDragging, currentWidth, handlePointerDown } = useResizable({
    minWidth: MIN_WIDTH,
    maxWidthVw: MAX_WIDTH_VW,
    snapPoints: SNAP_POINTS,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen && panelRef.current?.contains(document.activeElement)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string, attachments?: ProcessedFile[]) => {
    if (!message.trim()) return;

    const activeAttachments = attachments || fileAttachments;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message.trim(),
      role: 'user',
      created_at: new Date().toISOString(),
      attachments: activeAttachments?.map(file => ({
        id: file.id,
        name: file.name,
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setCurrentInput('');
    setFileAttachments([]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: `**Echo:** ${message}\n\nThis is a mock response to demonstrate the UI. Here's what I can show you:\n\n### Features\n- **Markdown rendering** with proper formatting\n- Code blocks with syntax highlighting\n- Tables and lists\n- And more!\n\n\`\`\`javascript\nconst greeting = "Hello from AI Hub!";\nconsole.log(greeting);\n\`\`\`\n\n${activeAttachments.length > 0 ? `\n📎 You attached **${activeAttachments.length} file(s)**:\n${activeAttachments.map(f => `- ${f.name}`).join('\n')}` : ''}`,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleWelcomeCardClick = (action: string) => {
    setCurrentInput(action);
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentInput('');
    setFileAttachments([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70] lg:hidden"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-screen bg-background border-l border-border shadow-2xl z-[80] flex flex-col max-lg:w-full transition-transform duration-300"
        style={{ width: currentWidth }}
      >
        {/* Resize Handle (Desktop Only) */}
        <div
          className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-border hover:bg-primary cursor-col-resize transition-all z-10"
          onPointerDown={handlePointerDown}
        >
          {isDragging && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-medium">
              {Math.round(currentWidth)}px
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
          {messages.length === 0 ? (
            <AIWelcomeCards onCardClick={handleWelcomeCardClick} />
          ) : (
            <>
              <ChatMessageList
                messages={messages.map(msg => ({
                  id: msg.id,
                  content: msg.content,
                  type: msg.role === 'user' ? 'user' : 'assistant',
                  timestamp: new Date(msg.created_at),
                  attachments: msg.attachments
                }))}
                isLoading={isGenerating}
              />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input */}
        <PillChatBar
          value={currentInput}
          onChange={setCurrentInput}
          onSend={handleSendMessage}
          onAttach={(files) => setFileAttachments(prev => [...prev, ...files])}
          onRemoveAttachment={(id) => setFileAttachments(prev => prev.filter(f => f.id !== id))}
          attachments={fileAttachments}
          isLoading={false}
          isGenerating={isGenerating}
          placeholder="Ask anything..."
          onClearChat={handleClearChat}
        />
      </div>
    </>
  );
};
