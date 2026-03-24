import { useEffect, useRef, useState } from 'react';
import { useAIHub } from '@/hooks/useAIHub';
import { useResizable } from '@/hooks/useResizable';
import { PillChatBar } from './PillChatBar';
import { ContentBlock } from '@/types/contentBlock';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { mockComplexResponse, simpleReasoningBlocks } from '@/data/mockContentBlocks';
import ascensionLogo from '@/assets/Ascension-Emblem.svg';
import { OverlayTour } from '@/components/tour/OverlayTour';
import { aiHubTourSteps } from '@/components/tour/tourSteps';
import { toast } from 'sonner';

interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'excel' | 'text' | 'csv';
  data: string;
  mimeType: string;
  size: number;
  extractedText?: string;
}

const MIN_WIDTH = 490;
const MAX_WIDTH_VW = 0.7;
const SNAP_POINTS = [400, 520, 640, 820];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const useLiveApi = Boolean(API_BASE_URL);

function buildHistory(blocks: ContentBlock[]): { role: 'user' | 'model'; content: string }[] {
  const out: { role: 'user' | 'model'; content: string }[] = [];
  for (const b of blocks) {
    if (b.type === 'user-input') out.push({ role: 'user', content: b.content });
    else if (b.type === 'ai-response' && b.content.trim()) {
      out.push({ role: 'model', content: b.content });
    }
  }
  return out.slice(-10);
}

// Mock AI responses for different scenarios
const mockResponses = [
  `Based on your current staffing data, I can see a few key trends:

**Current Status:**
- Total headcount: 487 FTEs
- Quarter-over-quarter growth: +8.2%
- Open requisitions: 23 positions

**Key Insights:**
- Engineering team is growing fastest (12% increase)
- Sales team turnover is slightly above target (9.5% vs 8% target)
- Your contractor-to-FTE ratio is optimal at 15:85

Would you like me to dive deeper into any specific area?`,

  `# Staffing Forecast Analysis

I've analyzed your workforce data and created a forecast for the next quarter. Here's what I found:

## Projected Needs
- **Additional FTEs needed**: 18-22 positions
- **High-priority roles**: Senior Engineers (5), Product Managers (3), Sales Associates (4)
- **Budget impact**: Approximately $1.8M-2.1M in additional annual compensation

## Key Considerations
- Your current hiring velocity averages 45 days time-to-fill
- Q4 typically sees 15% higher application rates
- Consider prioritizing technical roles early in the quarter

Let me know if you'd like me to generate specific job requisitions for any of these roles.`,

  `Here's what I can help you with:

### Data Analysis
- Headcount trends and forecasts
- Turnover analysis by department
- Compensation benchmarking

### Planning & Recommendations
- Hiring plans and requisition priorities
- Budget optimization strategies
- Workforce capacity analysis

### Reporting
- Executive summaries
- Department-specific insights
- Custom data visualizations

What would you like to explore first?`
];

