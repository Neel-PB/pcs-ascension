import { useState, useEffect } from "react";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { 
  Bug, 
  Lightbulb, 
  Wrench, 
  HelpCircle, 
  Camera,
  Trash2,
  
  MessageSquare
} from "@/lib/icons";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { useFeedback } from "@/hooks/useFeedback";
import { useFeedbackComments } from "@/hooks/useFeedbackComments";
import { FeedbackCommentsDialog } from "./FeedbackCommentsDialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useRBAC } from "@/hooks/useRBAC";

interface Feedback {
  id: string;
  user_id: string;
  title: string;
  type: string;
  priority: string;
  description: string;
  screenshot_url: string | null;
  page_url: string | null;
  browser_info: Record<string, unknown> | null;
  pcs_status: string;
  pb_status: string;
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
  isFirstRow?: boolean;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  bug: { icon: Bug, label: "Bug", color: "bg-destructive/10 text-destructive" },
  feature: { icon: Lightbulb, label: "Feature", color: "bg-amber-500/10 text-amber-600" },
  improvement: { icon: Wrench, label: "Improve", color: "bg-blue-500/10 text-blue-600" },
  question: { icon: HelpCircle, label: "Question", color: "bg-purple-500/10 text-purple-600" },
};

const pcsStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-blue-500/10 text-blue-600" },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600" },
  disregard: { label: "Disregard", color: "bg-muted text-muted-foreground" },
  backlog: { label: "Backlog", color: "bg-amber-500/10 text-amber-600" },
};

const pbStatusConfig: Record<string, { label: string; color: string }> = {
  in_progress: { label: "In Progress", color: "bg-amber-500/10 text-amber-600" },
  resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-600" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-muted-foreground" },
  medium: { label: "Medium", color: "text-amber-600" },
  high: { label: "High", color: "text-destructive" },
};

