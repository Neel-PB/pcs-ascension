import { useState, useEffect } from 'react';
import { ColumnDef } from '@/types/table';
import { Feedback } from '@/hooks/useFeedback';
import { TruncatedTextCell } from '@/components/editable-table/cells/TruncatedTextCell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FeedbackCommentsDialog } from '@/components/feedback/FeedbackCommentsDialog';
import {
  Bug,
  Lightbulb,
  Wrench,
  HelpCircle,
  CameraOutline,
  Trash2Outline,
} from '@/lib/icons';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  bug: { icon: Bug, label: 'Bug', color: 'bg-destructive/10 text-destructive' },
  feature: { icon: Lightbulb, label: 'Feature', color: 'bg-amber-100 text-amber-700' },
  improvement: { icon: Wrench, label: 'Improve', color: 'bg-primary/10 text-primary' },
  question: { icon: HelpCircle, label: 'Question', color: 'bg-purple-100 text-purple-700' },
};

const pcsStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  disregard: { label: 'Disregard', color: 'bg-muted text-muted-foreground' },
  backlog: { label: 'Backlog', color: 'bg-amber-100 text-amber-700' },
};

const pbStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  high: { label: 'High', color: 'text-orange-600' },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const hoursAgo = differenceInHours(new Date(), date);
  if (hoursAgo < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, 'MMM d, yyyy');
}

// Screenshot cell with signed URL fallback
function ScreenshotButton({ screenshotUrl }: { screenshotUrl: string | null }) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(screenshotUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setResolvedUrl(screenshotUrl);
    setImageError(false);
  }, [screenshotUrl]);

  const handleImageError = async () => {
    if (!screenshotUrl || imageError) return;
    try {
      const match = screenshotUrl.match(/feedback-screenshots\/(.+)$/);
      if (!match) { setImageError(true); return; }
      const { data, error } = await supabase.storage
        .from('feedback-screenshots')
        .createSignedUrl(match[1], 60 * 10);
      if (error || !data?.signedUrl) { setImageError(true); return; }
      setResolvedUrl(data.signedUrl);
    } catch {
      setImageError(true);
    }
  };

  if (!screenshotUrl || imageError) {
    return (
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-30 cursor-default" disabled>
        <CameraOutline className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <CameraOutline className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-2 border-border/20">
        <img
          src={resolvedUrl || screenshotUrl}
          alt="Screenshot"
          className="w-full h-auto rounded"
          onError={handleImageError}
        />
      </DialogContent>
    </Dialog>
  );
}

export interface FeedbackColumnHandlers {
  onTypeChange: (id: string, type: string) => void;
  onPcsStatusChange: (id: string, status: string) => void;
  onPbStatusChange: (id: string, status: string) => void;
  onPriorityChange: (id: string, priority: string) => void;
  onDelete: (id: string) => void;
  canManageFeedback: boolean;
  commentCounts: Map<string, number>;
}

