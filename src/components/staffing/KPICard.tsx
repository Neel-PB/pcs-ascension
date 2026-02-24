import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, Eye, Info } from "@/lib/icons";
import { KPIChartModal } from "./KPIChartModal";
import { KPIInfoModal } from "./KPIInfoModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface EmploymentBreakdown {
  ft: number;  // percentage
  pt: number;  // percentage
  prn: number; // percentage
}

export interface KPICardProps {
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
  breakdownVariant?: 'green' | 'red' | 'orange';
  dataTour?: string;
  className?: string;
  dataTourChart?: string;
  dataTourInfo?: string;
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
  dataTour,
  className,
  dataTourChart,
  dataTourInfo,
}: KPICardProps) {
  const [showChartModal, setShowChartModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  const getTrendColor = () => {
    if (isNegative) return "text-orange-600";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="relative"
        data-tour={dataTour}
      >
        <Card
          className={cn(
            "hover:shadow-lg transition-all duration-300",
            isHighlighted && "border-emerald-500/50 bg-emerald-500/5",
            isNegative && "border-orange-500/50 bg-orange-500/5",
            className
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
                  data-tour={dataTourChart}
                >
                  <BarChart3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-1.5 rounded hover:bg-accent transition-colors"
                title="View details"
                data-tour={dataTourInfo}
              >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* Value and Trend Section */}
            <div className="space-y-0.5">
              {(() => {
                const isPlaceholder = typeof value === 'string' && !/\d/.test(value);
                return (
                  <div className={cn(
                    isPlaceholder
                      ? "text-sm text-muted-foreground font-medium"
                      : "text-2xl font-bold tracking-tight leading-none",
                    !isPlaceholder && isNegative && "text-orange-600",
                    !isPlaceholder && !isNegative && "text-foreground"
                  )}>
                    {value}
                  </div>
                );
              })()}
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

        {/* Employment Breakdown Section - Outside Card */}
        {employmentBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.25, 
              delay: delay + 0.3,
              ease: "easeOut"
            }}
            onClick={() => setShowBreakdownModal(true)}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs mt-2 mx-auto w-fit",
              "cursor-pointer transition-shadow duration-200 hover:shadow-md",
              breakdownVariant === 'green' && "bg-emerald-500/10 hover:shadow-emerald-300/40",
              breakdownVariant === 'red' && "bg-destructive/10 hover:shadow-destructive/30",
              breakdownVariant === 'orange' && "bg-orange-500/10 hover:shadow-orange-300/40"
            )}
          >
            <Info className={cn(
              "h-3 w-3 shrink-0",
              breakdownVariant === 'green' && "text-emerald-600",
              breakdownVariant === 'red' && "text-destructive",
              breakdownVariant === 'orange' && "text-orange-600"
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
                  breakdownVariant === 'red' && "text-destructive",
                  breakdownVariant === 'orange' && "text-orange-700"
                )}>
                  {sorted[0].value}% {sorted[0].label} · {sorted[1].value}% {sorted[1].label} · {sorted[2].value}% {sorted[2].label}
                </span>
              );
            })()}
          </motion.div>
        )}
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

      {/* Employment Breakdown Requirement Modal */}
      <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Employment Type Split Requirement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Target Split</h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 font-medium">70% FT</span>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 font-medium">20% PT</span>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 font-medium">10% PRN</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Rationale</h4>
              <p className="text-sm text-muted-foreground">
                The 70/20/10 staffing mix ensures workforce stability through full-time core staff, 
                provides scheduling flexibility via part-time coverage, and maintains PRN availability 
                for peak demand periods and unexpected absences.
              </p>
            </div>

            {employmentBreakdown && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Current Split</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded font-medium",
                    employmentBreakdown.ft >= 70 ? "bg-emerald-500/10 text-emerald-700" : "bg-orange-500/10 text-orange-600"
                  )}>
                    {employmentBreakdown.ft}% FT
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded font-medium",
                    employmentBreakdown.pt <= 20 ? "bg-emerald-500/10 text-emerald-700" : "bg-orange-500/10 text-orange-600"
                  )}>
                    {employmentBreakdown.pt}% PT
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded font-medium",
                    employmentBreakdown.prn <= 10 ? "bg-emerald-500/10 text-emerald-700" : "bg-orange-500/10 text-orange-600"
                  )}>
                    {employmentBreakdown.prn}% PRN
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Variance: {employmentBreakdown.ft - 70 >= 0 ? '+' : ''}{employmentBreakdown.ft - 70}% FT, 
                  {' '}{employmentBreakdown.pt - 20 >= 0 ? '+' : ''}{employmentBreakdown.pt - 20}% PT, 
                  {' '}{employmentBreakdown.prn - 10 >= 0 ? '+' : ''}{employmentBreakdown.prn - 10}% PRN
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
