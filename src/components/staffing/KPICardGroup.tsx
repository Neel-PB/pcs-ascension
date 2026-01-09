import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, Eye, Info } from "lucide-react";
import { KPIChartModal } from "./KPIChartModal";
import { KPIInfoModal } from "./KPIInfoModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmploymentBreakdown } from "./KPICard";

interface GroupedKPICardProps {
  id: string;
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
}

interface KPICardGroupProps {
  cards: GroupedKPICardProps[];
  sharedBreakdown: EmploymentBreakdown;
  breakdownVariant: 'green' | 'red';
  groupDelay?: number;
}

function SingleCardInGroup({
  card,
  isFirst,
  isLast,
}: {
  card: GroupedKPICardProps;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [showChartModal, setShowChartModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getTrendColor = () => {
    if (card.isNegative) return "text-destructive";
    if (card.trend === "up") return "text-emerald-500";
    if (card.trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <>
      <Card
        className={cn(
          "hover:shadow-lg transition-all duration-300 flex-1",
          card.isHighlighted && "border-emerald-500/50 bg-emerald-500/5",
          card.isNegative && "border-destructive/50 bg-destructive/5",
          // Grouped styling - remove inner corners
          "rounded-b-none",
          isFirst && "rounded-tr-none",
          isLast && "rounded-tl-none",
          !isFirst && !isLast && "rounded-t-none"
        )}
      >
        <CardContent className="p-4 pr-10 relative">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
            {card.title}
          </h3>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            {card.chartData && card.chartData.length > 0 && (
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

          <div className="space-y-0.5">
            <div className={cn(
              "text-2xl font-bold tracking-tight leading-none",
              card.isNegative ? "text-destructive" : "text-foreground"
            )}>
              {card.value}
            </div>
            {card.trend && card.trendValue && (
              <div className="flex items-center">
                <span className={cn("text-xs font-semibold", getTrendColor())}>
                  {card.trend === "up" ? "↑" : "↓"} {card.trendValue}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <KPIChartModal
        open={showChartModal}
        onOpenChange={setShowChartModal}
        title={card.title}
        value={card.value}
        trend={card.trend}
        trendValue={card.trendValue}
        isNegative={card.isNegative}
        isHighlighted={card.isHighlighted}
        chartData={card.chartData}
        chartType={card.chartType}
        breakdownData={card.breakdownData}
        decimalPlaces={card.decimalPlaces}
        xAxisLabels={card.xAxisLabels}
      />

      <KPIInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        title={card.title}
        value={card.value}
        trend={card.trend}
        trendValue={card.trendValue}
        isNegative={card.isNegative}
        definition={card.definition || ""}
        calculation={card.calculation || ""}
      />
    </>
  );
}

export function KPICardGroup({
  cards,
  sharedBreakdown,
  breakdownVariant,
  groupDelay = 0,
}: KPICardGroupProps) {
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: groupDelay }}
        className="relative col-span-2"
      >
        {/* Container that groups the cards visually */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          {/* Cards side-by-side */}
          <div className="flex gap-px bg-border/30">
            {cards.map((card, index) => (
              <SingleCardInGroup
                key={card.id}
                card={card}
                isFirst={index === 0}
                isLast={index === cards.length - 1}
              />
            ))}
          </div>

          {/* Shared Breakdown Bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.25, 
              delay: groupDelay + 0.3,
              ease: "easeOut"
            }}
            onClick={() => setShowBreakdownModal(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs",
              "cursor-pointer transition-shadow duration-200 hover:shadow-md",
              breakdownVariant === 'green' && "bg-emerald-500/10 hover:shadow-emerald-300/40",
              breakdownVariant === 'red' && "bg-destructive/10 hover:shadow-destructive/30"
            )}
          >
            <Info className={cn(
              "h-3 w-3 shrink-0",
              breakdownVariant === 'green' && "text-emerald-600",
              breakdownVariant === 'red' && "text-destructive"
            )} />
            {(() => {
              const sorted = [
                { label: 'FT', value: sharedBreakdown.ft },
                { label: 'PT', value: sharedBreakdown.pt },
                { label: 'PRN', value: sharedBreakdown.prn },
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
        </div>
      </motion.div>

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

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Current Split (Hired + Open Reqs)</h4>
              <div className="flex items-center gap-4 text-sm">
                <span className={cn(
                  "px-2 py-1 rounded font-medium",
                  sharedBreakdown.ft >= 70 ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"
                )}>
                  {sharedBreakdown.ft}% FT
                </span>
                <span className={cn(
                  "px-2 py-1 rounded font-medium",
                  sharedBreakdown.pt <= 20 ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"
                )}>
                  {sharedBreakdown.pt}% PT
                </span>
                <span className={cn(
                  "px-2 py-1 rounded font-medium",
                  sharedBreakdown.prn <= 10 ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"
                )}>
                  {sharedBreakdown.prn}% PRN
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Variance: {sharedBreakdown.ft - 70 >= 0 ? '+' : ''}{sharedBreakdown.ft - 70}% FT, 
                {' '}{sharedBreakdown.pt - 20 >= 0 ? '+' : ''}{sharedBreakdown.pt - 20}% PT, 
                {' '}{sharedBreakdown.prn - 10 >= 0 ? '+' : ''}{sharedBreakdown.prn - 10}% PRN
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
