import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { Pencil, Trash2, ArrowUp, MessageSquare, Copy, Check, ChevronRight, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TextareaAutosize from "react-textarea-autosize";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  usePositionComments,
  useAddPositionComment,
  useUpdatePositionComment,
  useDeletePositionComment,
  PositionComment,
} from "@/hooks/usePositionComments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Smart timestamp: relative time within 24h, actual date after
const formatCommentTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const hoursAgo = differenceInHours(new Date(), date);
  
  if (hoursAgo < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, "MMM d, yyyy");
  }
};

interface PositionCommentSectionProps {
  positionId: string;
  onClose?: () => void;
}

// Component to render a single changed field row in activity log
function ActivityFieldRow({ 
  label, 
  oldValue, 
  newValue,
  isMultiline = false,
}: { 
  label: string; 
  oldValue: string | number | null | undefined; 
  newValue: string | number | null | undefined;
  isMultiline?: boolean;
}) {
  const oldStr = oldValue?.toString() || '';
  const newStr = newValue?.toString() || '';
  
  // Only show if there's an actual change
  const hasOld = oldValue !== null && oldValue !== undefined && oldValue !== '';
  const hasNew = newValue !== null && newValue !== undefined && newValue !== '';
  const hasActualChange = oldStr !== newStr && (hasOld || hasNew);

  if (!hasActualChange) {
    return null;
  }

  // For multi-line content (like reasons), use vertical layout
  if (isMultiline && (oldStr.length > 30 || newStr.length > 30)) {
    return (
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className="flex flex-col gap-1">
          {hasOld && (
            <div className="text-sm text-muted-foreground line-through">{oldStr}</div>
          )}
          <div className="flex items-start gap-2">
            <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-foreground">{newStr}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-14 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {hasOld && (
          <span className="text-sm text-muted-foreground">{oldStr}</span>
        )}
        <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground">{newStr}</span>
      </div>
    </div>
  );
}

// Render FTE activity log card - only shows fields that actually changed
function FteActivityCard({ metadata, displayName }: { metadata: Record<string, unknown>; displayName: string }) {
  const fteOld = metadata.fte_old as number | null;
  const fteNew = metadata.fte_new as number | null;
  const reasonOld = metadata.reason_old as string | null;
  const reasonNew = metadata.reason_new as string | null;
  const expiryOld = metadata.expiry_old as string | null;
  const expiryNew = metadata.expiry_new as string | null;

  // Format expiry dates
  const formattedExpiryOld = expiryOld ? format(new Date(expiryOld), "MMM d, yyyy") : null;
  const formattedExpiryNew = expiryNew ? format(new Date(expiryNew), "MMM d, yyyy") : null;

  // Check which fields have actual changes
  const fteChanged = fteOld !== fteNew;
  const reasonChanged = (reasonOld || '') !== (reasonNew || '');
  const expiryChanged = formattedExpiryOld !== formattedExpiryNew;
  
  const hasAnyChange = fteChanged || reasonChanged || expiryChanged;

  return (
    <div className="space-y-3">
      {fteChanged && (
        <ActivityFieldRow label="FTE" oldValue={fteOld} newValue={fteNew} />
      )}
      {reasonChanged && (
        <ActivityFieldRow label="Reason" oldValue={reasonOld} newValue={reasonNew} isMultiline />
      )}
      {expiryChanged && (
        <ActivityFieldRow label="Expiry" oldValue={formattedExpiryOld} newValue={formattedExpiryNew} />
      )}
      {!hasAnyChange && (
        <p className="text-sm text-muted-foreground italic">No changes detected</p>
      )}
      <div className="flex justify-end pt-1 border-t border-border/30">
        <span className="text-xs text-muted-foreground">by {displayName}</span>
      </div>
    </div>
  );
}

// Render Shift activity log card
function ShiftActivityCard({ metadata, displayName }: { metadata: Record<string, unknown>; displayName: string }) {
  const shiftOld = metadata.shift_old as string | null;
  const shiftNew = metadata.shift_new as string | null;
  const isRevert = metadata.is_revert as boolean;

  return (
    <div className="space-y-3">
      {isRevert ? (
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">Reverted to</span>
          <span className="text-sm font-medium text-foreground">{shiftNew}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {shiftOld && (
            <span className="text-sm text-muted-foreground">{shiftOld}</span>
          )}
          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">{shiftNew}</span>
        </div>
      )}
      <div className="flex justify-end pt-1 border-t border-border/30">
        <span className="text-xs text-muted-foreground">by {displayName}</span>
      </div>
    </div>
  );
}

