import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
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
  chartData?: Array<any>;
  chartType?: "line" | "bar" | "area" | "pie" | "radial";
  breakdownData?: Array<any>;
  decimalPlaces?: number;
  xAxisLabels?: string[];
  showAllOptions?: boolean;
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
  showAllOptions = false,
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
  const isRadial = chartType === "radial";

  // Radial gauge helpers
  const radialValue = isRadial && chartData?.[0] ? chartData[0].value : 0;
  const radialFillColor = radialValue < 10
    ? "hsl(142 76% 36%)"
    : radialValue < 20
      ? "hsl(45 93% 47%)"
      : "hsl(0 84% 60%)";
  const radialData = [{ value: radialValue, fill: radialFillColor }];
  const radialConfig: ChartConfig = { value: { label: title, color: radialFillColor } };

  // Filter out zero-value slices and group small ones into "Other"
  const filteredPieData = useMemo(() => {
    if (!isPie || !chartData) return chartData;
    const nonZero = chartData.filter((d: any) => d.value > 0);
    const total = nonZero.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return nonZero;
    const threshold = total * 0.03;
    const major = nonZero.filter((d: any) => d.value >= threshold).sort((a: any, b: any) => b.value - a.value);
    const minorSum = nonZero.filter((d: any) => d.value < threshold).reduce((sum, d) => sum + d.value, 0);
    if (minorSum > 0) major.push({ name: "Other", value: minorSum } as any);
    return major;
  }, [isPie, chartData]);

  // No external labels — using side legend instead

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
      <DialogContent className={cn("max-h-[85vh] overflow-hidden p-4 flex flex-col", showAllOptions ? "max-w-4xl" : "max-w-3xl")}>
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
        
        <div className="space-y-3 pt-1 overflow-hidden flex flex-col flex-1 min-h-0">

          {/* Toggle for Chart and Table — hidden when showAllOptions */}
          {!showAllOptions && (
            <ToggleButtonGroup
              items={[{ id: "chart", label: "Chart" }, { id: "table", label: "Table" }]}
              activeId={activeTab}
              onSelect={setActiveTab}
              layoutId="kpiChartTab"
              className="max-w-xs"
            />
          )}

          {/* All 3 Options View */}
          {showAllOptions ? (
            <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              <div className="space-y-8 pb-4">
                {/* Option A: Horizontal Bar — Vacancy Rate % */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Horizontal Bar — Vacancy Rate % by Department</h4>
                  <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                    <ChartContainer config={{ vacancyRate: { label: "Vacancy Rate %", color: "hsl(var(--primary))" } } satisfies ChartConfig} className="h-full w-full">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toFixed(1)}%</span>} />} />
                        <Bar dataKey="vacancyRate" radius={[0, 4, 4, 0]}>
                          {(chartData || []).map((entry: any, i: number) => (
                            <Cell
                              key={i}
                              fill={entry.vacancyRate < 10 ? "hsl(142 76% 36%)" : entry.vacancyRate < 20 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 ml-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142 76% 36%)" }} />&lt;10% Good</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />10–20% Watch</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(0 84% 60%)" }} />&gt;20% Critical</span>
                  </div>
                </div>

                {/* Option B: Stacked Bar — Hired + Gap */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Stacked Bar — Hired FTEs + Vacancy Gap</h4>
                  <div className="h-[280px]">
                    <ChartContainer config={{
                      hired: { label: "Hired FTEs", color: "hsl(217 91% 60%)" },
                      gap: { label: "Vacancy Gap", color: "hsl(24 95% 53%)" },
                    } satisfies ChartConfig} className="h-full w-full">
                      <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="hired" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="gap" stackId="a" fill="hsl(24 95% 53%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>

                {/* Option C: Grouped Bar — Hired vs Target */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Grouped Bar — Hired vs Target FTEs</h4>
                  <div className="h-[280px]">
                    <ChartContainer config={{
                      hired: { label: "Hired FTEs", color: "hsl(217 91% 60%)" },
                      target: { label: "Target FTEs", color: "hsl(var(--muted-foreground))" },
                    } satisfies ChartConfig} className="h-full w-full">
                      <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="hired" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" fill="hsl(var(--muted-foreground) / 0.4)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <>
          {activeTab === "chart" && (
            <div className="space-y-4">
              <div className="h-[360px]">
                {isRadial ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <ChartContainer config={radialConfig} className="h-[280px] w-[280px]">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={130}
                        startAngle={225}
                        endAngle={-45}
                        data={radialData}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar
                          dataKey="value"
                          angleAxisId={0}
                          cornerRadius={10}
                          background={{ fill: "hsl(var(--muted))" }}
                        />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                          <tspan x="50%" dy="-0.5em" className="text-[13px] fill-muted-foreground">Vacancy</tspan>
                          <tspan x="50%" dy="1.6em" className="text-2xl font-bold fill-foreground">{radialValue.toFixed(1)}%</tspan>
                        </text>
                      </RadialBarChart>
                    </ChartContainer>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(142 76% 36%)" }} />&lt;10% Good</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />10–20% Watch</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(0 84% 60%)" }} />&gt;20% Critical</span>
                    </div>
                  </div>
                ) : isPie && filteredPieData && filteredPieData.length > 0 ? (
                  <div className="flex items-center gap-6 h-[360px]">
                    {/* Donut chart */}
                    <div className="flex-1 h-full min-w-0">
                      <ChartContainer config={pieConfig} className="h-full w-full">
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
                            cy="50%"
                            outerRadius={120}
                            innerRadius={70}
                            paddingAngle={2}
                            label={false}
                            labelLine={false}
                          >
                            {filteredPieData.map((_: any, i: number) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          {/* Center total label */}
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                            <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                            <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(pieTotal)}</tspan>
                          </text>
                        </PieChart>
                      </ChartContainer>
                    </div>
                    {/* Side legend */}
                    <div className="w-48 flex flex-col gap-2 pr-2">
                      {filteredPieData.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="truncate flex-1 text-foreground">{item.name}</span>
                          <span className="tabular-nums text-muted-foreground shrink-0">
                            {formatValue(item.value)}
                          </span>
                          <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">
                            {pieTotal > 0 ? `${((item.value / pieTotal) * 100).toFixed(0)}%` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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

              {/* Statistics — radial shows value + close */}
              {isRadial && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Vacancy Rate</p>
                    <p className="text-xl font-semibold text-foreground">{radialValue.toFixed(1)}%</p>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
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
                {isRadial ? (
                  <div className="rounded-lg border overflow-hidden h-full">
                    <div 
                      className="grid sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b"
                      style={{ gridTemplateColumns: '1fr 1fr' }}
                    >
                      <div className="px-4 py-3 text-left font-semibold text-sm">Metric</div>
                      <div className="px-4 py-3 text-right font-semibold text-sm">Value</div>
                    </div>
                    <div className="grid border-b" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className="px-4 py-3 text-left text-sm font-medium">Vacancy Rate</div>
                      <div className="px-4 py-3 text-right text-sm">{radialValue.toFixed(1)}%</div>
                    </div>
                    <div className="grid border-b" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className="px-4 py-3 text-left text-sm font-medium">Status</div>
                      <div className="px-4 py-3 text-right text-sm font-medium" style={{ color: radialFillColor }}>
                        {radialValue < 10 ? "Good" : radialValue < 20 ? "Watch" : "Critical"}
                      </div>
                    </div>
                  </div>
                ) : isPie && filteredPieData && filteredPieData.length > 0 ? (
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
              {isRadial && (
                <div className="flex items-center justify-end pt-2 border-t">
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
