import { useState, useEffect } from "react";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { 
  Bug, 
  Lightbulb, 
  Wrench, 
  HelpCircle, 
  Camera,
  Trash2,
  ExternalLink,
  ImageOff
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  bug: { icon: Bug, label: "Bug", color: "bg-destructive/10 text-destructive" },
  feature: { icon: Lightbulb, label: "Feature", color: "bg-amber-500/10 text-amber-600" },
  improvement: { icon: Wrench, label: "Improve", color: "bg-blue-500/10 text-blue-600" },
  question: { icon: HelpCircle, label: "Question", color: "bg-purple-500/10 text-purple-600" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600" },
  in_progress: { label: "In Progress", color: "bg-amber-500/10 text-amber-600" },
  resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-600" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-muted-foreground" },
  medium: { label: "Medium", color: "text-amber-600" },
  high: { label: "High", color: "text-destructive" },
};

export function FeedbackTableRow({ feedback, onDelete }: FeedbackTableRowProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(feedback.screenshot_url);
  const [imageError, setImageError] = useState(false);
  const { comments } = useFeedbackComments(feedback.id);
  const { updateFeedbackStatus } = useFeedback();

  const typeInfo = typeConfig[feedback.type] || typeConfig.question;
  const TypeIcon = typeInfo.icon;
  const priorityInfo = priorityConfig[feedback.priority] || priorityConfig.medium;

  const authorName = feedback.author
    ? `${feedback.author.first_name || ""} ${feedback.author.last_name || ""}`.trim() || "Unknown"
    : "Unknown";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hoursAgo = differenceInHours(new Date(), date);
    if (hoursAgo < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d, yyyy");
  };

  const handleStatusChange = (newStatus: string) => {
    updateFeedbackStatus.mutate({
      id: feedback.id,
      status: newStatus as "new" | "in_progress" | "resolved" | "closed",
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
      {/* Author */}
      <TableCell className="py-3 w-[140px]">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={feedback.author?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate max-w-[80px]">{authorName}</span>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell className="py-3 w-[100px]">
        <Badge variant="secondary" className={cn("text-xs", typeInfo.color)}>
          <TypeIcon className="h-3 w-3 mr-1" />
          {typeInfo.label}
        </Badge>
      </TableCell>

      {/* Title & Description */}
      <TableCell className="py-3 min-w-[200px]">
        <div className="space-y-1">
          <p className="text-sm font-medium line-clamp-1">{feedback.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{feedback.description}</p>
          {feedback.page_url && (
            <a
              href={feedback.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View page
            </a>
          )}
        </div>
      </TableCell>

      {/* Screenshot */}
      <TableCell className="py-3 w-[80px]">
        {feedback.screenshot_url && !imageError ? (
          <Dialog>
            <DialogTrigger asChild>
              <button className="group relative w-14 h-10 rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                <img
                  src={resolvedImageUrl || feedback.screenshot_url}
                  alt="Screenshot"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-2 border-border/20">
              <img
                src={resolvedImageUrl || feedback.screenshot_url}
                alt="Screenshot"
                className="w-full h-auto rounded"
              />
            </DialogContent>
          </Dialog>
        ) : feedback.screenshot_url && imageError ? (
          <div className="w-14 h-10 rounded border border-border bg-muted flex items-center justify-center">
            <ImageOff className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>

      {/* Status (inline dropdown) */}
      <TableCell className="py-3 w-[140px]">
        <Select value={feedback.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusConfig).map(([value, config]) => (
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
        <span className={cn("text-xs font-medium", priorityInfo.color)}>
          {priorityInfo.label}
        </span>
      </TableCell>

      {/* Date */}
      <TableCell className="py-3 w-[100px]">
        <span className="text-xs text-muted-foreground">{formatDate(feedback.created_at)}</span>
      </TableCell>

      {/* Comments */}
      <TableCell className="py-3 w-[100px]">
        <FeedbackCommentsDialog 
          feedbackId={feedback.id} 
          commentCount={comments?.length || 0} 
        />
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 w-[60px]">
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
      </TableCell>
    </TableRow>
  );
}
