import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface KPIInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  definition: string;
  calculation: string;
  isNegative?: boolean;
}

export function KPIInfoModal({
  open,
  onOpenChange,
  title,
  value,
  trend,
  trendValue,
  definition,
  calculation,
  isNegative = false,
}: KPIInfoModalProps) {
  const getTrendColor = () => {
    if (isNegative) return "text-destructive";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <div className="text-right">
              <span className="text-sm text-muted-foreground block">Current Value</span>
              <span
                className={cn(
                  "text-3xl font-bold",
                  isNegative ? "text-destructive" : "text-foreground"
                )}
              >
                {value}
              </span>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Definition and calculation details for {title}
          </DialogDescription>
        </DialogHeader>

        {/* Trend */}
        {trend && trendValue && (
          <div className="flex items-center gap-2 -mt-2">
            <span className="text-sm text-muted-foreground">Trend:</span>
            <span className={cn("text-sm font-semibold", getTrendColor())}>
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </span>
          </div>
        )}

        <Separator />

        {/* Definition Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">Definition</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {definition}
          </p>
        </div>

        <Separator />

        {/* Calculation Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">Calculation</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-mono text-foreground whitespace-pre-wrap">
              {calculation}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
