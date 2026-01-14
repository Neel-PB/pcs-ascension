import { useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFeedbackComments } from '@/hooks/useFeedbackComments';
import { LogoLoader } from '@/components/ui/LogoLoader';

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

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-xs">{commentCount}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-border/20 focus:outline-none focus-visible:outline-none focus-visible:ring-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[400px]">
          {/* Messages List */}
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LogoLoader size="sm" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="group flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={comment.author?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.author?.first_name, comment.author?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.author?.first_name || 'Unknown'} {comment.author?.last_name || ''}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                          onClick={() => deleteComment.mutate(comment.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Composer */}
          <div className="pt-4 border-t mt-4">
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
            <p className="text-xs text-muted-foreground mt-1">⌘ + Enter to send</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
