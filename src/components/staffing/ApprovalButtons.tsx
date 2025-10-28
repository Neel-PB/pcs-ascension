import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full transition-all",
                isApproved 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : isPending 
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600/30 hover:bg-green-600 text-white",
                (isLoading || disabled) && "opacity-50 cursor-not-allowed"
              )}
              onClick={onApprove}
              disabled={isLoading || disabled}
              aria-label={isApproved ? "Undo approval" : "Approve"}
            >
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isApproved ? "Click to undo approval" : isRejected ? "Click to approve" : "Approve"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full transition-all",
                isRejected 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : isPending 
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-600/30 hover:bg-red-600 text-white",
                (isLoading || disabled) && "opacity-50 cursor-not-allowed"
              )}
              onClick={onReject}
              disabled={isLoading || disabled}
              aria-label={isRejected ? "Undo rejection" : "Reject"}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRejected ? "Click to undo rejection" : isApproved ? "Click to reject" : "Reject"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span className="text-xs text-muted-foreground capitalize">{status}</span>
    </div>
  );
}
