import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableKPICard } from './DraggableKPICard';

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

interface DraggableKPISectionProps {
  title: string;
  kpis: KPIData[];
  onReorder: (newOrder: string[]) => void;
}

export function DraggableKPISection({ title, kpis, onReorder }: DraggableKPISectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
      const newIndex = kpis.findIndex((kpi) => kpi.id === over.id);
      
      const newKpis = arrayMove(kpis, oldIndex, newIndex);
      onReorder(newKpis.map((kpi) => kpi.id));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={kpis.map((kpi) => kpi.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <DraggableKPICard key={kpi.id} {...kpi} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
