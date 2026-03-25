import { RefreshCw } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface DataRefreshButtonProps {
  lastUpdated?: string | null;
  className?: string;
}

export function DataRefreshButton({ lastUpdated, className }: DataRefreshButtonProps) {
  const getStatusInfo = (dateStr: string) => {
    const hoursSince = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);

    if (hoursSince > 48) return { text: "Needs Update", dotColor: "bg-red-500" };
    if (hoursSince > 12) return { text: "Stale", dotColor: "bg-yellow-500" };
    return { text: "Current", dotColor: "bg-green-500" };
  };

  const statusInfo = lastUpdated ? getStatusInfo(lastUpdated) : null;
  const dotColor = statusInfo?.dotColor ?? "bg-muted";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ascension"
          size="icon"
          className={cn("relative", className)}
          aria-label="Data refresh status"
          title="Data refresh status"
        >
          <RefreshCw className="h-4 w-4" />
          <span className={cn(
            "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
            dotColor
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Data Last Updated</h4>
          {lastUpdated ? (
            <div className="flex items-start gap-2">
              <div className={cn("h-2 w-2 rounded-full mt-1.5 flex-shrink-0", statusInfo!.dotColor)} />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{statusInfo!.text}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(lastUpdated), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No refresh data available</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
