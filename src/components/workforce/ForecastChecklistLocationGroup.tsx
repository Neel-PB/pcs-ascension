import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FacilityLocationGroup } from '@/hooks/useForecastChecklist';
import { ForecastChecklistDeptSkillGroup } from './ForecastChecklistDeptSkillGroup';

interface ForecastChecklistLocationGroupProps {
  group: FacilityLocationGroup;
  type: 'shortage' | 'surplus';
}

export function ForecastChecklistLocationGroup({ group, type }: ForecastChecklistLocationGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fteColor = type === 'shortage' ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-[11px] font-medium truncate">
            {group.region} › {group.market} › {group.facilityName}
          </span>
        </div>
        <span className={`text-[11px] font-medium tabular-nums ${fteColor} ml-2 flex-shrink-0`}>
          {group.totalFTE.toFixed(1)} FTE
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden bg-muted/10"
          >
            {group.departmentGroups.map((deptGroup) => (
              <ForecastChecklistDeptSkillGroup 
                key={deptGroup.groupKey} 
                group={deptGroup} 
                type={type}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
