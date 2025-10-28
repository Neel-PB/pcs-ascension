import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApprovalButtonsProps {
  status: 'pending' | 'approved' | 'rejected';
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ApprovalButtons({ 
  status, 
  onApprove, 
  onReject, 
  isLoading = false,
  disabled = false 
}: ApprovalButtonsProps) {
  
  if (status === 'approved') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
        <span className="text-xs text-muted-foreground">Approved</span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
          <X className="h-4 w-4 text-white" />
        </div>
        <span className="text-xs text-muted-foreground">Rejected</span>
      </div>
    );
  }

  // Pending status - show both buttons
  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 text-white",
          (isLoading || disabled) && "opacity-50 cursor-not-allowed"
        )}
        onClick={onApprove}
        disabled={isLoading || disabled}
        aria-label="Approve"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white",
          (isLoading || disabled) && "opacity-50 cursor-not-allowed"
        )}
        onClick={onReject}
        disabled={isLoading || disabled}
        aria-label="Reject"
      >
        <X className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">Pending</span>
    </div>
  );
}