export function PositionCommentSection({ positionId, onClose }: PositionCommentSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { data: comments, isLoading } = usePositionComments(positionId);
  const addComment = useAddPositionComment();
  const updateComment = useUpdatePositionComment();
  const deleteComment = useDeletePositionComment();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  });

  // Scroll to bottom when comments load or new comment added
  useEffect(() => {
    if (scrollRef.current && comments && comments.length > 0) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    await addComment.mutateAsync({
      positionId,
      content: newComment.trim(),
    });
    
    setNewComment("");
  };

  const handleUpdateComment = async (id: string) => {
    if (!editContent.trim()) return;
    
    await updateComment.mutateAsync({
      id,
      content: editContent.trim(),
      positionId,
    });
    
    setEditingId(null);
    setEditContent("");
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await deleteComment.mutateAsync({ id, positionId });
  };

  const handleCopyComment = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LogoLoader size="md" />
      </div>
    );
  }

  // Reverse comments so oldest first, newest last (chat style)
  const sortedComments = comments ? [...comments].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) : [];

  return (
    <div className="flex h-full min-h-0 flex-col pt-4">
      <div className="flex-1 min-h-0 pb-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {/* Enhanced Empty State */}
          {sortedComments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your thoughts</p>
            </div>
          )}

          {/* Individual Comments - oldest first, newest at bottom */}
          {sortedComments.map((comment) => {
            const isOwner = currentUserId === comment.user_id;
            const displayName = comment.profiles
              ? `${comment.profiles.first_name || ""} ${comment.profiles.last_name || ""}`.trim() || "Unknown User"
              : "Unknown User";
            
            const isActivityLog = comment.comment_type === 'activity_fte' || comment.comment_type === 'activity_shift';
            const isFteActivity = comment.comment_type === 'activity_fte';
            const isShiftActivity = comment.comment_type === 'activity_shift';
            const activityLabel = isFteActivity ? 'FTE Change' : isShiftActivity ? 'Shift Change' : null;
            
            // Parse metadata for activity logs
            const metadata = (comment.metadata || {}) as Record<string, unknown>;

            return (
              <div key={comment.id} className={`space-y-1 ${isActivityLog ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                {/* Label above bubble: type label for activity logs, user name for regular comments */}
                <div className={`text-xs font-medium text-muted-foreground ${isActivityLog ? 'text-right pr-1' : 'pl-1'}`}>
                  {isActivityLog ? activityLabel : displayName}
                </div>

                {/* Message with actions */}
                <div className={`group flex items-start gap-2 ${isActivityLog ? 'flex-row-reverse' : ''}`}>
                  {editingId === comment.id ? (
                    <div className="flex-1 space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={updateComment.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* Message row with copy button only for activity logs */}
                      <div className={`flex items-start gap-2 ${isActivityLog ? 'flex-row-reverse' : ''}`}>
                        {/* Message Bubble */}
                        <div className="max-w-[85%]">
                          <div className={`px-4 py-3 rounded-2xl ${
                            isActivityLog 
                              ? 'rounded-br-sm bg-primary/10 border border-primary/20' 
                              : 'rounded-bl-sm bg-muted'
                          }`}>
                            {/* Structured content for activity logs */}
                            {isFteActivity && (
                              <FteActivityCard metadata={metadata} displayName={displayName} />
                            )}
                            {isShiftActivity && (
                              <ShiftActivityCard metadata={metadata} displayName={displayName} />
                            )}
                            {/* Regular comment content */}
                            {!isActivityLog && (
                              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Copy button only for activity logs - on hover */}
                        {isActivityLog && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 hover:bg-accent"
                              onClick={() => handleCopyComment(comment.id, JSON.stringify(metadata, null, 2))}
                            >
                              {copiedId === comment.id ? (
                                <Check className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Below bubble: Timestamp + Edit/Delete (only for regular comments owned by user) */}
                      <div className={`flex items-center gap-2 ${isActivityLog ? 'justify-end pr-1' : 'pl-1'}`}>
                        <span className="text-xs text-muted-foreground">
                          {formatCommentTimestamp(comment.created_at)}
                        </span>
                        
                        {/* Activity logs are read-only, no edit/delete */}
                        {isOwner && !isActivityLog && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-accent"
                              onClick={() => startEditing(comment.id, comment.content)}
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-destructive/10"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PillChatBar-style Composer with Close button */}
      <div className="py-4 border-t bg-background shrink-0 -mx-6 px-6">
        <div className="flex items-center gap-2">
          {/* Minimize button like AI Hub */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-accent flex-shrink-0"
              onClick={onClose}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
            <div className="flex items-end gap-2 px-2 py-1">
              <TextareaAutosize
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                minRows={1}
                maxRows={4}
                className="flex-1 bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm focus:ring-0 px-2 py-0.5"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-accent flex-shrink-0"
                onClick={handleAddComment}
                disabled={!newComment.trim() || addComment.isPending}
              >
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
