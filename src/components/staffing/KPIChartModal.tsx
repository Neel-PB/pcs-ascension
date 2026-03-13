import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}: KPIChartModalProps) {
  const [activeTab, setActiveTab] = useState("chart");
  const getChartColor = () => {
    if (isNegative) return "hsl(24 95% 53%)";
    if (isHighlighted) return "hsl(142 76% 36%)";
    return "hsl(var(--primary))";
  };

  const getTrendColor = () => {
    if (isNegative) return "text-orange-600";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-orange-500";
    return "text-muted-foreground";
  };

  const formatValue = (val: number) => val.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces });
  const formatAxisTick = (val: number) => val >= 1000 ? `${(val / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K` : val.toString();

  // Calculate statistics if data exists
  const stats = chartData ? {
    high: formatValue(Math.max(...chartData.map(d => d.value))),
    low: formatValue(Math.min(...chartData.map(d => d.value))),
    average: formatValue(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length),
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
          <div>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="sr-only">
              Chart and table data for {title}
            </DialogDescription>
          </div>
          
          {/* Current Value and Trend */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Current Value</p>
              <p className={cn(
                "text-4xl font-bold",
                isNegative ? "text-orange-600" : "text-foreground"
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
        </DialogHeader>
        
        <div className="space-y-4 pt-2 overflow-hidden flex flex-col">

          {/* Toggle for Chart and Table */}
          <ToggleButtonGroup
            items={[{ id: "chart", label: "Chart" }, { id: "table", label: "Table" }]}
            activeId={activeTab}
            onSelect={setActiveTab}
            layoutId="kpiChartTab"
            className="max-w-xs"
          />

          {activeTab === "chart" && (
            <div className="space-y-4">
              <div className="h-[340px]">
                {enrichedData && enrichedData.length > 0 && (
                  <div className="h-full w-full">
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
                            tickFormatter={formatAxisTick}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatValue(value), "Value"]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
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
                            tickFormatter={formatAxisTick}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatValue(value), "Value"]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={getChartColor()}
                            strokeWidth={3}
                            dot={{ fill: getChartColor(), r: 4 }}
                            activeDot={{ r: 6 }}
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
                            tickFormatter={formatAxisTick}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatValue(value), "Value"]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill={getChartColor()}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

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
            <TabsContent value="table" className="space-y-4">
              <div className="h-[340px]">
                {enrichedData && enrichedData.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden h-full">
                    <ScrollArea className="h-full">
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
                    </ScrollArea>
                  </div>
                ) : null}
              </div>

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
