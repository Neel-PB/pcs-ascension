import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value?: string | number;
  trend?: "up" | "down";
  icon?: LucideIcon;
  comingSoon?: boolean;
  isNegative?: boolean;
  isHighlighted?: boolean;
  iconColor?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  comingSoon = false,
  isNegative = false,
  isHighlighted = false,
  iconColor,
  delay = 0,
}: KPICardProps) {
  const getTrendColor = () => {
    if (isNegative) return "text-destructive";
    if (trend === "up") return "text-green-500";
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
    >
      <Card
        className={cn(
          "hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
          isHighlighted && "bg-green-500/10 border-green-500/30"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {Icon && (
              <Icon
                className={cn("h-5 w-5", iconColor || "text-primary")}
              />
            )}
          </div>

          {comingSoon ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-muted-foreground/50">
                Coming Soon
              </span>
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <span className={cn("text-3xl font-bold", getValueColor())}>
                {value}
              </span>
              {trend && (
                <div className="flex items-center gap-1">
                  {trend === "up" ? (
                    <TrendingUp className={cn("h-4 w-4", getTrendColor())} />
                  ) : (
                    <TrendingDown className={cn("h-4 w-4", getTrendColor())} />
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
