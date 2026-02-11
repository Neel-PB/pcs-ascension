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
  Tooltip,
  Scatter,
  ComposedChart
} from "recharts";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle,
  Check
} from "@/lib/icons";
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
  // New props for 3-month low logic
  threeMonthLowAvg?: number | null;
  nMonthAvg?: number | null;
  spreadPercentage?: number | null;
  usedThreeMonthLow?: boolean;
  lowestThreeMonths?: string[];
  spreadThreshold?: number;
}

export function TargetVolumePopover({
  historicalMonthsCount,
  historicalMonthsData,
  targetVolume,
  minMonthsForTarget,
  threeMonthLowAvg,
  nMonthAvg,
  spreadPercentage,
  usedThreeMonthLow = false,
  lowestThreeMonths = [],
  spreadThreshold = 15,
}: TargetVolumePopoverProps) {
  const hasEnoughData = historicalMonthsCount >= minMonthsForTarget;

  // Prepare chart data - format months as "Jan", "Feb", etc., oldest to newest
  const chartData = [...historicalMonthsData]
    .reverse()
    .map((d) => ({
      month: format(parseISO(d.month + "-01"), "MMM"),
      fullMonth: d.month,
      volume: Math.round(d.volume),
      isLowest: lowestThreeMonths.includes(d.month),
    }));

  // Get icon based on historical months
  const getIcon = () => {
    if (historicalMonthsCount === 0) return AlertCircle;
    if (historicalMonthsCount < 3) return TrendingDown;
    if (historicalMonthsCount < 12) return TrendingUp;
    return CheckCircle;
  };

  const BadgeIcon = getIcon();

  // Format number for display
  const formatVolume = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-between gap-2 px-4 py-2 w-full cursor-pointer">
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
              ? targetVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })
              : "—"
            }
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-3" align="start">
        {hasEnoughData && chartData.length > 0 ? (
          <>
            {/* Line Chart with highlighted lowest 3 months */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }} 
                    interval={0}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    width={38}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => {
                      if (value >= 1000) {
                        return `${(value / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
                      }
                      return value.toLocaleString();
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const isLowest = props.payload?.isLowest;
                      return [
                        <span key="value">
                          {value.toLocaleString()}
                          {isLowest && <span className="ml-1 text-orange-500">(Low 3)</span>}
                        </span>,
                        'Volume'
                      ];
                    }}
                  />
                  {/* N-month average reference line */}
                  {nMonthAvg && (
                    <ReferenceLine 
                      y={nMonthAvg} 
                      stroke="hsl(var(--primary))" 
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                    />
                  )}
                  {/* 3-month low average reference line */}
                  {threeMonthLowAvg && (
                    <ReferenceLine 
                      y={threeMonthLowAvg} 
                      stroke="hsl(25 95% 53%)" 
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="hsl(142 71% 45%)"
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isLowest = payload?.isLowest;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isLowest ? 5 : 3}
                          fill={isLowest ? 'hsl(25 95% 53%)' : 'hsl(142 71% 45%)'}
                          stroke={isLowest ? 'hsl(25 95% 40%)' : 'none'}
                          strokeWidth={isLowest ? 2 : 0}
                        />
                      );
                    }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(142 71% 45%)' }} />
                <span>Monthly Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(25 95% 53%)', border: '2px solid hsl(25 95% 40%)' }} />
                <span>Lowest 3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full border-dashed border-t-2" style={{ borderColor: 'hsl(var(--primary))' }} />
                <span>{historicalMonthsCount}-Mo Avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full border-dashed border-t-2" style={{ borderColor: 'hsl(25 95% 53%)' }} />
                <span>3-Mo Low</span>
              </div>
            </div>
            
            {/* Separator */}
            <Separator className="my-3" />
            
            {/* Calculation Details */}
            <div className="space-y-2">
              {/* Both calculation methods */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={cn(
                  "p-2 rounded-md border",
                  !usedThreeMonthLow ? "bg-primary/10 border-primary" : "bg-muted/50 border-border"
                )}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium">{historicalMonthsCount}-Mo Avg</span>
                    {!usedThreeMonthLow && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="text-sm font-semibold">{formatVolume(nMonthAvg)}</span>
                </div>
                <div className={cn(
                  "p-2 rounded-md border",
                  usedThreeMonthLow ? "bg-orange-500/10 border-orange-500" : "bg-muted/50 border-border"
                )}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium">3-Mo Low Avg</span>
                    {usedThreeMonthLow && <Check className="h-3 w-3 text-orange-500" />}
                  </div>
                  <span className="text-sm font-semibold">{formatVolume(threeMonthLowAvg)}</span>
                </div>
              </div>
              
              {/* Spread indicator */}
              {spreadPercentage !== null && spreadPercentage !== undefined && (
                <div className={cn(
                  "flex items-center justify-between p-2 rounded-md text-xs",
                  spreadPercentage <= spreadThreshold ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <span className="text-muted-foreground">Spread</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold",
                      spreadPercentage <= spreadThreshold ? "text-green-600" : "text-yellow-600"
                    )}>
                      {spreadPercentage.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">
                      (threshold: {spreadThreshold}%)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Reasoning text */}
              <p className="text-xs text-muted-foreground pt-1">
                {usedThreeMonthLow 
                  ? `Using 3-month low average (spread ${spreadPercentage?.toFixed(1)}% ≤ ${spreadThreshold}% threshold)`
                  : spreadPercentage !== null && spreadPercentage !== undefined
                    ? `Using ${historicalMonthsCount}-month average (spread ${spreadPercentage.toFixed(1)}% > ${spreadThreshold}% threshold)`
                    : `${historicalMonthsCount} months of historical data available`
                }
              </p>
            </div>
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
