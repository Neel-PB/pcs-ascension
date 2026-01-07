import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ClosureSkillGroup, ChecklistPositionToClose } from '@/hooks/useForecastChecklist';

interface ForecastChecklistClosureGroupProps {
  group: ClosureSkillGroup;
}

function PositionItem({ item }: { item: ChecklistPositionToClose }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 text-xs">
      <span className="text-muted-foreground">
        {item.employmentType} • {item.facilityName} • {item.departmentName} • {item.shift}
      </span>
      <span className="font-medium tabular-nums">{item.fte.toFixed(1)} FTE</span>
    </div>
  );
}

function SourceSection({ 
  source, 
  items 
}: { 
  source: 'open-reqs' | 'employed'; 
  items: ChecklistPositionToClose[];
}) {
  if (items.length === 0) return null;

  const isOpenReqs = source === 'open-reqs';
  const label = isOpenReqs ? 'Open Reqs' : 'Employed';
  const bgClass = isOpenReqs ? 'bg-emerald-500/10' : 'bg-amber-500/10';
  const textClass = isOpenReqs ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400';

  return (
    <div className="border-t border-border/50">
      <div className={`px-3 py-1.5 ${bgClass}`}>
        <span className={`text-[10px] font-medium uppercase tracking-wide ${textClass}`}>
          {label}
        </span>
      </div>
      {items.map((item) => (
        <PositionItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export function ForecastChecklistClosureGroup({ group }: ForecastChecklistClosureGroupProps) {
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
            <SourceSection source="open-reqs" items={group.bySource['open-reqs']} />
            <SourceSection source="employed" items={group.bySource['employed']} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
