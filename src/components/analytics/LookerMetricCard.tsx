import { LucideIcon, TrendingUp, TrendingDown } from "@/lib/icons";

interface LookerMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export const LookerMetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change,
  changeType = "positive"
}: LookerMetricCardProps) => {
  const changeColor = changeType === "positive" 
    ? "text-green-600 dark:text-green-400" 
    : changeType === "negative" 
    ? "text-red-600 dark:text-red-400" 
    : "text-muted-foreground";
    
  const ChangeIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : null;
  
  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
              {ChangeIcon && <ChangeIcon className="h-4 w-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
};
