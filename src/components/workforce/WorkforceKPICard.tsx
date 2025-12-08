interface WorkforceKPICardProps {
  label: string;
  value: string | number | null;
  trend?: 'up' | 'down' | 'neutral';
  isNegative?: boolean;
}

export const WorkforceKPICard = ({ label, value, trend, isNegative }: WorkforceKPICardProps) => {
  const displayValue = value === null || value === undefined || value === '' ? '—' : value;
  
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-foreground';
    if (isNegative) {
      return trend === 'up' ? 'text-destructive' : 'text-emerald-600';
    }
    return trend === 'up' ? 'text-emerald-600' : 'text-destructive';
  };

  return (
    <div className="bg-card border border-border rounded-md p-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
        {label}
      </p>
      <p className={`text-lg font-semibold mt-0.5 ${getTrendColor()}`}>
        {displayValue}
      </p>
    </div>
  );
};
