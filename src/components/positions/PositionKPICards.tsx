interface PositionKPIItem {
  label: string;
  value: string | number;
}

interface PositionKPICardsProps {
  items: PositionKPIItem[];
}

export function PositionKPICards({ items }: PositionKPICardsProps) {
  return (
      <div className="flex flex-wrap gap-3 flex-shrink-0">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card shadow-md px-4 h-11 flex flex-row items-center gap-2"
        >
          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {typeof item.value === 'number'
              ? item.value.toLocaleString(undefined, {
                  minimumFractionDigits: Number.isInteger(item.value) ? 0 : 1,
                  maximumFractionDigits: 1,
                })
              : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
