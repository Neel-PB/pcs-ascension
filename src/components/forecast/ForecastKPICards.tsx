import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ForecastKPICardsProps {
  totalShortage: number;
  totalSurplus: number;
  shortageCount: number;
  surplusCount: number;
  isLoading?: boolean;
}

export function ForecastKPICards({
  totalShortage,
  totalSurplus,
  shortageCount,
  surplusCount,
  isLoading,
}: ForecastKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-8 animate-pulse bg-muted/30">
          <div className="h-32" />
        </Card>
        <Card className="p-8 animate-pulse bg-muted/30">
          <div className="h-32" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* FTE Shortage Card */}
      <Card className="p-8 border-destructive/30 bg-destructive/5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <TrendingUp className="h-6 w-6" />
            <span className="text-lg font-semibold uppercase tracking-wide">
              FTE Shortage
            </span>
          </div>
          <div className="text-5xl font-bold text-destructive">
            +{totalShortage.toFixed(1)}
          </div>
          <p className="text-muted-foreground">
            {shortageCount} position{shortageCount !== 1 ? 's' : ''} to open
          </p>
        </div>
      </Card>

      {/* FTE Surplus Card */}
      <Card className="p-8 border-primary/30 bg-primary/5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <TrendingDown className="h-6 w-6" />
            <span className="text-lg font-semibold uppercase tracking-wide">
              FTE Surplus
            </span>
          </div>
          <div className="text-5xl font-bold text-primary">
            -{totalSurplus.toFixed(1)}
          </div>
          <p className="text-muted-foreground">
            {surplusCount} position{surplusCount !== 1 ? 's' : ''} to close
          </p>
        </div>
      </Card>
    </div>
  );
}
