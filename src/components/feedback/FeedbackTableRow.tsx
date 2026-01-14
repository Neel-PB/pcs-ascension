import { useState } from 'react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFeedbackComments } from '@/hooks/useFeedbackComments';
import { useFeedback } from '@/hooks/useFeedback';
import {
  ChevronDown,
  ChevronRight,
  Camera,
  Send,
  Trash2,
  Bug,
  Lightbulb,
  Sparkles,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feedback {
  id: string;
  user_id: string;
  title: string;
  type: string;
  priority: string;
  description: string;
  screenshot_url: string | null;
  page_url: string | null;
  browser_info: any;
  status: string;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface FeedbackTableRowProps {
  feedback: Feedback;
  onDelete: (id: string) => void;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  bug: { icon: Bug, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  feature: { icon: Lightbulb, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  improvement: { icon: Sparkles, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  question: { icon: HelpCircle, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const statusConfig: Record<string, string> = {
  new: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const priorityConfig: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
};

export function FeedbackTableRow({ feedback, onDelete }: FeedbackTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { comments, addComment, deleteComment } = useFeedbackComments(feedback.id);
  const { updateFeedbackStatus } = useFeedback();

  const authorName = feedback.author
    ? `${feedback.author.first_name || ''} ${feedback.author.last_name || ''}`.trim() || 'Unknown'
    : 'Unknown';
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const TypeIcon = typeConfig[feedback.type]?.icon || HelpCircle;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hoursAgo = differenceInHours(new Date(), date);
    if (hoursAgo < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d, yyyy');
  };

  const handleStatusChange = (newStatus: 'new' | 'in_progress' | 'resolved' | 'closed') => {
    updateFeedbackStatus.mutate({ id: feedback.id, status: newStatus });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate(newComment.trim(), {
      onSuccess: () => setNewComment(''),
    });
  };

  return (
    <>
      {/* Main Row */}
      <TableRow
        className={cn(
          'cursor-pointer transition-colors',
          isExpanded && 'bg-muted/50'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand Icon */}
        <TableCell className="w-10 px-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>

        {/* Author */}
        <TableCell className="w-[150px]">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={feedback.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm truncate max-w-[100px]">{authorName}</span>
          </div>
        </TableCell>

        {/* Type */}
        <TableCell className="w-[120px]">
          <Badge variant="secondary" className={cn('gap-1', typeConfig[feedback.type]?.color)}>
            <TypeIcon className="h-3 w-3" />
            <span className="capitalize">{feedback.type}</span>
          </Badge>
        </TableCell>

        {/* Title */}
        <TableCell>
          <span className="font-medium truncate block max-w-[300px]">{feedback.title}</span>
        </TableCell>

        {/* Screenshot */}
        <TableCell className="w-[80px] text-center">
          {feedback.screenshot_url ? (
            <Camera className="h-4 w-4 text-muted-foreground mx-auto" />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>

        {/* Status - Inline Dropdown */}
        <TableCell className="w-[140px]" onClick={(e) => e.stopPropagation()}>
          <Select value={feedback.status} onValueChange={(value) => handleStatusChange(value as 'new' | 'in_progress' | 'resolved' | 'closed')}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>

        {/* Priority */}
        <TableCell className="w-[100px]">
          <span className={cn('capitalize font-medium', priorityConfig[feedback.priority])}>
            {feedback.priority}
          </span>
        </TableCell>

        {/* Date */}
        <TableCell className="w-[100px] text-muted-foreground text-sm">
          {formatDate(feedback.created_at)}
        </TableCell>
      </TableRow>

      {/* Expanded Content Row */}
      {isExpanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={8} className="p-0">
            <div className="p-4 space-y-4">
              {/* Screenshot & Description */}
              <div className="flex gap-4">
                {feedback.screenshot_url && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                        <img
                          src={feedback.screenshot_url}
                          alt="Screenshot"
                          className="w-48 h-32 object-cover rounded-lg border border-border"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-2">
                      <img
                        src={feedback.screenshot_url}
                        alt="Screenshot"
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {feedback.description}
                  </p>
                  {feedback.page_url && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Page: <span className="font-mono">{feedback.page_url}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Comments ({comments.length})</h4>
                </div>

                {comments.length > 0 && (
                  <ScrollArea className="max-h-[200px] mb-3">
                    <div className="space-y-3 pr-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2 group">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={comment.author?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {(comment.author?.first_name?.[0] || '') + (comment.author?.last_name?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {comment.author?.first_name} {comment.author?.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteComment.mutate(comment.id)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Delete Action */}
              <div className="flex justify-end pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(feedback.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Feedback
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
