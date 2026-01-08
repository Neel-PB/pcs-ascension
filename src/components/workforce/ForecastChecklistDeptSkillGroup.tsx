import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DepartmentSkillGroup } from '@/hooks/useForecastChecklist';
import { ForecastChecklistPositionDetail } from './ForecastChecklistPositionDetail';

interface ForecastChecklistDeptSkillGroupProps {
  group: DepartmentSkillGroup;
  type: 'shortage' | 'surplus';
}

export function ForecastChecklistDeptSkillGroup({ group, type }: ForecastChecklistDeptSkillGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fteColor = type === 'shortage' ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 pl-5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-[11px] truncate">
            {group.departmentName} • {group.skillType}
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
            className="overflow-hidden"
          >
            <div className="pl-8">
              {group.details.map((detail) => (
                <ForecastChecklistPositionDetail 
                  key={detail.id} 
                  detail={detail} 
                  type={type}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
