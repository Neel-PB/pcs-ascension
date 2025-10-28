import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
}: KPIChartModalProps) {
  const [activeTab, setActiveTab] = useState("chart");
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
    high: Math.max(...chartData.map(d => d.value)).toFixed(1),
    low: Math.min(...chartData.map(d => d.value)).toFixed(1),
    average: (chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1),
  } : null;

  // Add time labels to chart data
  const enrichedData = chartData?.map((item, index) => ({
    ...item,
    period: `P${index + 1}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden pb-4 flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          
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
                    />
                    <Tooltip 
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
                    />
                    <Tooltip 
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
                    />
                    <Tooltip 
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
                        <div className="px-4 py-3 text-right text-sm">{item.value.toFixed(1)}</div>
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
