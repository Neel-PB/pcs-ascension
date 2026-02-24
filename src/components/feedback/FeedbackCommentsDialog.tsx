import { useState } from 'react';
import { MessageSquare, Send, Trash2 } from '@/lib/icons';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedbackComments } from '@/hooks/useFeedbackComments';
import { LogoLoader } from '@/components/ui/LogoLoader';
import TextareaAutosize from 'react-textarea-autosize';

interface FeedbackCommentsDialogProps {
  feedbackId: string;
  commentCount?: number;
}

export const FeedbackCommentsDialog = ({ feedbackId, commentCount = 0 }: FeedbackCommentsDialogProps) => {
  const [newComment, setNewComment] = useState('');
  const [open, setOpen] = useState(false);
  const { comments, isLoading, addComment, deleteComment } = useFeedbackComments(feedbackId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hoursAgo = differenceInHours(new Date(), date);
    if (hoursAgo < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d, yyyy');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync(newComment);
    setNewComment('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{commentCount}</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{commentCount > 0 ? `Comments (${commentCount})` : 'No Comments'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-md border-border/20 focus:outline-none focus-visible:outline-none focus-visible:ring-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[350px]">
          {/* Messages List */}
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LogoLoader size="sm" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="rounded-full bg-muted p-3 mb-2">
                  <MessageSquare className="h-6 w-6 opacity-50" />
                </div>
                <p className="text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="group flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-foreground px-1">
                      {comment.author?.first_name || 'Unknown'} {comment.author?.last_name || ''}
                    </span>
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                      <p className="text-sm break-words">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteComment.mutate(comment.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pill Composer */}
          <div className="pt-3 border-t mt-3">
            <div className="flex items-end gap-1 rounded-xl border border-border/60 shadow-sm px-3 py-2 focus-within:border-primary/40 transition-colors">
              <TextareaAutosize
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-[120px]"
                maxRows={5}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddComment}
                disabled={!newComment.trim() || addComment.isPending}
                className="shrink-0 h-7 w-7"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 px-1">⌘ + Enter to send</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