export function FeedbackTableRow({ feedback, onDelete, isFirstRow }: FeedbackTableRowProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(feedback.screenshot_url);
  const [imageError, setImageError] = useState(false);
  const { comments } = useFeedbackComments(feedback.id);
  const { updatePcsStatus, updatePbStatus, updateFeedbackType, updateFeedbackPriority } = useFeedback();
  const { hasPermission } = useRBAC();
  const canManageFeedback = hasPermission('approvals.feedback');
  
  // Business rule: PB Status is locked to 'closed' when PCS Status is 'disregard' or 'backlog'
  const isPbStatusLocked = feedback.pcs_status === 'disregard' || feedback.pcs_status === 'backlog';
  const effectivePbStatus = isPbStatusLocked ? 'closed' : feedback.pb_status;

  const typeInfo = typeConfig[feedback.type] || typeConfig.question;
  const TypeIcon = typeInfo.icon;
  const priorityInfo = priorityConfig[feedback.priority] || priorityConfig.medium;

  const handleTypeChange = (newType: string) => {
    updateFeedbackType.mutate({
      id: feedback.id,
      type: newType as "bug" | "feature" | "improvement" | "question",
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    updateFeedbackPriority.mutate({
      id: feedback.id,
      priority: newPriority as "low" | "medium" | "high" | "critical",
    });
  };

  const authorName = feedback.author
    ? `${feedback.author.first_name || ""} ${feedback.author.last_name || ""}`.trim() || "Unknown"
    : "Unknown";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hoursAgo = differenceInHours(new Date(), date);
    if (hoursAgo < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d, yyyy");
  };

  const handlePcsStatusChange = (newStatus: string) => {
    updatePcsStatus.mutate({
      id: feedback.id,
      pcs_status: newStatus as "pending" | "approved" | "disregard" | "backlog",
    });
  };

  const handlePbStatusChange = (newStatus: string) => {
    if (isPbStatusLocked) return;
    updatePbStatus.mutate({
      id: feedback.id,
      pb_status: newStatus as "in_progress" | "resolved" | "closed",
    });
  };

  // Handle image load error - try signed URL as fallback
  const handleImageError = async () => {
    if (!feedback.screenshot_url || imageError) return;
    
    try {
      // Extract path from the URL (after /feedback-screenshots/)
      const match = feedback.screenshot_url.match(/feedback-screenshots\/(.+)$/);
      if (!match) {
        setImageError(true);
        return;
      }
      
      const objectPath = match[1];
      const { data, error } = await supabase.storage
        .from('feedback-screenshots')
        .createSignedUrl(objectPath, 60 * 10); // 10 minutes
      
      if (error || !data?.signedUrl) {
        setImageError(true);
        return;
      }
      
      setResolvedImageUrl(data.signedUrl);
    } catch {
      setImageError(true);
    }
  };

  // Reset state when screenshot_url changes
  useEffect(() => {
    setResolvedImageUrl(feedback.screenshot_url);
    setImageError(false);
  }, [feedback.screenshot_url]);

  return (
    <TableRow className="align-top border-b">
      {/* Title */}
      <TableCell className="py-3 min-w-[180px]">
        <p className="text-sm font-medium line-clamp-1" title={feedback.title}>
          {feedback.title}
        </p>
      </TableCell>

      {/* Description */}
      <TableCell className="py-3 min-w-[220px]">
        <p className="text-xs text-muted-foreground line-clamp-2">{feedback.description}</p>
      </TableCell>

      {/* Author */}
      <TableCell className="py-3 w-[110px]">
        <span className="text-sm font-medium truncate block max-w-[100px]">{authorName}</span>
      </TableCell>

      {/* Type */}
      <TableCell className="py-3 w-[100px]">
        <Select value={feedback.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-7 w-[95px] text-xs border-none bg-transparent hover:bg-muted/50 px-1 [&>span]:flex [&>span]:items-center">
            <SelectValue>
              <Badge variant="secondary" className={cn("text-xs", typeInfo.color)}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
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
      </TableCell>

      {/* ACS Status (formerly PCS Status) */}
      <TableCell className="py-3 w-[120px]" data-tour={isFirstRow ? "feedback-pcs-status" : undefined}>
        <Select 
          value={feedback.pcs_status} 
          onValueChange={handlePcsStatusChange}
          disabled={!canManageFeedback}
        >
          <SelectTrigger className={cn(
            "h-7 w-[105px] text-xs border-none bg-transparent hover:bg-muted/50 px-1",
            !canManageFeedback && "opacity-60 cursor-not-allowed"
          )}>
            <SelectValue>
              <Badge variant="secondary" className={cn("text-xs", pcsStatusConfig[feedback.pcs_status]?.color)}>
                {pcsStatusConfig[feedback.pcs_status]?.label}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {Object.entries(pcsStatusConfig).map(([value, config]) => (
              <SelectItem key={value} value={value} className="text-xs">
                <Badge variant="secondary" className={cn("text-xs", config.color)}>
                  {config.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* PB Status */}
      <TableCell className="py-3 w-[110px]">
        <Select 
          value={effectivePbStatus} 
          onValueChange={handlePbStatusChange}
          disabled={isPbStatusLocked || !canManageFeedback}
        >
          <SelectTrigger className={cn(
            "h-7 w-[100px] text-xs border-none bg-transparent hover:bg-muted/50 px-1",
            (isPbStatusLocked || !canManageFeedback) && "opacity-60 cursor-not-allowed"
          )}>
            <SelectValue>
              <Badge variant="secondary" className={cn("text-xs", pbStatusConfig[effectivePbStatus]?.color)}>
                {pbStatusConfig[effectivePbStatus]?.label}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {Object.entries(pbStatusConfig).map(([value, config]) => (
              <SelectItem key={value} value={value} className="text-xs">
                <Badge variant="secondary" className={cn("text-xs", config.color)}>
                  {config.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Priority */}
      <TableCell className="py-3 w-[80px]">
        <Select value={feedback.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="h-7 w-[75px] text-xs border-none bg-transparent hover:bg-muted/50 px-1">
            <SelectValue>
              <span className={cn("text-xs font-medium", priorityInfo.color)}>
                {priorityInfo.label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {Object.entries(priorityConfig).map(([value, config]) => (
              <SelectItem key={value} value={value} className="text-xs">
                <span className={cn("text-xs font-medium", config.color)}>
                  {config.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Date */}
      <TableCell className="py-3 w-[100px]">
        <span className="text-xs text-muted-foreground">{formatDate(feedback.created_at)}</span>
      </TableCell>

      {/* Actions: Screenshot + Comments + Delete */}
      <TableCell className="py-3 w-[130px]" data-tour={isFirstRow ? "feedback-comments" : undefined}>
        <div className="flex items-center gap-1">
          {/* Screenshot */}
          {feedback.screenshot_url && !imageError ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-2 border-border/20">
                <img
                  src={resolvedImageUrl || feedback.screenshot_url}
                  alt="Screenshot"
                  className="w-full h-auto rounded"
                  onError={handleImageError}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-30 cursor-default" disabled>
              <Camera className="h-4 w-4" />
            </Button>
          )}

          {/* Comments */}
          <FeedbackCommentsDialog 
            feedbackId={feedback.id} 
            commentCount={comments?.length || 0} 
          />

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
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
                  onClick={() => onDelete(feedback.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
