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
  chartType?: "line" | "bar" | "area" | "pie" | "radial" | "dual-pie" | "nested-pie";
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

  const isNestedPie = chartType === "nested-pie";
  const isDualPie = chartType === "dual-pie";
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

  // Filter out zero-value slices — show all individual skill categories
  const filteredPieData = useMemo(() => {
    if (!isPie || !chartData) return chartData;
    return chartData
      .filter((d: any) => d.value > 0)
      .sort((a: any, b: any) => b.value - a.value);
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

  // Calculate statistics if data exists (skip for pie, dual-pie, nested-pie)
  const stats = (!isPie && !isDualPie && !isNestedPie && chartData) ? {
    high: formatValue(Math.max(...chartData.map(d => d.value))),
    low: formatValue(Math.min(...chartData.map(d => d.value))),
    average: formatValue(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length),
  } : null;

  // Add time labels to chart data - use last 12 data points when xAxisLabels provided
  const enrichedData = useMemo(() => {
    if (!chartData) return undefined;
    
    // If data items have a `name` field (e.g. day-of-week labels), use that as period
    if (chartData.length > 0 && chartData[0].name) {
      return chartData.map((item) => ({
        ...item,
        period: item.name,
      }));
    }

    // Use real month labels whenever available
    if (xAxisLabels && xAxisLabels.length > 0) {
      const dataToUse = chartData.slice(-xAxisLabels.length);
      return dataToUse.map((item, index) => ({
        ...item,
        period: xAxisLabels[index] ?? `P${index + 1}`,
      }));
    }

    return chartData.map((item, index) => ({
      ...item,
      period: `P${index + 1}`,
    }));
  }, [chartData, xAxisLabels]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[85vh] overflow-hidden p-3 flex flex-col gap-2", isNestedPie ? "max-w-5xl" : (Array.isArray(chartData) && chartData.length >= 20) ? "max-w-5xl" : showAllOptions ? "max-w-4xl" : "max-w-3xl")}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
          <div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="sr-only">
              Chart and table data for {title}
            </DialogDescription>
          </div>
          
          {/* Current Value and Trend */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className={cn(
                "text-2xl font-bold",
                isNegative ? "text-orange-600" : "text-foreground"
              )}>
                {value}
              </p>
            </div>
            {trend && trendValue && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Trend</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xl font-semibold", getTrendColor())}>
                    {trend === "up" ? "↑" : "↓"} {trendValue}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-3 pt-0 overflow-hidden flex flex-col flex-1 min-h-0">

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
                {title === "Paid FTEs" ? (
                  <>
                    {/* Option A: Donut by Department */}
                    {(() => {
                      const deptData = chartData || [];
                      const total = deptData.reduce((s: number, d: any) => s + Number(d.paid ?? d.value ?? 0), 0);
                      const threshold = total * 0.03;
                      const major = deptData.filter((d: any) => Number(d.paid ?? d.value ?? 0) >= threshold).sort((a: any, b: any) => Number(b.paid ?? b.value ?? 0) - Number(a.paid ?? a.value ?? 0));
                      const minorSum = deptData.filter((d: any) => Number(d.paid ?? d.value ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.paid ?? d.value ?? 0), 0);
                      const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.paid ?? d.value ?? 0) * 10) / 10 }))];
                      if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                      const donutConfig: ChartConfig = {};
                      pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Donut — Paid FTEs by Department</h4>
                          <div className="flex items-center gap-6 h-[320px]">
                            <div className="flex-1 h-full min-w-0">
                              <ChartContainer config={donutConfig} className="h-full w-full">
                                <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                  </Pie>
                                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                    <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                                    <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                                  </text>
                                </PieChart>
                              </ChartContainer>
                            </div>
                            <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                              {pieData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="truncate flex-1 text-foreground">{item.name}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Option B: Horizontal Bar by Department */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Horizontal Bar — Paid FTEs by Department</h4>
                      <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                        <ChartContainer config={{ paid: { label: "Paid FTEs", color: "hsl(217 91% 60%)" } } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTEs</span>} />} />
                            <Bar dataKey="paid" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option C: Stacked Composition Bar */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Stacked Bar — Paid FTE Composition by Department</h4>
                      <div className="h-[320px]">
                        <ChartContainer config={{
                          employed: { label: "Employed Productive", color: "hsl(217 91% 60%)" },
                          contractor: { label: "Contractor", color: "hsl(24 95% 53%)" },
                          overtime: { label: "Overtime", color: "hsl(0 84% 60%)" },
                          prn: { label: "PRN", color: "hsl(262 83% 58%)" },
                        } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="employed" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="contractor" stackId="a" fill="hsl(24 95% 53%)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="overtime" stackId="a" fill="hsl(0 84% 60%)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="prn" stackId="a" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  </>
                ) : title.toUpperCase().includes("EMPLOYED PRODUCTIVE") ? (
                  <>
                    {/* Option A: Donut by Department */}
                    {(() => {
                      const deptData = chartData || [];
                      const total = deptData.reduce((s: number, d: any) => s + Number(d.employed ?? 0), 0);
                      const threshold = total * 0.03;
                      const major = deptData.filter((d: any) => Number(d.employed ?? 0) >= threshold).sort((a: any, b: any) => Number(b.employed ?? 0) - Number(a.employed ?? 0));
                      const minorSum = deptData.filter((d: any) => Number(d.employed ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.employed ?? 0), 0);
                      const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.employed ?? 0) * 10) / 10 }))];
                      if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                      const donutConfig: ChartConfig = {};
                      pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Donut — Employed Productive FTEs by Department</h4>
                          <div className="flex items-center gap-6 h-[320px]">
                            <div className="flex-1 h-full min-w-0">
                              <ChartContainer config={donutConfig} className="h-full w-full">
                                <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                  </Pie>
                                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                    <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                                    <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                                  </text>
                                </PieChart>
                              </ChartContainer>
                            </div>
                            <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                              {pieData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="truncate flex-1 text-foreground">{item.name}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Option B: Horizontal Bar */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Horizontal Bar — Employed Productive FTEs by Department</h4>
                      <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                        <ChartContainer config={{ employed: { label: "Employed Productive FTEs", color: "hsl(217 91% 60%)" } } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={[...(chartData || [])].sort((a: any, b: any) => b.employed - a.employed)} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTEs</span>} />} />
                            <Bar dataKey="employed" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option C: Grouped Bar — Employed vs Paid */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Grouped Bar — Employed Productive vs Total Paid FTEs</h4>
                      <div className="h-[320px]">
                        <ChartContainer config={{
                          employed: { label: "Employed Productive", color: "hsl(217 91% 60%)" },
                          paid: { label: "Total Paid", color: "hsl(var(--muted-foreground))" },
                        } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="employed" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="paid" fill="hsl(var(--muted-foreground) / 0.4)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  </>

                ) : title === "Contract FTEs" ? (
                  <>
                    {/* Option A: Horizontal Bar — orange */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Horizontal Bar — Contract FTEs by Department</h4>
                      <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                        <ChartContainer config={{ contractor: { label: "Contract FTEs", color: "hsl(24 95% 53%)" } } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={[...(chartData || [])].sort((a: any, b: any) => b.contractor - a.contractor)} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTEs</span>} />} />
                            <Bar dataKey="contractor" fill="hsl(24 95% 53%)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option B: Grouped Bar — Contractor vs Employed */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Grouped Bar — Contract vs Employed FTEs</h4>
                      <div className="h-[320px]">
                        <ChartContainer config={{
                          contractor: { label: "Contract", color: "hsl(24 95% 53%)" },
                          employed: { label: "Employed", color: "hsl(217 91% 60%)" },
                        } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="contractor" fill="hsl(24 95% 53%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="employed" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option C: Donut */}
                    {(() => {
                      const deptData = chartData || [];
                      const total = deptData.reduce((s: number, d: any) => s + Number(d.contractor ?? 0), 0);
                      const threshold = total * 0.03;
                      const major = deptData.filter((d: any) => Number(d.contractor ?? 0) >= threshold).sort((a: any, b: any) => Number(b.contractor ?? 0) - Number(a.contractor ?? 0));
                      const minorSum = deptData.filter((d: any) => Number(d.contractor ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.contractor ?? 0), 0);
                      const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.contractor ?? 0) * 10) / 10 }))];
                      if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                      const donutConfig: ChartConfig = {};
                      pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Donut — Contract FTE Distribution</h4>
                          <div className="flex items-center gap-6 h-[320px]">
                            <div className="flex-1 h-full min-w-0">
                              <ChartContainer config={donutConfig} className="h-full w-full">
                                <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                  </Pie>
                                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                    <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                                    <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                                  </text>
                                </PieChart>
                              </ChartContainer>
                            </div>
                            <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                              {pieData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="truncate flex-1 text-foreground">{item.name}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>

                ) : title === "Overtime FTEs" ? (
                  <>
                    {/* Option A: Color-coded Horizontal Bar */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Horizontal Bar — Overtime FTEs by Department (Health Status)</h4>
                      <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                        <ChartContainer config={{ overtime: { label: "Overtime FTEs", color: "hsl(0 84% 60%)" } } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={[...(chartData || [])].sort((a: any, b: any) => b.overtime - a.overtime)} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTEs</span>} />} />
                            <Bar dataKey="overtime" radius={[0, 4, 4, 0]}>
                              {[...(chartData || [])].sort((a: any, b: any) => b.overtime - a.overtime).map((entry: any, i: number) => (
                                <Cell key={i} fill={entry.overtime < 2 ? "hsl(142 76% 36%)" : entry.overtime < 5 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 ml-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142 76% 36%)" }} />&lt;2 FTE Good</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />2–5 FTE Watch</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(0 84% 60%)" }} />&gt;5 FTE Critical</span>
                      </div>
                    </div>

                    {/* Option B: Stacked Bar — Overtime vs Regular */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Stacked Bar — Overtime vs Regular (Employed) FTEs</h4>
                      <div className="h-[320px]">
                        <ChartContainer config={{
                          employed: { label: "Regular (Employed)", color: "hsl(217 91% 60%)" },
                          overtime: { label: "Overtime", color: "hsl(0 84% 60%)" },
                        } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="employed" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="overtime" stackId="a" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option C: Donut */}
                    {(() => {
                      const deptData = chartData || [];
                      const total = deptData.reduce((s: number, d: any) => s + Number(d.overtime ?? 0), 0);
                      const threshold = total * 0.03;
                      const major = deptData.filter((d: any) => Number(d.overtime ?? 0) >= threshold).sort((a: any, b: any) => Number(b.overtime ?? 0) - Number(a.overtime ?? 0));
                      const minorSum = deptData.filter((d: any) => Number(d.overtime ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.overtime ?? 0), 0);
                      const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.overtime ?? 0) * 10) / 10 }))];
                      if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                      const donutConfig: ChartConfig = {};
                      pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Donut — Overtime FTE Distribution</h4>
                          <div className="flex items-center gap-6 h-[320px]">
                            <div className="flex-1 h-full min-w-0">
                              <ChartContainer config={donutConfig} className="h-full w-full">
                                <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                  </Pie>
                                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                    <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                                    <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                                  </text>
                                </PieChart>
                              </ChartContainer>
                            </div>
                            <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                              {pieData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="truncate flex-1 text-foreground">{item.name}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>

                ) : title === "Total PRN" ? (
                  <>
                    {/* Option A: Donut by Department */}
                    {(() => {
                      const deptData = chartData || [];
                      const total = deptData.reduce((s: number, d: any) => s + Number(d.prn ?? 0), 0);
                      const threshold = total * 0.03;
                      const major = deptData.filter((d: any) => Number(d.prn ?? 0) >= threshold).sort((a: any, b: any) => Number(b.prn ?? 0) - Number(a.prn ?? 0));
                      const minorSum = deptData.filter((d: any) => Number(d.prn ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.prn ?? 0), 0);
                      const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.prn ?? 0) * 10) / 10 }))];
                      if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                      const donutConfig: ChartConfig = {};
                      pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Donut — PRN FTEs by Department</h4>
                          <div className="flex items-center gap-6 h-[320px]">
                            <div className="flex-1 h-full min-w-0">
                              <ChartContainer config={donutConfig} className="h-full w-full">
                                <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                  </Pie>
                                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                    <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total</tspan>
                                    <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                                  </text>
                                </PieChart>
                              </ChartContainer>
                            </div>
                            <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                              {pieData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="truncate flex-1 text-foreground">{item.name}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Option B: Horizontal Bar */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Horizontal Bar — PRN FTEs by Department</h4>
                      <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                        <ChartContainer config={{ prn: { label: "PRN FTEs", color: "hsl(262 83% 58%)" } } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={[...(chartData || [])].sort((a: any, b: any) => b.prn - a.prn)} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTEs</span>} />} />
                            <Bar dataKey="prn" fill="hsl(262 83% 58%)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option C: Grouped Bar — PRN vs Employed */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Grouped Bar — PRN vs Employed FTEs</h4>
                      <div className="h-[320px]">
                        <ChartContainer config={{
                          prn: { label: "PRN", color: "hsl(262 83% 58%)" },
                          employed: { label: "Employed", color: "hsl(217 91% 60%)" },
                        } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="prn" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="employed" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  </>

                ) : title === "Total NP%" ? (
                  <>
                    {/* Option A: Color-coded Horizontal Bar — NP% */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Horizontal Bar — NP% by Department (Health Status)</h4>
                      <div style={{ height: Math.max(200, (chartData?.length || 0) * 32 + 40) }}>
                        <ChartContainer config={{ npPercent: { label: "NP%", color: "hsl(0 84% 60%)" } } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent formatter={(val) => <span>{Number(val).toFixed(1)}%</span>} />} />
                            <Bar dataKey="npPercent" radius={[0, 4, 4, 0]}>
                              {(chartData || []).map((entry: any, i: number) => (
                                <Cell key={i} fill={entry.npPercent < 10 ? "hsl(142 76% 36%)" : entry.npPercent < 15 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 ml-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142 76% 36%)" }} />&lt;10% Good</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />10–15% Watch</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(0 84% 60%)" }} />&gt;15% Critical</span>
                      </div>
                    </div>

                    {/* Option B: Grouped Bar — NP Hours vs Productive Hours */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Grouped Bar — Non-Productive vs Productive Hours by Department</h4>
                      <div className="h-[320px]">
                        <ChartContainer config={{
                          npHours: { label: "Non-Productive", color: "hsl(0 84% 60%)" },
                          productiveHours: { label: "Productive", color: "hsl(142 76% 36%)" },
                        } satisfies ChartConfig} className="h-full w-full">
                          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={45} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="npHours" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="productiveHours" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Option C: Donut — NP Hours Distribution */}
                    {(() => {
                      const deptData = chartData || [];
                      const total = deptData.reduce((s: number, d: any) => s + Number(d.npHours ?? 0), 0);
                      const threshold = total * 0.03;
                      const major = deptData.filter((d: any) => Number(d.npHours ?? 0) >= threshold).sort((a: any, b: any) => Number(b.npHours ?? 0) - Number(a.npHours ?? 0));
                      const minorSum = deptData.filter((d: any) => Number(d.npHours ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.npHours ?? 0), 0);
                      const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.npHours ?? 0) * 10) / 10 }))];
                      if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                      const donutConfig: ChartConfig = {};
                      pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Option C: Donut — Non-Productive Hours Distribution</h4>
                          <div className="flex items-center gap-6 h-[320px]">
                            <div className="flex-1 h-full min-w-0">
                              <ChartContainer config={donutConfig} className="h-full w-full">
                                <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                  </Pie>
                                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                    <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Total NP</tspan>
                                    <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                                  </text>
                                </PieChart>
                              </ChartContainer>
                            </div>
                            <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                              {pieData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span className="truncate flex-1 text-foreground">{item.name}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                                  <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>

                ) : (
                  <>
                {/* Option A: Horizontal Bar — Vacancy Rate % */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Option A: Horizontal Bar — Vacancy Rate % by Skill Mix</h4>
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

                {/* Option B: Donut — Hired FTEs by Skill Mix */}
                {(() => {
                  const skillData = chartData || [];
                  const total = skillData.reduce((s: number, d: any) => s + Number(d.hired ?? 0), 0);
                  const threshold = skillData.length > 15 ? total * 0.03 : 0;
                  const major = skillData.filter((d: any) => Number(d.hired ?? 0) >= threshold).sort((a: any, b: any) => Number(b.hired ?? 0) - Number(a.hired ?? 0));
                  const minorSum = skillData.filter((d: any) => Number(d.hired ?? 0) < threshold).reduce((s: number, d: any) => s + Number(d.hired ?? 0), 0);
                  const pieData = [...major.map((d: any) => ({ name: d.name, value: Math.round(Number(d.hired ?? 0) * 10) / 10 }))];
                  if (minorSum > 0) pieData.push({ name: "Other", value: Math.round(minorSum * 10) / 10 });
                  const donutConfig: ChartConfig = {};
                  pieData.forEach((item, i) => { donutConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                  return (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Option B: Donut — Hired FTEs by Skill Mix</h4>
                      <div className="flex items-center gap-6 h-[320px]">
                        <div className="flex-1 h-full min-w-0">
                          <ChartContainer config={donutConfig} className="h-full w-full">
                            <PieChart>
                              <ChartTooltip content={<ChartTooltipContent formatter={(val, name) => <span>{name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE {total > 0 ? `(${((Number(val) / total) * 100).toFixed(1)}%)` : ''}</span>} />} />
                              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={65} paddingAngle={2} label={false} labelLine={false}>
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                              </Pie>
                              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                <tspan x="50%" dy="-0.6em" className="text-[11px] fill-muted-foreground">Hired</tspan>
                                <tspan x="50%" dy="1.4em" className="text-lg font-semibold fill-foreground">{formatValue(total)}</tspan>
                              </text>
                            </PieChart>
                          </ChartContainer>
                        </div>
                        <div className="w-52 flex flex-col gap-1.5 pr-2 max-h-[300px] overflow-y-auto">
                          {pieData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="truncate flex-1 text-foreground">{item.name}</span>
                              <span className="tabular-nums text-muted-foreground shrink-0">{formatValue(item.value)}</span>
                              <span className="tabular-nums text-muted-foreground shrink-0 w-10 text-right text-xs">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
          {activeTab === "chart" && (
            <div className="space-y-1">
              <div className="h-[300px]">
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
                ) : isDualPie && chartData && chartData.length === 2 ? (
                  (() => {
                    const allSliceNames = new Set<string>();
                    chartData.forEach((g: any) => g.slices?.forEach((s: any) => allSliceNames.add(s.name)));
                    const legendItems = Array.from(allSliceNames);
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-center gap-8">
                          {chartData.map((group: any, gi: number) => {
                            const slices = (group.slices || []).filter((s: any) => s.value > 0).sort((a: any, b: any) => b.value - a.value);
                            const total = group.total ?? slices.reduce((s: number, d: any) => s + d.value, 0);
                            const dualConfig: ChartConfig = {};
                            slices.forEach((item: any, i: number) => { dualConfig[item.name] = { label: item.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
                            return (
                              <div key={gi} className="flex flex-col items-center">
                                <p className="text-sm font-medium text-foreground mb-1">{group.shift}</p>
                                <div className="w-[200px] h-[200px]">
                                  <ChartContainer config={dualConfig} className="h-full w-full">
                                    <PieChart>
                                      <ChartTooltip
                                        content={
                                          <ChartTooltipContent
                                            formatter={(val, name) => (
                                              <span>
                                                {name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE
                                                {total > 0 ? ` (${((Number(val) / total) * 100).toFixed(1)}%)` : ''}
                                              </span>
                                            )}
                                          />
                                        }
                                      />
                                      <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2} label={false} labelLine={false}>
                                        {slices.map((_: any, i: number) => (
                                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                      </Pie>
                                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                        <tspan x="50%" dy="-0.5em" className="text-[10px] fill-muted-foreground">Total</tspan>
                                        <tspan x="50%" dy="1.3em" className="text-base font-semibold fill-foreground">{formatValue(total)}</tspan>
                                      </text>
                                    </PieChart>
                                  </ChartContainer>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Shared legend */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 border-t">
                          {legendItems.map((name, i) => (
                            <div key={name} className="flex items-center gap-1.5 text-sm">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-foreground">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : isNestedPie && chartData && chartData.length >= 1 ? (
                  (() => {
                    const groups = chartData as any[];
                    // Collect all unique skill names for consistent coloring
                    const allSkillNames = new Set<string>();
                    groups.forEach((g: any) => {
                      g.inner?.slices?.forEach((s: any) => allSkillNames.add(s.name));
                      g.outer?.slices?.forEach((s: any) => allSkillNames.add(s.name));
                    });
                    const legendItems = Array.from(allSkillNames);
                    const skillColorMap: Record<string, string> = {};
                    legendItems.forEach((name, i) => { skillColorMap[name] = PIE_COLORS[i % PIE_COLORS.length]; });

                    return (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex flex-row items-start justify-center gap-8 w-full">
                          {groups.map((group: any, gi: number) => {
                            const innerSlices = (group.inner?.slices || []).filter((s: any) => s.value > 0).sort((a: any, b: any) => b.value - a.value);
                            const outerSlices = (group.outer?.slices || []).filter((s: any) => s.value > 0).sort((a: any, b: any) => b.value - a.value);
                            const innerTotal = group.inner?.total ?? innerSlices.reduce((s: number, d: any) => s + d.value, 0);
                            const outerTotal = group.outer?.total ?? outerSlices.reduce((s: number, d: any) => s + d.value, 0);
                            const combinedTotal = Math.round((innerTotal + outerTotal) * 10) / 10;

                            const nestedConfig: ChartConfig = {};
                            [...innerSlices, ...outerSlices].forEach((item: any) => {
                              if (!nestedConfig[item.name]) {
                                nestedConfig[item.name] = { label: item.name, color: skillColorMap[item.name] };
                              }
                            });

                            if (innerSlices.length === 0 && outerSlices.length === 0) return null;

                            return (
                              <div key={gi} className="flex flex-col items-center">
                                <p className="text-sm font-semibold text-foreground mb-2">{group.category}</p>
                                <div className="flex items-center gap-4">
                                  <div className="w-[220px] h-[220px]">
                                    <ChartContainer config={nestedConfig} className="h-full w-full">
                                      <PieChart>
                                        <ChartTooltip
                                          content={
                                            <ChartTooltipContent
                                              formatter={(val, name) => (
                                                <span>
                                                  {name}: {Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} FTE
                                                </span>
                                              )}
                                            />
                                          }
                                        />
                                        {innerSlices.length > 0 && (
                                          <Pie data={innerSlices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25} paddingAngle={2} label={false} labelLine={false}>
                                            {innerSlices.map((s: any) => (
                                              <Cell key={s.name} fill={skillColorMap[s.name] || PIE_COLORS[0]} />
                                            ))}
                                          </Pie>
                                        )}
                                        {outerSlices.length > 0 && (
                                          <Pie data={outerSlices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={60} paddingAngle={2} label={false} labelLine={false}>
                                            {outerSlices.map((s: any) => (
                                              <Cell key={s.name} fill={skillColorMap[s.name] || PIE_COLORS[0]} />
                                            ))}
                                          </Pie>
                                        )}
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                                          <tspan x="50%" dy="-0.5em" className="text-[9px] fill-muted-foreground">Total</tspan>
                                          <tspan x="50%" dy="1.2em" className="text-sm font-semibold fill-foreground">{formatValue(combinedTotal)}</tspan>
                                        </text>
                                      </PieChart>
                                    </ChartContainer>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Single shared legend */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2 border-t w-full">
                          {legendItems.map((name) => (
                            <div key={name} className="flex items-center gap-1.5 text-sm">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: skillColorMap[name] }} />
                              <span className="text-foreground">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : isPie && filteredPieData && filteredPieData.length > 0 ? (
                  <div className="h-[300px] w-full flex justify-center">
                    <div className="inline-flex max-w-full items-center justify-center gap-6">
                      {/* Donut chart */}
                      <div className="w-[320px] h-[300px] shrink-0 flex items-center justify-center">
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
                      <div className="w-48 shrink-0 flex flex-col gap-2">
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
                  </div>
                ) : enrichedData && enrichedData.length > 0 ? (
                  <ChartContainer config={{ value: { label: title, color: getChartColor() } } satisfies ChartConfig} className="h-[290px] w-full">
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
                          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                          width={45}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel={false} labelFormatter={(label) => label} formatter={(val) => <span className="font-mono font-medium">{Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>} hideIndicator />} />
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
                          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
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
                          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
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
                <div className="flex items-center justify-between pt-2 border-t mt-1">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Vacancy Rate</p>
                    <p className="text-xl font-semibold text-foreground">{radialValue.toFixed(1)}%</p>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {/* Statistics — pie shows total, others show high/avg/low */}
              {isPie && pieTotal > 0 && (
                <div className="flex items-center justify-between pt-2 border-t mt-1">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-xl font-semibold text-foreground">{formatValue(pieTotal)}</p>
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {isDualPie && chartData && (
                <div className="flex items-center justify-between pt-2 border-t mt-1">
                  <div className="grid grid-cols-2 gap-6">
                    {(chartData as any[]).map((group: any) => (
                      <div key={group.shift} className="text-center">
                        <p className="text-xs text-muted-foreground">{group.shift} Total</p>
                        <p className="text-lg font-semibold text-foreground">{formatValue(group.total)}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {isNestedPie && chartData && (
                <div className="flex items-center justify-between pt-2 border-t mt-1">
                  <div className="grid grid-cols-4 gap-4">
                    {(chartData as any[]).map((group: any) => {
                      if (!group.inner && !group.outer) return null;
                      return [
                        <div key={`${group.category}-day`} className="text-center">
                          <p className="text-xs text-muted-foreground">{group.category} Day</p>
                          <p className="text-lg font-semibold text-foreground">{formatValue(group.inner?.total ?? 0)}</p>
                        </div>,
                        <div key={`${group.category}-night`} className="text-center">
                          <p className="text-xs text-muted-foreground">{group.category} Night</p>
                          <p className="text-lg font-semibold text-foreground">{formatValue(group.outer?.total ?? 0)}</p>
                        </div>,
                      ];
                    })}
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {stats && (
                <div className="flex items-center justify-between pt-2 border-t mt-1">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="text-lg font-semibold text-foreground">{stats.high}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Average</p>
                      <p className="text-lg font-semibold text-foreground">{stats.average}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="text-lg font-semibold text-foreground">{stats.low}</p>
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
                ) : isDualPie && chartData ? (
                  (() => {
                    const groups = chartData as any[];
                    const allSkills = Array.from(new Set(groups.flatMap((g: any) => g.slices.map((s: any) => s.name))));
                    return (
                      <div className="rounded-lg border overflow-hidden h-full">
                        <ScrollArea className="h-full">
                          <div
                            className="grid sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b"
                            style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr 0.8fr' }}
                          >
                            <div className="px-4 py-3 text-left font-semibold text-sm">Skill Mix</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Day FTE</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Day %</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Night FTE</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Night %</div>
                          </div>
                          {allSkills.map((skill, idx) => {
                            const dayGroup = groups.find((g: any) => g.shift === 'Day');
                            const nightGroup = groups.find((g: any) => g.shift === 'Night');
                            const daySlice = dayGroup?.slices.find((s: any) => s.name === skill);
                            const nightSlice = nightGroup?.slices.find((s: any) => s.name === skill);
                            const dayVal = daySlice?.value ?? 0;
                            const nightVal = nightSlice?.value ?? 0;
                            const dayTotal = dayGroup?.total ?? 0;
                            const nightTotal = nightGroup?.total ?? 0;
                            return (
                              <div
                                key={skill}
                                className="grid border-b hover:bg-muted/50 transition-colors"
                                style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr 0.8fr' }}
                              >
                                <div className="px-4 py-3 text-left text-sm font-medium flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                  {skill}
                                </div>
                                <div className="px-4 py-3 text-right text-sm">{formatValue(dayVal)}</div>
                                <div className="px-4 py-3 text-right text-sm">{dayTotal > 0 ? `${((dayVal / dayTotal) * 100).toFixed(1)}%` : '—'}</div>
                                <div className="px-4 py-3 text-right text-sm">{formatValue(nightVal)}</div>
                                <div className="px-4 py-3 text-right text-sm">{nightTotal > 0 ? `${((nightVal / nightTotal) * 100).toFixed(1)}%` : '—'}</div>
                              </div>
                            );
                          })}
                        </ScrollArea>
                      </div>
                    );
                  })()
                ) : isNestedPie && chartData ? (
                  (() => {
                    const groups = chartData as any[];
                    const allSkills = Array.from(new Set<string>(
                      groups.flatMap((g: any) => [
                        ...(g.inner?.slices || []).map((s: any) => s.name),
                        ...(g.outer?.slices || []).map((s: any) => s.name),
                      ])
                    ));
                    const skillColorMap: Record<string, string> = {};
                    allSkills.forEach((name, i) => { skillColorMap[name] = PIE_COLORS[i % PIE_COLORS.length]; });

                    return (
                      <div className="rounded-lg border overflow-hidden h-full">
                        <ScrollArea className="h-full">
                          <div
                            className="grid sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b"
                            style={{ gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 0.8fr' }}
                          >
                            <div className="px-4 py-3 text-left font-semibold text-sm">Skill Mix</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Nrs Day</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Nrs Night</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Non-Nrs Day</div>
                            <div className="px-4 py-3 text-right font-semibold text-sm">Non-Nrs Night</div>
                          </div>
                          {allSkills.map((skill, idx) => {
                            const nrsGroup = groups.find((g: any) => g.category === 'Nursing');
                            const nonNrsGroup = groups.find((g: any) => g.category === 'Non-Nursing');
                            const nrsDay = nrsGroup?.inner?.slices?.find((s: any) => s.name === skill)?.value ?? 0;
                            const nrsNight = nrsGroup?.outer?.slices?.find((s: any) => s.name === skill)?.value ?? 0;
                            const nonNrsDay = nonNrsGroup?.inner?.slices?.find((s: any) => s.name === skill)?.value ?? 0;
                            const nonNrsNight = nonNrsGroup?.outer?.slices?.find((s: any) => s.name === skill)?.value ?? 0;
                            return (
                              <div
                                key={skill}
                                className="grid border-b hover:bg-muted/50 transition-colors"
                                style={{ gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 0.8fr' }}
                              >
                                <div className="px-4 py-3 text-left text-sm font-medium flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: skillColorMap[skill] }} />
                                  {skill}
                                </div>
                                <div className="px-4 py-3 text-right text-sm">{formatValue(nrsDay)}</div>
                                <div className="px-4 py-3 text-right text-sm">{formatValue(nrsNight)}</div>
                                <div className="px-4 py-3 text-right text-sm">{formatValue(nonNrsDay)}</div>
                                <div className="px-4 py-3 text-right text-sm">{formatValue(nonNrsNight)}</div>
                              </div>
                            );
                          })}
                        </ScrollArea>
                      </div>
                    );
                  })()
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
              {isDualPie && chartData && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="grid grid-cols-2 gap-6">
                    {(chartData as any[]).map((group: any) => (
                      <div key={group.shift} className="text-center">
                        <p className="text-xs text-muted-foreground">{group.shift} Total</p>
                        <p className="text-lg font-semibold text-foreground">{formatValue(group.total)}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              )}
              {isNestedPie && chartData && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="grid grid-cols-4 gap-4">
                    {(chartData as any[]).map((group: any) => {
                      if (!group.inner && !group.outer) return null;
                      return [
                        <div key={`${group.category}-day`} className="text-center">
                          <p className="text-xs text-muted-foreground">{group.category} Day</p>
                          <p className="text-lg font-semibold text-foreground">{formatValue(group.inner?.total ?? 0)}</p>
                        </div>,
                        <div key={`${group.category}-night`} className="text-center">
                          <p className="text-xs text-muted-foreground">{group.category} Night</p>
                          <p className="text-lg font-semibold text-foreground">{formatValue(group.outer?.total ?? 0)}</p>
                        </div>,
                      ];
                    })}
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
