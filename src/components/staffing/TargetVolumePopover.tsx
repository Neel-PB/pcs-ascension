import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
import { format, parseISO, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle,
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
  threeMonthLowAvg?: number | null;
  nMonthAvg?: number | null;
  lowestThreeMonths?: string[];
}

function parseMonthString(raw: string): Date | null {
  // Try various formats: "202301", "2023-01", "2023-01-01", "Jan 2023", etc.
  const cleaned = raw.trim();
  
  // "202301" → "2023-01"
  if (/^\d{6}$/.test(cleaned)) {
    const d = parseISO(`${cleaned.slice(0, 4)}-${cleaned.slice(4)}-01`);
    return isValid(d) ? d : null;
  }
  // "2023-01" or "2023-01-01"
  if (/^\d{4}-\d{2}/.test(cleaned)) {
    const normalized = cleaned.length <= 7 ? cleaned + '-01' : cleaned;
    const d = parseISO(normalized);
    return isValid(d) ? d : null;
  }
  // Fallback
  const d = new Date(cleaned);
  return isValid(d) ? d : null;
}

export function TargetVolumePopover({
  historicalMonthsCount,
  historicalMonthsData,
  targetVolume,
  minMonthsForTarget,
  threeMonthLowAvg,
  nMonthAvg,
  lowestThreeMonths = [],
}: TargetVolumePopoverProps) {
  const hasEnoughData = historicalMonthsCount >= minMonthsForTarget;

  // Prepare chart data - format months as "Jan'24", "Feb'25", etc., oldest to newest
  const chartData = [...historicalMonthsData]
    .reverse()
    .map((d) => {
      const parsed = parseMonthString(d.month);
      return {
        month: parsed ? format(parsed, "MMM''yy") : d.month,
        fullMonth: d.month,
        volume: Math.round(d.volume),
        isLowest: lowestThreeMonths.includes(d.month),
      };
    });

  // Get icon based on historical months
  const getIcon = () => {
    if (historicalMonthsCount === 0) return AlertCircle;
    if (historicalMonthsCount < 3) return TrendingDown;
    if (historicalMonthsCount < 12) return TrendingUp;
    return CheckCircle;
  };

  const BadgeIcon = getIcon();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between gap-2 px-4 py-2 w-full cursor-pointer">
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
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Historical Volume Trend</DialogTitle>
        </DialogHeader>
        {hasEnoughData && chartData.length > 0 ? (
          <>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11 }} 
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    width={45}
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
                  {nMonthAvg && (
                    <ReferenceLine 
                      y={nMonthAvg} 
                      stroke="hsl(var(--primary))" 
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                    />
                  )}
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
            
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Insufficient historical data ({historicalMonthsCount} month{historicalMonthsCount !== 1 ? 's' : ''}). 
            Minimum of {minMonthsForTarget} months required to calculate target volume.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
