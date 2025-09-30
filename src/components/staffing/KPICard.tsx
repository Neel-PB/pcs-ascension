import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  icon: LucideIcon;
  isNegative?: boolean;
  isHighlighted?: boolean;
  delay?: number;
}

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  isNegative = false,
  isHighlighted = false,
  delay = 0,
}: KPICardProps) {
  const getTrendColor = () => {
    if (isNegative) return "text-destructive";
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "";
  };

  const getValueColor = () => {
    if (isNegative) return "text-destructive";
    return "text-foreground";
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
          "h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
          isHighlighted && "bg-emerald-500/10 border-emerald-500/30"
        )}
      >
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            {trend && (
              <div className="flex items-center gap-1">
                {trend === "up" ? (
                  <TrendingUp className={cn("h-5 w-5", getTrendColor())} />
                ) : (
                  <TrendingDown className={cn("h-5 w-5", getTrendColor())} />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground font-medium mb-2">
              {title}
            </p>
            <span className={cn("text-3xl font-bold tracking-tight", getValueColor())}>
              {value}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
