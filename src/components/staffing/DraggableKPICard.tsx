import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KPICard } from './KPICard';

interface DraggableKPICardProps {
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

export function DraggableKPICard({ id, ...props }: DraggableKPICardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KPICard {...props} />
    </div>
  );
}
