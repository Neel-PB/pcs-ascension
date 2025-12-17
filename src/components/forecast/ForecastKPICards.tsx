import { Card } from "@/components/ui/card";

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
          <span className="text-lg font-semibold uppercase tracking-wide text-destructive">
            FTE Shortage
          </span>
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
          <span className="text-lg font-semibold uppercase tracking-wide text-primary">
            FTE Surplus
          </span>
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
