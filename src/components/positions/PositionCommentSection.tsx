import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Pencil, Trash2, ArrowUp, MessageSquare, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TextareaAutosize from "react-textarea-autosize";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  usePositionComments,
  useAddPositionComment,
  useUpdatePositionComment,
  useDeletePositionComment,
} from "@/hooks/usePositionComments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PositionCommentSectionProps {
  positionId: string;
  onClose?: () => void;
}

export function PositionCommentSection({ positionId, onClose }: PositionCommentSectionProps) {
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col py-6">
      <ScrollArea className="flex-1 min-h-0 pr-4">
        <div className="space-y-6">
          {/* Enhanced Empty State */}
          {comments && comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your thoughts</p>
            </div>
          )}

          {/* Individual Comments - AI Hub Style */}
          {comments?.map((comment) => {
            const isOwner = currentUserId === comment.user_id;
            const displayName = comment.profiles
              ? `${comment.profiles.first_name || ""} ${comment.profiles.last_name || ""}`.trim() || "Unknown User"
              : "Unknown User";

            return (
              <div key={comment.id} className="space-y-1">
                {/* Author label */}
                <div className="text-xs font-medium text-muted-foreground">
                  {displayName}
                </div>

                {/* Message with actions */}
                <div className="group flex items-start gap-2">
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
                      {/* Message row with copy button only */}
                      <div className="flex items-start gap-2">
                        {/* Message Bubble */}
                        <div className="max-w-[85%]">
                          <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>

                        {/* Copy button only - on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-accent"
                            onClick={() => handleCopyComment(comment.id, comment.content)}
                          >
                            {copiedId === comment.id ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Below bubble: Timestamp + Edit/Delete */}
                      <div className="flex items-center gap-2 pl-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        
                        {isOwner && (
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
      </ScrollArea>

      {/* PillChatBar-style Composer with Close button */}
      <div className="py-4 border-t">
        <div className="flex items-center gap-2">
          {/* Minimize button like AI Hub */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-accent flex-shrink-0"
              onClick={onClose}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
            <div className="flex items-end gap-2 p-2">
              <TextareaAutosize
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                minRows={1}
                maxRows={4}
                className="flex-1 bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm focus:ring-0 px-2 py-1.5"
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
                className="h-8 w-8 rounded-lg hover:bg-accent flex-shrink-0"
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
