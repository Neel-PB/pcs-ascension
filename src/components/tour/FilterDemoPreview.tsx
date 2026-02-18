import { Search } from '@/lib/icons';

interface SimpleItem {
  label: string;
  selected?: boolean;
}

interface SearchableItem {
  name: string;
  id: string;
}

interface FilterDemoPreviewProps {
  variant: 'simple' | 'searchable' | 'labels';
  items?: string[] | SearchableItem[];
  labels?: string[];
}

export function FilterDemoPreview({ variant, items = [], labels = [] }: FilterDemoPreviewProps) {
  if (variant === 'labels') {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1.5">
        {labels.map((label) => (
          <div key={label} className="flex items-center gap-2 text-xs text-foreground/70">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            {label}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'searchable') {
    const searchItems = items as SearchableItem[];
    return (
      <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
          <Search className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/60 italic">Search by name or ID…</span>
        </div>
        <div className="divide-y divide-border/40">
          {searchItems.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-3 py-1.5 text-xs ${i === 0 ? 'bg-primary/10' : ''}`}
            >
              <span className="text-foreground/80">{item.name}</span>
              <span className="text-muted-foreground/50 font-mono text-[10px]">{item.id}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // simple variant
  const simpleItems = items as string[];
  return (
    <div className="rounded-lg border border-border bg-muted/50 overflow-hidden divide-y divide-border/40">
      {simpleItems.map((item, i) => (
        <div
          key={item}
          className={`px-3 py-1.5 text-xs ${i === 0 ? 'bg-primary/10 text-foreground/90 font-medium' : 'text-foreground/70'}`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
