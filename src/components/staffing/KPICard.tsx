import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, Info } from "lucide-react";
import { KPIChartModal } from "./KPIChartModal";
import { KPIInfoModal } from "./KPIInfoModal";

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
  definition?: string;
  calculation?: string;
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
  definition = "",
  calculation = "",
}: KPICardProps) {
  const [showChartModal, setShowChartModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getTrendColor = () => {
    if (isNegative) return "text-destructive";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <>
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
          <CardContent className="p-4">
            {/* Header with Action Icons */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex-1">
                {title}
              </h3>
              <div className="flex flex-col gap-1 ml-2 border-l border-border pl-2">
                {chartData && chartData.length > 0 && (
                  <button
                    onClick={() => setShowChartModal(true)}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    title="View detailed chart"
                  >
                    <BarChart3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-1.5 rounded hover:bg-accent transition-colors"
                  title="View details"
                >
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Value and Trend Section */}
            <div className="space-y-1">
              <div className={cn(
                "text-2xl font-bold tracking-tight",
                isNegative ? "text-destructive" : "text-foreground"
              )}>
                {value}
              </div>
              {trend && trendValue && (
                <div className="flex items-center">
                  <span className={cn("text-xs font-semibold", getTrendColor())}>
                    {trend === "up" ? "↑" : "↓"} {trendValue}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart Modal */}
      <KPIChartModal
        open={showChartModal}
        onOpenChange={setShowChartModal}
        title={title}
        value={value}
        trend={trend}
        trendValue={trendValue}
        isNegative={isNegative}
        isHighlighted={isHighlighted}
        chartData={chartData}
        chartType={chartType}
      />

      {/* Info Modal */}
      <KPIInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        title={title}
        value={value}
        trend={trend}
        trendValue={trendValue}
        isNegative={isNegative}
        definition={definition}
        calculation={calculation}
      />
    </>
  );
}
