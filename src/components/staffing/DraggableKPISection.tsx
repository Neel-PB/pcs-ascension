import { KPICard } from './KPICard';

interface KPIData {
  id: string;
  title: string;
  value: string;
  chartData: any[];
  chartType: 'line' | 'bar' | 'area';
  delay: number;
  definition: string;
  calculation: string;
  isNegative?: boolean;
  isHighlighted?: boolean;
  useVacancyModal?: boolean;
  vacancyData?: any[];
}

interface DragHandleProps {
  attributes: any;
  listeners: any;
}

interface DraggableKPISectionProps {
  title: string;
  kpis: KPIData[];
  dragHandleProps?: DragHandleProps;
}

export function DraggableKPISection({ title, kpis, dragHandleProps }: DraggableKPISectionProps) {
  return (
    <div className="space-y-4">
      <div className="relative group">
        {dragHandleProps && (
          <div
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder section"
          >
            <div className="w-1.5 h-6 bg-muted-foreground/40 rounded-full hover:bg-muted-foreground transition-colors" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>
    </div>
  );
}
