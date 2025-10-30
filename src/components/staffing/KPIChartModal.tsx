import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPIChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  isNegative?: boolean;
  isHighlighted?: boolean;
  chartData?: Array<{ value: number }>;
  chartType?: "line" | "bar" | "area";
  breakdownData?: Array<any>;
  decimalPlaces?: number;
  xAxisLabels?: string[];
  currentIndex?: number;
  totalKPIs?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function KPIChartModal({
  open,
  onOpenChange,
  title,
  value,
  trend,
  trendValue,
  isNegative = false,
  isHighlighted = false,
  chartData,
  chartType = "line",
  breakdownData,
  decimalPlaces = 1,
  xAxisLabels,
  currentIndex = 0,
  totalKPIs = 1,
  onNavigate,
}: KPIChartModalProps) {
  const [activeTab, setActiveTab] = useState("chart");

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

  const getChartColor = () => {
    if (isNegative) return "hsl(var(--destructive))";
    if (isHighlighted) return "hsl(142 76% 36%)";
    return "hsl(var(--primary))";
  };

  const getTrendColor = () => {
    if (isNegative) return "text-destructive";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  // Calculate statistics if data exists
  const stats = chartData ? {
    high: Math.max(...chartData.map(d => d.value)).toFixed(decimalPlaces),
    low: Math.min(...chartData.map(d => d.value)).toFixed(decimalPlaces),
    average: (chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(decimalPlaces),
  } : null;

  // Add time labels to chart data - use last 12 data points when xAxisLabels provided
  const enrichedData = useMemo(() => {
    if (!chartData) return undefined;
    
    // If xAxisLabels provided, take only the last 12 data points
    const dataToUse = xAxisLabels && xAxisLabels.length === 12 
      ? chartData.slice(-12) 
      : chartData;
    
    return dataToUse.map((item, index) => {
      if (xAxisLabels && xAxisLabels.length === 12 && chartData.length >= 12) {
        // Use the month labels for the last 12 points
        return {
          ...item,
          period: xAxisLabels[index],
        };
      }
      
      // Default to period labels
      return {
        ...item,
        period: `P${index + 1}`,
      };
    });
  }, [chartData, xAxisLabels]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden pb-4 flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div className="flex items-center justify-between gap-4 w-full">
            {onNavigate && totalKPIs > 1 ? (
              <>
                <TooltipProvider>
                  <UITooltip>
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
                  </UITooltip>
                </TooltipProvider>
                
                <DialogTitle className="text-2xl text-center flex-1">{title}</DialogTitle>
                
                <TooltipProvider>
                  <UITooltip>
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
                  </UITooltip>
                </TooltipProvider>
              </>
            ) : (
              <DialogTitle className="text-2xl">{title}</DialogTitle>
            )}
          </div>
          
          {/* Current Value and Trend */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Current Value</p>
              <p className={cn(
                "text-4xl font-bold",
                isNegative ? "text-destructive" : "text-foreground"
              )}>
                {value}
              </p>
            </div>
            {trend && trendValue && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-semibold", getTrendColor())}>
                    {trend === "up" ? "↑" : "↓"} {trendValue}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogDescription className="sr-only">
            Chart and data breakdown for {title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2 overflow-hidden flex flex-col">

          {/* Tabs for Chart and Table */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>

            {/* Chart Tab */}
            <TabsContent value="chart" className="space-y-4 overflow-hidden flex flex-col">
              {enrichedData && enrichedData.length > 0 && (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value: number) => value.toFixed(decimalPlaces)}
                    />
                    <Tooltip 
                      formatter={(value: number) => value.toFixed(decimalPlaces)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor()}
                      strokeWidth={3}
                      fill="url(#chartGradient)"
                      name={title}
                    />
                  </AreaChart>
                ) : chartType === "line" ? (
                  <LineChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value: number) => value.toFixed(decimalPlaces)}
                    />
                    <Tooltip 
                      formatter={(value: number) => value.toFixed(decimalPlaces)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor()}
                      strokeWidth={3}
                      dot={{ fill: getChartColor(), r: 4 }}
                      activeDot={{ r: 6 }}
                      name={title}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value: number) => value.toFixed(decimalPlaces)}
                    />
                    <Tooltip 
                      formatter={(value: number) => value.toFixed(decimalPlaces)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill={getChartColor()}
                      radius={[4, 4, 0, 0]}
                      name={title}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

              {/* Statistics */}
              {stats && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">High</p>
                      <p className="text-xl font-semibold text-foreground">{stats.high}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Average</p>
                      <p className="text-xl font-semibold text-foreground">{stats.average}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Low</p>
                      <p className="text-xl font-semibold text-foreground">{stats.low}</p>
                    </div>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
            </TabsContent>

            {/* Table Tab */}
            <TabsContent value="table" className="space-y-4 overflow-hidden flex flex-col">
              {breakdownData && breakdownData.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <div className="max-h-[300px] overflow-auto">
                    {/* Header */}
                    <div 
                      className="grid sticky top-0 z-10 bg-blue-50 dark:bg-blue-950/30 border-b"
                      style={{ gridTemplateColumns: '2fr repeat(4, 1fr)' }}
                    >
                      <div className="px-4 py-3 text-left font-semibold text-sm">Skill Types</div>
                      <div className="px-4 py-3 text-right font-semibold text-sm">FT FTEs</div>
                      <div className="px-4 py-3 text-right font-semibold text-sm">PT FTEs</div>
                      <div className="px-4 py-3 text-right font-semibold text-sm">PRN FTEs</div>
                      <div className="px-4 py-3 text-right font-semibold text-sm">Total Actual Paid FTEs</div>
                    </div>
                    
                    {/* Body */}
                    {breakdownData.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "grid border-b hover:bg-muted/50 transition-colors",
                          item.skillType === 'TOTAL' && "border-t-2 font-bold bg-muted/30"
                        )}
                        style={{ gridTemplateColumns: '2fr repeat(4, 1fr)' }}
                      >
                        <div className={cn("px-4 py-3 text-left text-sm", item.skillType === 'TOTAL' && "font-bold")}>
                          {item.skillType}
                        </div>
                        <div className={cn("px-4 py-3 text-right text-sm", item.skillType === 'TOTAL' && "font-bold")}>
                          {item.ftFtes.toFixed(1)}
                        </div>
                        <div className={cn("px-4 py-3 text-right text-sm", item.skillType === 'TOTAL' && "font-bold")}>
                          {item.ptFtes.toFixed(1)}
                        </div>
                        <div className={cn("px-4 py-3 text-right text-sm", item.skillType === 'TOTAL' && "font-bold")}>
                          {item.prnFtes.toFixed(1)}
                        </div>
                        <div className={cn("px-4 py-3 text-right text-sm", item.skillType === 'TOTAL' && "font-bold")}>
                          {item.totalActualPaidFtes.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : enrichedData && enrichedData.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <div className="max-h-[300px] overflow-auto">
                    {/* Header */}
                    <div 
                      className="grid sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b"
                      style={{ gridTemplateColumns: '1fr 1fr' }}
                    >
                      <div className="px-4 py-3 text-left font-semibold text-sm">Period</div>
                      <div className="px-4 py-3 text-right font-semibold text-sm">{title}</div>
                    </div>
                    
                    {/* Body */}
                    {enrichedData.map((item, index) => (
                      <div
                        key={index}
                        className="grid border-b hover:bg-muted/50 transition-colors"
                        style={{ gridTemplateColumns: '1fr 1fr' }}
                      >
                        <div className="px-4 py-3 text-left text-sm font-medium">{item.period}</div>
                        <div className="px-4 py-3 text-right text-sm">{item.value.toFixed(decimalPlaces)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Statistics */}
              {stats && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">High</p>
                      <p className="text-xl font-semibold text-foreground">{stats.high}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Average</p>
                      <p className="text-xl font-semibold text-foreground">{stats.average}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Low</p>
                      <p className="text-xl font-semibold text-foreground">{stats.low}</p>
                    </div>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}