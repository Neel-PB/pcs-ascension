import { LucideIcon } from "@/lib/icons";

interface LookerChartPlaceholderProps {
  icon: LucideIcon;
  height?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const LookerChartPlaceholder = ({ 
  icon: Icon, 
  height = "h-64",
  gradientFrom = "from-blue-50 dark:from-blue-950/30",
  gradientTo = "to-purple-50 dark:to-purple-950/30"
}: LookerChartPlaceholderProps) => {
  return (
    <div className={`${height} bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center border border-border/50`}>
      <Icon className="h-16 w-16 text-muted-foreground/40" />
    </div>
  );
};
