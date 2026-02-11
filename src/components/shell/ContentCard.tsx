import { motion } from "framer-motion";
import { LucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ContentCard({
  title,
  icon: Icon,
  children,
  className,
  delay = 0,
}: ContentCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-gradient-card rounded-xl shadow-soft border border-shell-line/50",
        "overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={{ 
        scale: 1.01,
      }}
      style={{
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-6 border-b border-shell-line/50">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <h3 className="text-base font-semibold text-gradient">
          {title}
        </h3>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: LucideIcon;
  delay?: number;
}

export function StatsCard({ title, value, change, icon: Icon, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      className="bg-gradient-card rounded-xl p-6 shadow-soft border border-shell-line/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-shell-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  change.type === "increase" && "text-success",
                  change.type === "decrease" && "text-danger",
                  change.type === "neutral" && "text-muted-foreground"
                )}
              >
                {change.value}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
}