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
          className="rounded-lg border border-border bg-muted/30 px-3 py-2"
        >
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className="text-sm font-semibold text-foreground">
            {typeof item.value === 'number'
              ? item.value.toLocaleString(undefined, {
                  minimumFractionDigits: Number.isInteger(item.value) ? 0 : 1,
                  maximumFractionDigits: 1,
                })
              : item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
