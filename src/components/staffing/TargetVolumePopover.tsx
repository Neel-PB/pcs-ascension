import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ReferenceLine, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle 
} from "lucide-react";
import { 
  getHistoricalDataBadgeColor, 
  getHistoricalDataLabel 
} from "@/lib/volumeOverrideRules";

interface HistoricalMonthData {
  month: string;
  volume: number;
  daysInMonth: number;
}

interface TargetVolumePopoverProps {
  historicalMonthsCount: number;
  historicalMonthsData: HistoricalMonthData[];
  targetVolume: number | null;
  minMonthsForTarget: number;
}

export function TargetVolumePopover({
  historicalMonthsCount,
  historicalMonthsData,
  targetVolume,
  minMonthsForTarget,
}: TargetVolumePopoverProps) {
  const hasEnoughData = historicalMonthsCount >= minMonthsForTarget;

  // Prepare chart data - format months as "Jan", "Feb", etc., oldest to newest
  const chartData = [...historicalMonthsData]
    .reverse()
    .map((d) => ({
      month: format(parseISO(d.month + "-01"), "MMM"),
      volume: Math.round(d.volume),
    }));

  // Get icon based on historical months
  const getIcon = () => {
    if (historicalMonthsCount === 0) return AlertCircle;
    if (historicalMonthsCount < 3) return TrendingDown;
    if (historicalMonthsCount < 12) return TrendingUp;
    return CheckCircle;
  };

  const BadgeIcon = getIcon();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-between gap-2 px-3 py-2 w-full cursor-pointer">
          {/* Left side - Badge */}
          <Badge 
            className={cn(
              "flex items-center gap-1 shrink-0 transition-opacity hover:opacity-80",
              getHistoricalDataBadgeColor(historicalMonthsCount)
            )}
            role="button"
          >
            <BadgeIcon className="h-3 w-3" />
            <span className="text-xs font-medium">
              {getHistoricalDataLabel(historicalMonthsCount)}
            </span>
          </Badge>

          {/* Right side - Value */}
          <div className={cn(
            "text-sm font-medium text-right",
            targetVolume ? "text-foreground" : "text-muted-foreground"
          )}>
            {targetVolume 
              ? targetVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : "—"
            }
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-4" align="start">
        {hasEnoughData && chartData.length > 0 ? (
          <>
            {/* Line Chart */}
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 9 }} 
                    interval={0}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    width={50}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                  />
                  {targetVolume && (
                    <ReferenceLine 
                      y={targetVolume} 
                      stroke="hsl(var(--primary))" 
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="hsl(142 71% 45%)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(142 71% 45%)' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(142 71% 45%)' }} />
                <span>Monthly Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full border-dashed border-t-2" style={{ borderColor: 'hsl(var(--primary))' }} />
                <span>Target (Daily Avg)</span>
              </div>
            </div>
            
            {/* Separator */}
            <Separator className="my-3" />
            
            {/* Reasoning text */}
            <p className="text-xs text-muted-foreground">
              {historicalMonthsCount} month{historicalMonthsCount !== 1 ? 's' : ''} historical volume available, 
              target calculated as daily average across all months
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Insufficient historical data ({historicalMonthsCount} month{historicalMonthsCount !== 1 ? 's' : ''}). 
            Minimum of {minMonthsForTarget} months required to calculate target volume.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
