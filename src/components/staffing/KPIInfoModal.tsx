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
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  currentIndex?: number;
  totalKPIs?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
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
  currentIndex = 0,
  totalKPIs = 1,
  onNavigate,
}: KPIInfoModalProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!open || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && currentIndex < totalKPIs - 1) {
        e.preventDefault();
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, totalKPIs, onNavigate]);
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
          <div className="flex items-center justify-between gap-4">
            {onNavigate && totalKPIs > 1 ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onNavigate('prev')}
                        disabled={currentIndex === 0}
                        className="shrink-0"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous KPI (←)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DialogTitle className="text-2xl text-center flex-1">{title}</DialogTitle>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onNavigate('next')}
                        disabled={currentIndex === totalKPIs - 1}
                        className="shrink-0"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next KPI (→)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <DialogTitle className="text-2xl">{title}</DialogTitle>
            )}
          </div>
          <DialogDescription className="sr-only">
            Definition and calculation details for {title}
          </DialogDescription>
        </DialogHeader>

        {/* Current Value and Trend */}
        <div className="space-y-2 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted-foreground">Current Value:</span>
            <span
              className={cn(
                "text-3xl font-bold",
                isNegative ? "text-destructive" : "text-foreground"
              )}
            >
              {value}
            </span>
          </div>
          {trend && trendValue && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Trend:</span>
              <span className={cn("text-sm font-semibold", getTrendColor())}>
                {trend === "up" ? "↑" : "↓"} {trendValue}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Definition Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">📋 Definition</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {definition}
          </p>
        </div>

        <Separator />

        {/* Calculation Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">🔢 Calculation</span>
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
