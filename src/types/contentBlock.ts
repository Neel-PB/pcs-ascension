export interface Citation {
  number: number;
  title: string;
  url: string;
  description?: string;
  quote?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface ReasoningBlock {
  content: string;
  duration?: number;
}

export interface ContentBlockMetadata {
  isStreaming?: boolean;
  citations?: Citation[];
  reasoning?: ReasoningBlock;
  tasks?: Task[];
  timestamp?: Date;
  attachments?: Array<{ id: string; name: string }>;
}

export interface ContentBlock {
  id: string;
  type: 'user-input' | 'ai-response' | 'reasoning' | 'task-list';
  content: string;
  metadata?: ContentBlockMetadata;
}
