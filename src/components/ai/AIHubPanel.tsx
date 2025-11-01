import { useEffect, useRef, useState } from 'react';
import { useAIHub } from '@/hooks/useAIHub';
import { useResizable } from '@/hooks/useResizable';
import { PillChatBar } from './PillChatBar';
import { AIWelcomeCards } from './AIWelcomeCards';
import { ContentBlock } from '@/types/contentBlock';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { mockComplexResponse } from '@/data/mockContentBlocks';

interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'excel' | 'text' | 'csv';
  data: string;
  mimeType: string;
  size: number;
  extractedText?: string;
}

const MIN_WIDTH = 360;
const MAX_WIDTH_VW = 0.7;
const SNAP_POINTS = [400, 520, 640, 820];

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

  // Simulate streaming text effect
  const simulateStreaming = (fullText: string, blockId: string) => {
    let currentIndex = 0;
    const chunkSize = 15; // Characters per update
    const updateInterval = 50; // ms between updates

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

  const handleSendMessage = async (message: string, attachments?: ProcessedFile[]) => {
    if (!message.trim()) return;

    const activeAttachments = attachments || fileAttachments;

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

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiBlockId = `ai-${Date.now()}`;
      
      // Pick a random mock response or use the complex one for certain keywords
      let responseContent: string | ContentBlock;
      
      if (message.toLowerCase().includes('plan') || 
          message.toLowerCase().includes('analysis') ||
          message.toLowerCase().includes('recommend')) {
        responseContent = mockComplexResponse.content;
        
        // Add complex response with metadata
        const aiBlock: ContentBlock = {
          id: aiBlockId,
          type: 'ai-response',
          content: '',
          metadata: {
            isStreaming: true,
            timestamp: new Date(),
            ...mockComplexResponse.metadata
          }
        };
        
        setContentBlocks(prev => [...prev, aiBlock]);
        simulateStreaming(responseContent, aiBlockId);
        return;
      }
      
      // Simple response
      responseContent = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const aiBlock: ContentBlock = {
        id: aiBlockId,
        type: 'ai-response',
        content: '',
        metadata: {
          isStreaming: true,
          timestamp: new Date(),
        }
      };

      setContentBlocks(prev => [...prev, aiBlock]);
      simulateStreaming(responseContent, aiBlockId);
    }, 800);
  };

  const handleWelcomeCardClick = (action: string) => {
    setCurrentInput(action);
  };

  const handleClearChat = () => {
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
    // Find the block to regenerate
    const blockIndex = contentBlocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    // Get a different random response
    const newResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Update the block to start streaming again
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId
          ? { ...block, content: '', metadata: { ...block.metadata, isStreaming: true } }
          : block
      )
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

        {/* Content Area - Document Style */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 pb-32">
          {contentBlocks.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <AIWelcomeCards onCardClick={handleWelcomeCardClick} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
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
        <div className="absolute bottom-4 left-4 right-4">
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
