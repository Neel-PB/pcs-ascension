import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { OpeningSkillGroup, ChecklistPositionToOpen } from '@/hooks/useForecastChecklist';

interface ForecastChecklistOpeningGroupProps {
  group: OpeningSkillGroup;
}

function PositionItem({ item }: { item: ChecklistPositionToOpen }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 text-xs">
      <span className="text-muted-foreground">
        {item.facilityName} • {item.departmentName} • {item.shift}
      </span>
      <span className="font-medium tabular-nums">{item.fte.toFixed(1)} FTE</span>
    </div>
  );
}

function EmploymentTypeSection({ 
  label, 
  items 
}: { 
  label: string; 
  items: ChecklistPositionToOpen[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="border-t border-border/50">
      <div className="px-3 py-1.5 bg-muted/30">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      {items.map((item) => (
        <PositionItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export function ForecastChecklistOpeningGroup({ group }: ForecastChecklistOpeningGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">{group.skillType}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {group.totalCount} {group.totalCount === 1 ? 'position' : 'positions'}
          </Badge>
          <span className="text-sm font-medium tabular-nums">{group.totalFTE.toFixed(1)} FTE</span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-muted/20"
          >
            <EmploymentTypeSection label="Full-Time" items={group.byEmploymentType['Full-Time']} />
            <EmploymentTypeSection label="Part-Time" items={group.byEmploymentType['Part-Time']} />
            <EmploymentTypeSection label="PRN" items={group.byEmploymentType['PRN']} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
