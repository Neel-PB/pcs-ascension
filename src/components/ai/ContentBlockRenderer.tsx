import { useState } from 'react';
import { ContentBlock } from '@/types/contentBlock';
import { Response } from './elements/Response';
import { Reasoning } from './elements/Reasoning';
import { Task } from './elements/Task';
import { Actions } from './elements/Actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

    case 'data-table': {
      const columns = block.metadata?.columns ?? [];
      const rows = block.metadata?.rows ?? [];
      const totalRows = block.metadata?.totalRows;
      return (
        <DataTableSection
          columns={columns}
          rows={rows}
          totalRows={totalRows}
        />
      );
    }

    case 'ai-response':
      return (
        <div className="relative group mb-6">
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

function DataTableSection({
  columns,
  rows,
  totalRows,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
  totalRows?: number;
}) {
  const [open, setOpen] = useState(false);

  const tableBody = (
    <div className="max-h-[280px] overflow-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="whitespace-nowrap px-4 py-3 font-medium text-muted-foreground bg-muted/50"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.key} className="whitespace-nowrap px-4 py-3 align-middle">
                  {row[col.key] != null ? String(row[col.key]) : '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalRows != null && rows.length < totalRows && (
        <p className="text-xs text-muted-foreground mt-2 px-4">
          Showing {rows.length} of {totalRows} rows
        </p>
      )}
    </div>
  );

  return (
    <div className="mb-6 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
        <span className="text-xs font-medium text-muted-foreground">Data table</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-auto">
            {tableBody}
          </DialogContent>
        </Dialog>
      </div>
      {tableBody}
    </div>
  );
}
