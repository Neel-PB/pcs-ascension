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

/** One row in the AI panel when a backend tool runs (resolve_scope, get_positions, list_scope, …). */
export interface ToolActivityStep {
  id: string;
  apiName: string;
  status: 'running' | 'done';
  /** When the API sends `tool.label` (e.g. Staffing submodule), overrides the default tool noun. */
  displayTarget?: string;
}

export interface ContentBlockMetadata {
  isStreaming?: boolean;
  /** Inline tool execution rows (Running X → Ran X). */
  toolSteps?: ToolActivityStep[];
  citations?: Citation[];
  reasoning?: ReasoningBlock;
  tasks?: Task[];
  timestamp?: Date;
  attachments?: Array<{ id: string; name: string }>;
  /** When type is data-table */
  columns?: { key: string; label: string }[];
  rows?: Record<string, unknown>[];
  totalRows?: number;
}

export interface ContentBlock {
  id: string;
  type: 'user-input' | 'ai-response' | 'data-table' | 'reasoning' | 'task-list';
  content: string;
  metadata?: ContentBlockMetadata;
}
