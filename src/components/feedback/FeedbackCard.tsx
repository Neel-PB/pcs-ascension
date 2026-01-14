import { useState, useRef, useEffect } from 'react';
import { Feedback, useFeedback } from '@/hooks/useFeedback';
import { useFeedbackComments } from '@/hooks/useFeedbackComments';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig = {
  bug: { label: '🐛 Bug', color: 'bg-red-500/10 text-red-600 border-red-200' },
  feature: { label: '✨ Feature', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  improvement: { label: '🔧 Improvement', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  question: { label: '❓ Question', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
};

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-500/10 text-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-600' },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-600' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  high: { label: 'High', color: 'text-orange-600' },
  critical: { label: 'Critical', color: 'text-red-600 font-semibold' },
};

interface FeedbackCardProps {
  feedback: Feedback;
  onDelete: (id: string) => void;
}

export function FeedbackCard({ feedback, onDelete }: FeedbackCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { updateFeedbackStatus } = useFeedback();
  const { comments, isLoading: commentsLoading, addComment, deleteComment } = useFeedbackComments(
    isOpen ? feedback.id : null
  );
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when comments load or new comment added
  useEffect(() => {
    if (isOpen && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isOpen]);

  const handleStatusChange = (status: string) => {
    updateFeedbackStatus.mutate({ id: feedback.id, status: status as Feedback['status'] });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync(newComment.trim());
    setNewComment('');
  };

  const getAuthorInitials = () => {
    const first = feedback.author?.first_name?.[0] || '';
    const last = feedback.author?.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getAuthorName = () => {
    if (feedback.author?.first_name || feedback.author?.last_name) {
      return `${feedback.author.first_name || ''} ${feedback.author.last_name || ''}`.trim();
    }
    return 'Unknown User';
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    if (differenceInHours(new Date(), date) < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d, yyyy');
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header - Always visible */}
          <CollapsibleTrigger asChild>
            <div className="w-full p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                {/* Author Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={feedback.author?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getAuthorInitials()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Top row: Author + Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{getAuthorName()}</span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <Badge variant="outline" className={cn('text-xs', typeConfig[feedback.type].color)}>
                      {typeConfig[feedback.type].label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1">{feedback.title}</h3>

                  {/* Bottom row: Screenshot indicator, Status, Priority, Date */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {feedback.screenshot_url && (
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Screenshot</span>
                      </div>
                    )}
                    <Badge className={cn('text-xs', statusConfig[feedback.status].color)}>
                      {statusConfig[feedback.status].label}
                    </Badge>
                    <span className={cn('text-xs', priorityConfig[feedback.priority].color)}>
                      {priorityConfig[feedback.priority].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(feedback.created_at)}
                    </span>
                  </div>
                </div>

                {/* Expand indicator */}
                <div className="shrink-0 text-muted-foreground">
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* Expanded Content */}
          <CollapsibleContent>
            <div className="border-t border-border">
              {/* Status Change Row */}
              <div className="px-4 py-3 bg-muted/20 flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select
                  value={feedback.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground ml-auto">Priority:</span>
                <span className={cn('text-sm', priorityConfig[feedback.priority].color)}>
                  {priorityConfig[feedback.priority].label}
                </span>
              </div>

              {/* Screenshot */}
              {feedback.screenshot_url && (
                <div className="px-4 py-3 border-t border-border/50">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Screenshot
                  </p>
                  <div
                    className="relative w-full max-w-md rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowImageDialog(true)}
                  >
                    <img
                      src={feedback.screenshot_url}
                      alt="Feedback screenshot"
                      className="w-full h-auto object-contain max-h-48"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="text-transparent hover:text-white text-sm font-medium">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="px-4 py-3 border-t border-border/50">
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {feedback.description}
                </p>
              </div>

              {/* Comments Section */}
              <div className="px-4 py-3 border-t border-border/50">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({comments.length})
                </p>

                {/* Comments List */}
                {comments.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                    {comments.map((comment) => {
                      const initials = `${comment.author?.first_name?.[0] || ''}${comment.author?.last_name?.[0] || ''}`.toUpperCase() || '?';
                      const name = comment.author?.first_name || comment.author?.last_name
                        ? `${comment.author.first_name || ''} ${comment.author.last_name || ''}`.trim()
                        : 'Unknown';

                      return (
                        <div key={comment.id} className="flex items-start gap-2 group">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={comment.author?.avatar_url || undefined} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/50 rounded-lg rounded-tl-sm px-3 py-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-medium">{name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{comment.content}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => deleteComment.mutate(comment.id)}
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      );
                    })}
                    <div ref={commentsEndRef} />
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex items-start gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="shrink-0"
                    disabled={!newComment.trim() || addComment.isPending}
                    onClick={handleAddComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Press ⌘+Enter to send
                </p>
              </div>

              {/* Delete Action */}
              <div className="px-4 py-3 border-t border-border/50 flex justify-end">
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
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Screenshot Enlargement Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <img
              src={feedback.screenshot_url || ''}
              alt="Feedback screenshot"
              className="w-full h-auto object-contain max-h-[85vh]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShowImageDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
