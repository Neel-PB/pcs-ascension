import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ResponsiveContainer } from "recharts";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  isNegative?: boolean;
  isHighlighted?: boolean;
  delay?: number;
  chartData?: Array<{ value: number }>;
  chartType?: "line" | "bar" | "area";
}

export function KPICard({
  title,
  value,
  trend,
  trendValue,
  isNegative = false,
  isHighlighted = false,
  delay = 0,
  chartData,
  chartType = "line",
}: KPICardProps) {
  const getTrendColor = () => {
    if (isNegative) return "text-destructive";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  const getChartColor = () => {
    if (isNegative) return "hsl(var(--destructive))";
    if (isHighlighted) return "hsl(142 76% 36%)";
    return "hsl(var(--primary))";
  };

  const getGradientId = () => {
    if (isNegative) return "colorNegative";
    if (isHighlighted) return "colorHighlighted";
    return "colorPrimary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full hover:shadow-lg transition-all duration-300",
          isHighlighted && "border-emerald-500/50 bg-emerald-500/5",
          isNegative && "border-destructive/50 bg-destructive/5"
        )}
      >
        <CardContent className="p-5 h-full flex flex-col">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                <span className={cn("text-xs font-semibold", getTrendColor())}>
                  {trend === "up" ? "↑" : "↓"} {trendValue}
                </span>
              </div>
            )}
          </div>

          {/* Value Section */}
          <div className="mb-4">
            <div className={cn(
              "text-3xl font-bold tracking-tight",
              isNegative ? "text-destructive" : "text-foreground"
            )}>
              {value}
            </div>
          </div>

          {/* Chart Section */}
          {chartData && chartData.length > 0 && (
            <div className="flex-1 min-h-[80px] -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={getGradientId()} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor()}
                      strokeWidth={2.5}
                      fill={`url(#${getGradientId()})`}
                      dot={false}
                    />
                  </AreaChart>
                ) : chartType === "line" ? (
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor()}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
