import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LogoLoader } from "@/components/ui/LogoLoader";

interface ForecastKPICardsProps {
  totalShortage: number;
  totalSurplus: number;
  shortageCount: number;
  surplusCount: number;
  isLoading?: boolean;
  activeFilter?: 'all' | 'shortage' | 'surplus';
  onFilterClick?: (filter: 'shortage' | 'surplus') => void;
}

export function ForecastKPICards({
  totalShortage,
  totalSurplus,
  shortageCount,
  surplusCount,
  isLoading,
  activeFilter = 'all',
  onFilterClick,
}: ForecastKPICardsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LogoLoader size="sm" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* FTE Shortage + Positions to Open Card */}
      <Card 
        className={cn(
          "py-2 px-4 border-destructive/30 bg-destructive/5 cursor-pointer transition-all",
          activeFilter === 'shortage' && "ring-2 ring-destructive ring-offset-2"
        )}
        onClick={() => onFilterClick?.('shortage')}
      >
        <div className="flex items-center justify-around">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
              FTE Shortage:
            </span>
            <div className="text-2xl font-bold text-destructive">
              +{totalShortage.toFixed(1)}
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-destructive/30" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
              Positions to Open:
            </span>
            <div className="text-2xl font-bold text-destructive">
              {shortageCount}
            </div>
          </div>
        </div>
      </Card>

      {/* FTE Surplus + Positions to Close Card */}
      <Card 
        className={cn(
          "py-2 px-4 border-primary/30 bg-primary/5 cursor-pointer transition-all",
          activeFilter === 'surplus' && "ring-2 ring-primary ring-offset-2"
        )}
        onClick={() => onFilterClick?.('surplus')}
      >
        <div className="flex items-center justify-around">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              FTE Surplus:
            </span>
            <div className="text-2xl font-bold text-primary">
              -{totalSurplus.toFixed(1)}
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-primary/30" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Positions to Close:
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
