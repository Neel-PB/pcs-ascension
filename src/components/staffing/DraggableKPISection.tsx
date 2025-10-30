import { useState } from 'react';
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
  decimalPlaces?: number;
  breakdownData?: any[];
  xAxisLabels?: string[];
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
  const [currentKPIIndex, setCurrentKPIIndex] = useState(0);

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentKPIIndex((prevIndex) => {
      if (direction === 'prev') {
        return Math.max(0, prevIndex - 1);
      } else {
        return Math.min(kpis.length - 1, prevIndex + 1);
      }
    });
  };

  const currentKPI = kpis[currentKPIIndex];

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
        {kpis.map((kpi, index) => (
          <div key={kpi.id} onClick={() => setCurrentKPIIndex(index)}>
            <KPICard 
              {...(currentKPIIndex === index ? currentKPI : kpi)}
              currentIndex={currentKPIIndex}
              totalKPIs={kpis.length}
              onNavigate={handleNavigate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