export const AIHubPanel = () => {
  const { isOpen, setOpen } = useAIHub();
  const [currentInput, setCurrentInput] = useState('');
  const [fileAttachments, setFileAttachments] = useState<ProcessedFile[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  // Auto-scroll to bottom when new content blocks arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contentBlocks]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Simulate streaming text effect for both reasoning and response
  const simulateStreaming = (fullText: string, blockId: string, reasoningText?: { content: string; duration: number }) => {
    // First stream reasoning if present
    if (reasoningText) {
      let reasoningIndex = 0;
      const reasoningChunkSize = 20;
      const reasoningInterval = 40;
      
      const reasoningTimer = setInterval(() => {
        if (reasoningIndex < reasoningText.content.length) {
          reasoningIndex = Math.min(reasoningIndex + reasoningChunkSize, reasoningText.content.length);
          
          setContentBlocks(prev =>
            prev.map(block =>
              block.id === blockId
                ? {
                    ...block,
                    metadata: {
                      ...block.metadata,
                      reasoning: {
                        content: reasoningText.content.slice(0, reasoningIndex),
                        duration: reasoningText.duration
                      }
                    }
                  }
                : block
            )
          );
        } else {
          // Reasoning complete, mark it as done and start main content
          clearInterval(reasoningTimer);
          
          setContentBlocks(prev =>
            prev.map(block =>
              block.id === blockId
                ? {
                    ...block,
                    metadata: {
                      ...block.metadata,
                      reasoning: {
                        content: reasoningText.content,
                        duration: reasoningText.duration
                      }
                    }
                  }
                : block
            )
          );
          
          // Start streaming main content after reasoning
          setTimeout(() => streamMainContent(fullText, blockId), 300);
        }
      }, reasoningInterval);
      
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
      streamingIntervalRef.current = reasoningTimer;
    } else {
      // No reasoning, stream main content directly
      streamMainContent(fullText, blockId);
    }
  };
  
  const streamMainContent = (fullText: string, blockId: string) => {
    let currentIndex = 0;
    const chunkSize = 15;
    const updateInterval = 50;

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    streamingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        currentIndex = Math.min(currentIndex + chunkSize, fullText.length);
        
        setContentBlocks(prev =>
          prev.map(block =>
            block.id === blockId
              ? { ...block, content: fullText.slice(0, currentIndex) }
              : block
          )
        );
      } else {
        // Streaming complete
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
        
        setContentBlocks(prev =>
          prev.map(block =>
            block.id === blockId
              ? { 
                  ...block, 
                  content: fullText,
                  metadata: { ...block.metadata, isStreaming: false } 
                }
              : block
          )
        );
        
        setIsGenerating(false);
      }
    }, updateInterval);
  };

  const runLiveStream = async (
    message: string,
    history: { role: 'user' | 'model'; content: string }[],
    aiBlockId: string,
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const token = sessionStorage.getItem('nestjs_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          ...(history.length > 0 ? { history } : {}),
        }),
        signal: abortRef.current.signal,
      });

      if (res.status === 401) {
        sessionStorage.removeItem('nestjs_token');
        sessionStorage.removeItem('nestjs_user');
        sessionStorage.removeItem('nestjs_must_change_password');
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth';
        }
        throw new Error('Session expired. Please sign in again.');
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let streamError: string | null = null;

      const processLine = (line: string) => {
        if (!line.trim()) return;
        let obj: Record<string, unknown>;
        try {
          obj = JSON.parse(line) as Record<string, unknown>;
        } catch {
          return;
        }
        if (obj.error != null && String(obj.error).length > 0) {
          streamError = String(obj.error);
          toast.error(streamError);
          setContentBlocks(prev =>
            prev.map(b =>
              b.id === aiBlockId
                ? {
                    ...b,
                    content: b.content || streamError!,
                    metadata: { ...b.metadata, isStreaming: false },
                  }
                : b,
            ),
          );
          return;
        }
        if (typeof obj.delta === 'string' && obj.delta.length > 0) {
          setContentBlocks(prev =>
            prev.map(b => (b.id === aiBlockId ? { ...b, content: b.content + obj.delta } : b)),
          );
        }
        if (obj.block && typeof obj.block === 'object') {
          const blk = obj.block as {
            type?: string;
            id?: string;
            columns?: { key: string; label: string }[];
            rows?: Record<string, unknown>[];
            totalRows?: number;
          };
          if (blk.type === 'data-table' && blk.columns && blk.rows) {
            setContentBlocks(prev => [
              ...prev,
              {
                id: blk.id ?? `data-table-${Date.now()}`,
                type: 'data-table',
                content: '',
                metadata: {
                  columns: blk.columns,
                  rows: blk.rows,
                  totalRows: blk.totalRows,
                },
              },
            ]);
          }
        }
        if (obj.done === true) {
          setContentBlocks(prev =>
            prev.map(b =>
              b.id === aiBlockId ? { ...b, metadata: { ...b.metadata, isStreaming: false } } : b,
            ),
          );
        }
      };

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          processLine(line);
          if (streamError) break outer;
        }
      }
      if (buffer.trim()) processLine(buffer.trim());
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        // user stopped
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(msg);
        setContentBlocks(prev =>
          prev.map(b =>
            b.id === aiBlockId
              ? {
                  ...b,
                  content: b.content || `Error: ${msg}`,
                  metadata: { ...b.metadata, isStreaming: false },
                }
              : b,
          ),
        );
      }
    } finally {
      setIsGenerating(false);
      setContentBlocks(prev =>
        prev.map(b =>
          b.id === aiBlockId ? { ...b, metadata: { ...b.metadata, isStreaming: false } } : b,
        ),
      );
      abortRef.current = null;
    }
  };

  const handleSendMessage = async (message: string, attachments?: ProcessedFile[]) => {
    if (!message.trim()) return;

    const activeAttachments = attachments || fileAttachments;
    const history = buildHistory(contentBlocks);

    // Add user message
    const userBlock: ContentBlock = {
      id: `user-${Date.now()}`,
      type: 'user-input',
      content: message.trim(),
      metadata: {
        timestamp: new Date(),
        attachments: activeAttachments?.map(file => ({
          id: file.id,
          name: file.name,
        }))
      }
    };

    setContentBlocks(prev => [...prev, userBlock]);
    setIsGenerating(true);
    setCurrentInput('');
    setFileAttachments([]);

    if (useLiveApi) {
      const aiBlockId = `ai-${Date.now()}`;
      const aiBlock: ContentBlock = {
        id: aiBlockId,
        type: 'ai-response',
        content: '',
        metadata: { isStreaming: true, timestamp: new Date() },
      };
      setContentBlocks(prev => [...prev, aiBlock]);
      await runLiveStream(message.trim(), history, aiBlockId);
      return;
    }

    // Simulate AI thinking delay (local demo / no API base URL)
    setTimeout(() => {
      const aiBlockId = `ai-${Date.now()}`;
      
      // Pick a random mock response or use the complex one for certain keywords
      let responseContent: string | ContentBlock;
      
      if (message.toLowerCase().includes('plan') || 
          message.toLowerCase().includes('analysis') ||
          message.toLowerCase().includes('recommend')) {
        responseContent = mockComplexResponse.content;
        
        // Add complex response with metadata (reasoning starts empty)
        const aiBlock: ContentBlock = {
          id: aiBlockId,
          type: 'ai-response',
          content: '',
          metadata: {
            isStreaming: true,
            timestamp: new Date(),
            reasoning: {
              content: '',
              duration: mockComplexResponse.metadata?.reasoning?.duration
            },
            citations: mockComplexResponse.metadata?.citations,
            tasks: mockComplexResponse.metadata?.tasks
          }
        };
        
        setContentBlocks(prev => [...prev, aiBlock]);
        simulateStreaming(
          responseContent, 
          aiBlockId, 
          mockComplexResponse.metadata?.reasoning as { content: string; duration: number }
        );
        return;
      }
      
      // Simple response with reasoning (starts empty)
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      responseContent = mockResponses[responseIndex];
      
      const aiBlock: ContentBlock = {
        id: aiBlockId,
        type: 'ai-response',
        content: '',
        metadata: {
          isStreaming: true,
          timestamp: new Date(),
          reasoning: {
            content: '',
            duration: simpleReasoningBlocks[responseIndex].duration
          }
        }
      };

      setContentBlocks(prev => [...prev, aiBlock]);
      simulateStreaming(responseContent, aiBlockId, simpleReasoningBlocks[responseIndex]);
    }, 800);
  };

  const handleClearChat = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setContentBlocks([]);
    setCurrentInput('');
    setFileAttachments([]);
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleRegenerate = (blockId: string) => {
    const blockIndex = contentBlocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;
    const target = contentBlocks[blockIndex];
    if (target.type !== 'ai-response') return;

    if (useLiveApi) {
      const blocksBefore = contentBlocks.slice(0, blockIndex);
      const last = blocksBefore[blocksBefore.length - 1];
      if (!last || last.type !== 'user-input') {
        toast.error('Cannot regenerate: no user message found.');
        return;
      }
      const userMessage = last.content;
      const history = buildHistory(blocksBefore.slice(0, -1));
      const aiBlockId = `ai-${Date.now()}`;
      setContentBlocks([...blocksBefore, {
        id: aiBlockId,
        type: 'ai-response',
        content: '',
        metadata: { isStreaming: true, timestamp: new Date() },
      }]);
      setIsGenerating(true);
      void runLiveStream(userMessage, history, aiBlockId);
      return;
    }

    const newResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId
          ? { ...block, content: '', metadata: { ...block.metadata, isStreaming: true } }
          : block,
      ),
    );
    setIsGenerating(true);
    setTimeout(() => {
      simulateStreaming(newResponse, blockId);
    }, 500);
  };

  const handleTaskToggle = (blockId: string, taskId: string) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id !== blockId) return block;
        
        return {
          ...block,
          metadata: {
            ...block.metadata,
            tasks: block.metadata?.tasks?.map(task =>
              task.id === taskId
                ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' as const }
                : task
            )
          }
        };
      })
    );
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
        data-tour="ai-hub-panel"
        className="fixed right-0 top-0 h-screen bg-background border-l border-border shadow-2xl z-[80] flex flex-col max-lg:w-full transition-transform duration-300"
        style={{ width: currentWidth }}
      >
        <OverlayTour tourKey="ai-hub" steps={aiHubTourSteps} />
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

        {/* Content Area - Document Style */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 pb-32" data-tour="ai-hub-welcome">
          {contentBlocks.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-8">
                  <img 
                    src={ascensionLogo} 
                    alt="Ascension" 
                    className="h-16 w-auto"
                  />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">
                    PCS AI
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full px-4">
              {contentBlocks.map((block) => (
                <ContentBlockRenderer
                  key={block.id}
                  block={block}
                  onRegenerate={handleRegenerate}
                  onTaskToggle={handleTaskToggle}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-4 left-4 right-4" data-tour="ai-hub-input">
          <PillChatBar
            value={currentInput}
            onChange={setCurrentInput}
            onSend={handleSendMessage}
            onAttach={(files) => setFileAttachments(prev => [...prev, ...files])}
            onRemoveAttachment={(id) => setFileAttachments(prev => prev.filter(f => f.id !== id))}
            attachments={fileAttachments}
            isLoading={false}
            isGenerating={isGenerating}
            onStop={() => {
              abortRef.current?.abort();
              if (streamingIntervalRef.current) {
                clearInterval(streamingIntervalRef.current);
                streamingIntervalRef.current = null;
              }
              setIsGenerating(false);
            }}
            placeholder="Ask anything..."
            showVoice={true}
            onMinimize={() => setOpen(false)}
            onClearChat={handleClearChat}
          />
        </div>
      </div>
    </>
  );
};
