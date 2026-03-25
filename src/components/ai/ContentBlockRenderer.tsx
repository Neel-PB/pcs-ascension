import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { ContentBlock } from '@/types/contentBlock';
import { Response } from './elements/Response';
import { ToolActivityRow } from './elements/ToolActivityRow';
import { Reasoning } from './elements/Reasoning';
import { Task } from './elements/Task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SearchField } from '@/components/ui/search-field';
import { cn } from '@/lib/utils';

interface ContentBlockRendererProps {
  block: ContentBlock;
  onTaskToggle?: (blockId: string, taskId: string) => void;
}

export const ContentBlockRenderer = ({ 
  block, 
  onTaskToggle 
}: ContentBlockRendererProps) => {
  const { user } = useAuth();
  const userLabel =
    user?.firstName?.trim() ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'You';

  switch (block.type) {
    case 'user-input':
      return (
        <div className="mb-8 text-right">
          <div className="flex justify-end mb-1.5">
            <Badge variant="default" className="font-medium tracking-wide">
              {userLabel}
            </Badge>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{block.content}</p>
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

    case 'ai-response': {
      const toolSteps = block.metadata?.toolSteps;
      const hasRunningTool = toolSteps?.some((s) => s.status === 'running');
      return (
        <div className="mb-8">
          <div className="flex justify-start mb-1.5">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary font-medium tracking-wide"
            >
              PCS AI
            </Badge>
          </div>

          {toolSteps && toolSteps.length > 0 && (
            <div className="mb-2 space-y-1 pl-0.5">
              {toolSteps.map((step) => (
                <ToolActivityRow key={step.id} step={step} />
              ))}
            </div>
          )}

          {/* Reasoning block (if present) */}
          {block.metadata?.reasoning && (
            <Reasoning 
              reasoning={block.metadata.reasoning}
              isStreaming={block.metadata.isStreaming}
            />
          )}

          {/* Main response — plain document text, no bubble */}
          <Response 
            content={block.content}
            isStreaming={block.metadata.isStreaming}
            suppressEmptyShimmer={Boolean(hasRunningTool)}
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
        </div>
      );
    }

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

/** Case-insensitive match across every column value in the retrieved rows. */
function filterRowsByQuery(
  rows: Record<string, unknown>[],
  columns: { key: string }[],
  query: string,
): Record<string, unknown>[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    columns.some((col) => {
      const v = row[col.key];
      if (v == null) return false;
      return String(v).toLowerCase().includes(q);
    }),
  );
}

/**
 * Read-only table styled like `EditableTable` / Positions module:
 * `rounded-lg border bg-card shadow-sm` should wrap this when not inside an existing card shell.
 */
function DataTableScroll({
  columns,
  rows,
  emptyMessage,
  stickyHeader,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
  emptyMessage?: string;
  stickyHeader?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-[140px] items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage ?? 'No data'}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full min-w-max caption-bottom border-collapse text-sm">
        <thead
          className={cn(
            'border-b border-border bg-muted/50 backdrop-blur-sm',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="h-12 whitespace-nowrap px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="h-12 border-b border-border transition-colors hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="whitespace-nowrap px-4 py-2 align-middle text-foreground"
                >
                  {row[col.key] != null ? String(row[col.key]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
  const {
    inputValue: expandSearchInput,
    debouncedValue: expandSearchDebounced,
    setInputValue: setExpandSearchInput,
  } = useDebouncedSearch(200);

  const filteredRows = useMemo(
    () => filterRowsByQuery(rows, columns, expandSearchDebounced),
    [rows, columns, expandSearchDebounced],
  );

  const handleDialogOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setExpandSearchInput('');
  };

  const truncatedHint =
    totalRows != null && rows.length < totalRows ? (
      <p className="text-xs text-muted-foreground mt-2 px-4">
        Showing {rows.length} of {totalRows} rows from the server
      </p>
    ) : null;

  const compactScroll = (
    <div className="max-h-[280px] min-h-0 overflow-auto">
      <DataTableScroll columns={columns} rows={rows} emptyMessage="No rows in this result." />
      {truncatedHint}
    </div>
  );

  return (
    <div className="mb-6 flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Data table</span>
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex max-h-[min(88vh,920px)] w-[min(96vw,1400px)] max-w-[min(96vw,1400px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1400px)]"
            aria-describedby={undefined}
          >
            <DialogHeader className="space-y-0 border-b border-border bg-muted/25 px-4 py-3 text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <DialogTitle className="text-base font-semibold">Data table</DialogTitle>
                <div className="w-full sm:max-w-md sm:shrink-0">
                  <SearchField
                    placeholder="Search across all columns…"
                    value={expandSearchInput}
                    onChange={(e) => setExpandSearchInput(e.target.value)}
                    className="w-full"
                    aria-label="Filter table rows"
                  />
                </div>
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-auto px-3 pb-4 pt-2">
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="max-h-[min(72vh,800px)] min-h-0 overflow-auto">
                  <DataTableScroll
                    columns={columns}
                    rows={filteredRows}
                    emptyMessage="No rows match your search. Try different words or clear the search."
                    stickyHeader
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {compactScroll}
    </div>
  );
}