export function createFeedbackColumns(handlers: FeedbackColumnHandlers): ColumnDef<Feedback>[] {
  const {
    onTypeChange,
    onPcsStatusChange,
    onPbStatusChange,
    onPriorityChange,
    onDelete,
    canManageFeedback,
    commentCounts,
  } = handlers;

  return [
    {
      id: 'title',
      label: 'Title',
      type: 'custom',
      width: 180,
      minWidth: 160,
      sortable: true,
      resizable: false,
      draggable: true,
      locked: true,
      renderCell: (row) => (
        <TruncatedTextCell value={row.title} maxLength={40} />
      ),
    },
    {
      id: 'description',
      label: 'Description',
      type: 'custom',
      width: 240,
      minWidth: 200,
      sortable: false,
      resizable: false,
      draggable: true,
      renderCell: (row) => (
        <TruncatedTextCell value={row.description} maxLength={60} className="text-muted-foreground" />
      ),
    },
    {
      id: 'author',
      label: 'Author',
      type: 'custom',
      width: 120,
      minWidth: 100,
      sortable: true,
      resizable: false,
      draggable: true,
      getValue: (row) => {
        const a = row.author;
        return a ? `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Unknown' : 'Unknown';
      },
      renderCell: (row) => {
        const name = row.author
          ? `${row.author.first_name || ''} ${row.author.last_name || ''}`.trim() || 'Unknown'
          : 'Unknown';
        return <div className="px-4 py-2"><span className="text-sm font-medium truncate block">{name}</span></div>;
      },
    },
    {
      id: 'type',
      label: 'Type',
      type: 'custom',
      width: 110,
      minWidth: 100,
      sortable: true,
      resizable: false,
      draggable: true,
      renderCell: (row) => {
        const info = typeConfig[row.type] || typeConfig.question;
        const TypeIcon = info.icon;
        return (
          <div className="px-2 flex items-center h-full">
          <Select value={row.type} onValueChange={(v) => onTypeChange(row.id, v)}>
            <SelectTrigger className="h-7 border-none bg-transparent hover:bg-muted/50 rounded-lg px-1.5 [&>svg]:hidden [&>span]:flex [&>span]:items-center">
              <SelectValue>
                <Badge variant="secondary" className={cn('text-xs', info.color)}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {info.label}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {Object.entries(typeConfig).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={value} value={value} className="text-xs">
                    <div className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          </div>
        );
      },
    },
    {
      id: 'pcs_status',
      label: 'ACS Status',
      type: 'custom',
      width: 120,
      minWidth: 110,
      sortable: true,
      resizable: false,
      draggable: true,
      renderCell: (row) => (
        <div className="px-2 flex items-center h-full">
        <Select
          value={row.pcs_status}
          onValueChange={(v) => onPcsStatusChange(row.id, v)}
          disabled={!canManageFeedback}
        >
          <SelectTrigger className={cn(
            'h-7 border-none bg-transparent hover:bg-muted/50 rounded-lg px-1.5 [&>svg]:hidden [&>span]:flex [&>span]:items-center',
            !canManageFeedback && 'opacity-60 cursor-not-allowed'
          )}>
            <SelectValue>
              <Badge variant="secondary" className={cn('text-xs', pcsStatusConfig[row.pcs_status]?.color)}>
                {pcsStatusConfig[row.pcs_status]?.label}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {Object.entries(pcsStatusConfig).map(([value, config]) => (
              <SelectItem key={value} value={value} className="text-xs">
                <Badge variant="secondary" className={cn('text-xs', config.color)}>
                  {config.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      ),
    },
    {
      id: 'pb_status',
      label: 'PB Status',
      type: 'custom',
      width: 120,
      minWidth: 110,
      sortable: true,
      resizable: false,
      draggable: true,
      renderCell: (row) => {
        const isPbLocked = row.pcs_status === 'disregard' || row.pcs_status === 'backlog';
        const effectiveStatus = isPbLocked ? 'closed' : row.pb_status;
        return (
          <div className="px-2 flex items-center h-full">
          <Select
            value={effectiveStatus}
            onValueChange={(v) => onPbStatusChange(row.id, v)}
            disabled={isPbLocked || !canManageFeedback}
          >
            <SelectTrigger className={cn(
              'h-7 border-none bg-transparent hover:bg-muted/50 rounded-lg px-1.5 [&>svg]:hidden [&>span]:flex [&>span]:items-center',
              (isPbLocked || !canManageFeedback) && 'opacity-60 cursor-not-allowed'
            )}>
              <SelectValue>
                <Badge variant="secondary" className={cn('text-xs', pbStatusConfig[effectiveStatus]?.color)}>
                  {pbStatusConfig[effectiveStatus]?.label}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {Object.entries(pbStatusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  <Badge variant="secondary" className={cn('text-xs', config.color)}>
                    {config.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        );
      },
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'custom',
      width: 90,
      minWidth: 80,
      sortable: true,
      resizable: false,
      draggable: true,
      renderCell: (row) => {
        const info = priorityConfig[row.priority] || priorityConfig.medium;
        return (
          <div className="px-2 flex items-center h-full">
          <Select value={row.priority} onValueChange={(v) => onPriorityChange(row.id, v)}>
            <SelectTrigger className="h-7 border-none bg-transparent hover:bg-muted/50 rounded-lg px-1.5 [&>svg]:hidden [&>span]:flex [&>span]:items-center">
              <SelectValue>
                <span className={cn('text-xs font-medium', info.color)}>{info.label}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {Object.entries(priorityConfig).map(([value, config]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        );
      },
    },
    {
      id: 'created_at',
      label: 'Date',
      type: 'custom',
      width: 110,
      minWidth: 90,
      sortable: true,
      resizable: false,
      draggable: true,
      renderCell: (row) => (
        <div className="px-4 py-2"><span className="text-sm text-foreground">{formatDate(row.created_at)}</span></div>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      type: 'custom',
      width: 140,
      minWidth: 140,
      sortable: false,
      resizable: false,
      draggable: false,
      renderCell: (row) => (
        <div className="flex items-center gap-2 px-4">
          <ScreenshotButton screenshotUrl={row.screenshot_url} />
          <FeedbackCommentsDialog
            feedbackId={row.id}
            commentCount={commentCounts.get(row.id) ?? 0}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                <Trash2Outline className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this feedback? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(row.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];
}
