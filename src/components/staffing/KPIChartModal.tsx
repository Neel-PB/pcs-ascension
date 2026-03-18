import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
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
  chartType?: "line" | "bar" | "area" | "pie";
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

  const PIE_COLORS = [
    "hsl(217 91% 60%)",
    "hsl(142 71% 45%)",
    "hsl(24 95% 53%)",
    "hsl(262 83% 58%)",
    "hsl(340 75% 55%)",
    "hsl(45 93% 47%)",
    "hsl(198 93% 50%)",
    "hsl(160 60% 45%)",
  ];

  const isPie = chartType === "pie";

  // Filter out zero-value slices for pie charts
  const filteredPieData = useMemo(() => {
    if (!isPie || !chartData) return chartData;
    return chartData.filter((d: any) => d.value > 0);
  }, [isPie, chartData]);

  // Custom label renderer — hide labels for slices < 3%
  const renderPieLabel = ({ name, percent, x, y }: any) => {
    if (percent < 0.03) return null;
    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-RADIAN * 0);
    const textAnchor = x > 200 ? "start" : "end";
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-[11px] fill-foreground"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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

  // For pie charts, build a dynamic ChartConfig from named data items
  const pieConfig = useMemo(() => {
    if (!isPie || !filteredPieData) return {} as ChartConfig;
    const config: ChartConfig = {};
    filteredPieData.forEach((item: any, i: number) => {
      const key = item.name || `slice-${i}`;
      config[key] = { label: key, color: PIE_COLORS[i % PIE_COLORS.length] };
    });
    return config;
  }, [isPie, filteredPieData]);

  const pieTotal = useMemo(() => {
    if (!isPie || !chartData) return 0;
    return chartData.reduce((sum, d) => sum + d.value, 0);
  }, [isPie, chartData]);

  // Calculate statistics if data exists (skip for pie)
  const stats = (!isPie && chartData) ? {
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-4 flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b">
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
                "text-3xl font-bold",
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
        
        <div className="space-y-3 pt-1 overflow-hidden flex flex-col">

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
              <div className="h-[360px]">
                {isPie && filteredPieData && filteredPieData.length > 0 ? (
                  <ChartContainer config={pieConfig} className="h-[360px] w-full">
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(val, name) => (
                              <span>
                                {name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })} FTE
                                {pieTotal > 0 ? ` (${((Number(val) / pieTotal) * 100).toFixed(1)}%)` : ''}
                              </span>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={filteredPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={110}
                        innerRadius={60}
                        paddingAngle={2}
                        label={renderPieLabel}
                        labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                      >
                        {filteredPieData.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      {/* Center total label */}
                      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="central">
                        <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                        <tspan x="50%" dy="1.4em" className="text-base font-semibold fill-foreground">{formatValue(pieTotal)}</tspan>
                      </text>
                      <Legend
                        verticalAlign="bottom"
                        layout="horizontal"
                        wrapperStyle={{ paddingTop: 8 }}
                        formatter={(val: string) => <span className="text-xs text-foreground">{val}</span>}
                      />
                    </PieChart>
                  </ChartContainer>
                ) : enrichedData && enrichedData.length > 0 ? (
                  <ChartContainer config={{ value: { label: title, color: getChartColor() } } satisfies ChartConfig} className="h-[300px] w-full">
                    {chartType === "area" ? (
                      <AreaChart data={enrichedData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
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
                          domain={['auto', 'auto']}
                          width={45}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="var(--color-value)"
                          strokeWidth={3}
                          fill="url(#chartGradient)"
                        />
                      </AreaChart>
                    ) : chartType === "line" ? (
                      <LineChart data={enrichedData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
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
                          domain={['auto', 'auto']}
                          width={45}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--color-value)"
                          strokeWidth={3}
                          dot={{ fill: "var(--color-value)", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={enrichedData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
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
                          domain={['auto', 'auto']}
                          width={45}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="value"
                          fill="var(--color-value)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ChartContainer>
                ) : null}
              </div>

              {/* Statistics — pie shows total, others show high/avg/low */}
              {isPie && pieTotal > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-xl font-semibold text-foreground">{formatValue(pieTotal)}</p>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {stats && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="grid grid-cols-3 gap-6">
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
            </div>
          )}

          {activeTab === "table" && (
            <div className="space-y-4">
              <div className="h-[300px]">
                {isPie && filteredPieData && filteredPieData.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden h-full">
                    <ScrollArea className="h-full">
                      <div 
                        className="grid sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b"
                        style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                      >
                        <div className="px-4 py-3 text-left font-semibold text-sm">Skill Mix</div>
                        <div className="px-4 py-3 text-right font-semibold text-sm">FTE</div>
                        <div className="px-4 py-3 text-right font-semibold text-sm">%</div>
                      </div>
                      {filteredPieData.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="grid border-b hover:bg-muted/50 transition-colors"
                          style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                        >
                          <div className="px-4 py-3 text-left text-sm font-medium flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                            {item.name}
                          </div>
                          <div className="px-4 py-3 text-right text-sm">{item.value.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })}</div>
                          <div className="px-4 py-3 text-right text-sm">{pieTotal > 0 ? `${((item.value / pieTotal) * 100).toFixed(1)}%` : '—'}</div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                ) : enrichedData && enrichedData.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden h-full">
                    <ScrollArea className="h-full">
                      <div 
                        className="grid sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b"
                        style={{ gridTemplateColumns: '1fr 1fr' }}
                      >
                        <div className="px-4 py-3 text-left font-semibold text-sm">Period</div>
                        <div className="px-4 py-3 text-right font-semibold text-sm">{title}</div>
                      </div>
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

              {/* Statistics for table view */}
              {isPie && pieTotal > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-xl font-semibold text-foreground">{formatValue(pieTotal)}</p>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {stats && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="grid grid-cols-3 gap-6">
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
