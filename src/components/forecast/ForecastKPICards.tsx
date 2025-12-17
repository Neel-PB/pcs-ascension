import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
        <Card className="py-2 px-4 animate-pulse bg-muted/30">
          <div className="h-10" />
        </Card>
        <Card className="py-2 px-4 animate-pulse bg-muted/30">
          <div className="h-10" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* FTE Shortage + Positions to Open Card */}
      <Card className="py-2 px-4 border-destructive/30 bg-destructive/5">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
              FTE Shortage
            </span>
            <div className="text-2xl font-bold text-destructive">
              +{totalShortage.toFixed(1)}
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-destructive/30" />
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
              Positions to Open
            </span>
            <div className="text-2xl font-bold text-destructive">
              {shortageCount}
            </div>
          </div>
        </div>
      </Card>

      {/* FTE Surplus + Positions to Close Card */}
      <Card className="py-2 px-4 border-primary/30 bg-primary/5">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              FTE Surplus
            </span>
            <div className="text-2xl font-bold text-primary">
              -{totalSurplus.toFixed(1)}
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-primary/30" />
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Positions to Close
            </span>
            <div className="text-2xl font-bold text-primary">
              {surplusCount}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
