import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, Eye, Info } from "lucide-react";
import { KPIChartModal } from "./KPIChartModal";
import { KPIInfoModal } from "./KPIInfoModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EmploymentBreakdown {
  ft: number;  // percentage
  pt: number;  // percentage
  prn: number; // percentage
}

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
  breakdownData?: Array<any>;
  decimalPlaces?: number;
  xAxisLabels?: string[];
  employmentBreakdown?: EmploymentBreakdown;
  breakdownVariant?: 'green' | 'red';
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
  breakdownData,
  decimalPlaces = 1,
  xAxisLabels,
  employmentBreakdown,
  breakdownVariant,
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
        className="relative"
      >
        <Card
          className={cn(
            "hover:shadow-lg transition-all duration-300",
            isHighlighted && "border-emerald-500/50 bg-emerald-500/5",
            isNegative && "border-destructive/50 bg-destructive/5"
          )}
        >
          <CardContent className="p-4 pr-10 relative">
            {/* Title */}
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
              {title}
            </h3>

            {/* Action Icons - Vertically Centered */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
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
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* Value and Trend Section */}
            <div className="space-y-0.5">
              <div className={cn(
                "text-2xl font-bold tracking-tight leading-none",
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

            {/* Employment Breakdown - Inside Card */}
            {employmentBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.25, 
                  delay: delay + 0.3,
                  ease: "easeOut"
                }}
                className={cn(
                  "flex items-center gap-2 mt-2 -ml-4 -mr-10 -mb-4 px-3 py-1.5 rounded-b-lg text-xs",
                  breakdownVariant === 'green' && "bg-emerald-500/10",
                  breakdownVariant === 'red' && "bg-destructive/10"
                )}
              >
                <Info className={cn(
                  "h-3 w-3 shrink-0",
                  breakdownVariant === 'green' && "text-emerald-600",
                  breakdownVariant === 'red' && "text-destructive"
                )} />
                {(() => {
                  const sorted = [
                    { label: 'FT', value: employmentBreakdown.ft },
                    { label: 'PT', value: employmentBreakdown.pt },
                    { label: 'PRN', value: employmentBreakdown.prn },
                  ].sort((a, b) => b.value - a.value);
                  
                  return (
                    <span className={cn(
                      "font-medium",
                      breakdownVariant === 'green' && "text-emerald-700",
                      breakdownVariant === 'red' && "text-destructive"
                    )}>
                      {sorted[0].value}% {sorted[0].label} · {sorted[1].value}% {sorted[1].label} · {sorted[2].value}% {sorted[2].label}
                    </span>
                  );
                })()}
              </motion.div>
            )}
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
        breakdownData={breakdownData}
        decimalPlaces={decimalPlaces}
        xAxisLabels={xAxisLabels}
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
