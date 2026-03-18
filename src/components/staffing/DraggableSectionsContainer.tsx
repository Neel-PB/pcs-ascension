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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableKPISection } from './DraggableKPISection';

interface KPIData {
  id: string;
  title: string;
  value: string;
  chartData: any[];
  chartType: 'line' | 'bar' | 'area' | 'pie';
  delay: number;
  definition: string;
  calculation: string;
  isNegative?: boolean;
  isHighlighted?: boolean;
  useVacancyModal?: boolean;
  vacancyData?: any[];
}

interface SectionData {
  id: string;
  title: string;
  kpis: KPIData[];
}

interface DragHandleProps {
  attributes: any;
  listeners: any;
}

interface DraggableSectionsContainerProps {
  sections: SectionData[];
  sectionOrder: string[];
  onSectionReorder: (newOrder: string[]) => void;
}

function DraggableSection({ section }: { section: SectionData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tourAttr = section.id === 'fte' ? 'fte-section'
    : section.id === 'volume' ? 'volume-section'
    : section.id === 'productivity' ? 'productivity-section'
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative" data-tour={tourAttr}>
      <DraggableKPISection
        title={section.title}
        kpis={section.kpis}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

export function DraggableSectionsContainer({
  sections,
  sectionOrder,
  onSectionReorder,
}: DraggableSectionsContainerProps) {
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
      const oldIndex = sectionOrder.findIndex((id) => id === active.id);
      const newIndex = sectionOrder.findIndex((id) => id === over.id);
      
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      onSectionReorder(newOrder);
    }
  };

  // Sort sections based on sectionOrder
  const sortedSections = [...sections].sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.id);
    const bIndex = sectionOrder.indexOf(b.id);
    return aIndex - bIndex;
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-8" data-tour="kpi-sections">
          {sortedSections.map((section) => (
            <DraggableSection key={section.id} section={section} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
