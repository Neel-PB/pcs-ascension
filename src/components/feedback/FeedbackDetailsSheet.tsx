import { useState } from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Feedback, useFeedback } from '@/hooks/useFeedback';
import { useFeedbackComments } from '@/hooks/useFeedbackComments';
import { format } from 'date-fns';
import { ExternalLink, Send, Trash2, Image, Calendar, Globe, Monitor } from 'lucide-react';

interface FeedbackDetailsSheetProps {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig = {
  bug: { label: 'Bug Report', color: 'bg-red-500/10 text-red-600 border-red-200' },
  feature: { label: 'Feature Request', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  improvement: { label: 'Improvement', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  question: { label: 'Question', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
};

const pcsStatusConfig = {
  pending: { label: 'Pending', color: 'bg-blue-500/10 text-blue-600' },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-600' },
  disregard: { label: 'Disregard', color: 'bg-muted text-muted-foreground' },
  backlog: { label: 'Backlog', color: 'bg-amber-500/10 text-amber-600' },
};

const pbStatusConfig = {
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-600' },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-600' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  high: { label: 'High', color: 'text-orange-600' },
  critical: { label: 'Critical', color: 'text-red-600' },
};

export const FeedbackDetailsSheet: React.FC<FeedbackDetailsSheetProps> = ({
  feedback,
  open,
  onOpenChange,
}) => {
  const { updatePcsStatus, updatePbStatus } = useFeedback();
  const { comments, isLoading: commentsLoading, addComment, deleteComment } = useFeedbackComments(feedback?.id ?? null);
  const [newComment, setNewComment] = useState('');
  const [showScreenshot, setShowScreenshot] = useState(false);

  if (!feedback) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync(newComment.trim());
    setNewComment('');
  };

  const browserInfo = feedback.browser_info as Record<string, unknown> | null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
          side="right"
        >
          {/* Header */}
          <div
            className="shrink-0 px-6 border-b border-border flex flex-col justify-center"
            style={{ height: 'var(--header-height)' }}
          >
            <h2 className="text-lg font-semibold line-clamp-1">{feedback.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={typeConfig[feedback.type].color}>
                {typeConfig[feedback.type].label}
              </Badge>
              <Badge className={pcsStatusConfig[feedback.pcs_status]?.color}>
                {pcsStatusConfig[feedback.pcs_status]?.label}
              </Badge>
              <Badge className={pbStatusConfig[feedback.pb_status]?.color}>
                {pbStatusConfig[feedback.pb_status]?.label}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-t py-4 px-6 shrink-0">
              <TabsList className="bg-muted p-1.5 rounded-lg">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Screenshot */}
                  {feedback.screenshot_url && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Image className="h-4 w-4" />
                        Screenshot
                      </div>
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => setShowScreenshot(true)}
                      >
                        <img
                          src={feedback.screenshot_url}
                          alt="Feedback screenshot"
                          className="w-full h-48 object-cover rounded-lg border border-border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">Click to enlarge</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {feedback.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted
                      </span>
                      <p className="text-sm">
                        {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Priority</span>
                      <p className={`text-sm font-medium ${priorityConfig[feedback.priority].color}`}>
                        {priorityConfig[feedback.priority].label}
                      </p>
                    </div>
                  </div>

                  {/* Page URL */}
                  {feedback.page_url && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Page URL
                      </span>
                      <a
                        href={feedback.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {feedback.page_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Browser Info */}
                  {browserInfo && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        Browser Info
                      </span>
                      <div className="text-xs bg-muted/50 rounded-lg p-3 space-y-1">
                        <p><strong>Screen:</strong> {String(browserInfo.screenWidth)}x{String(browserInfo.screenHeight)}</p>
                        <p><strong>Viewport:</strong> {String(browserInfo.viewportWidth)}x{String(browserInfo.viewportHeight)}</p>
                        <p><strong>Platform:</strong> {String(browserInfo.platform)}</p>
                      </div>
                    </div>
                  )}

                  {/* PCS Status Update */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">PCS Status</span>
                    <Select
                      value={feedback.pcs_status}
                      onValueChange={(value) => 
                        updatePcsStatus.mutate({ 
                          id: feedback.id, 
                          pcs_status: value as Feedback['pcs_status'] 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="disregard">Disregard</SelectItem>
                        <SelectItem value="backlog">Backlog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* PB Status Update */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">PB Status</span>
                    <Select
                      value={feedback.pcs_status === 'disregard' || feedback.pcs_status === 'backlog' ? 'closed' : feedback.pb_status}
                      onValueChange={(value) => 
                        updatePbStatus.mutate({ 
                          id: feedback.id, 
                          pb_status: value as Feedback['pb_status'] 
                        })
                      }
                      disabled={feedback.pcs_status === 'disregard' || feedback.pcs_status === 'backlog'}
                    >
                      <SelectTrigger className={feedback.pcs_status === 'disregard' || feedback.pcs_status === 'backlog' ? 'opacity-60' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    {(feedback.pcs_status === 'disregard' || feedback.pcs_status === 'backlog') && (
                      <p className="text-xs text-muted-foreground">
                        PB Status is locked to "Closed" when PCS Status is Disregard or Backlog
                      </p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comments" className="flex-1 flex flex-col overflow-hidden m-0">
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {comment.author?.first_name?.[0] ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.author?.first_name ?? 'User'} {comment.author?.last_name ?? ''}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteComment.mutate(comment.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Comment input */}
              <div className="shrink-0 p-4 border-t border-border bg-muted/30">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="resize-none"
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
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-border">
            <Button variant="ascension" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Screenshot Modal */}
      {showScreenshot && feedback.screenshot_url && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <img
            src={feedback.screenshot_url}
            alt="Feedback screenshot"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};
