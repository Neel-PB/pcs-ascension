import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ClosureCombinedGroup } from '@/hooks/useForecastChecklist';
import { ForecastChecklistClosureRow } from './ForecastChecklistClosureRow';

interface ForecastChecklistClosureGroupProps {
  group: ClosureCombinedGroup;
}

export function ForecastChecklistClosureGroup({ group }: ForecastChecklistClosureGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSourceBadge = () => {
    if (group.source === 'open-reqs') {
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
          Open Reqs
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
        Employed
      </Badge>
    );
  };

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
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {group.employmentType}
          </Badge>
          {getSourceBadge()}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {group.totalCount} {group.totalCount === 1 ? 'position' : 'positions'}
          </Badge>
          <span className="text-sm font-medium tabular-nums text-red-600">{group.totalFTE.toFixed(1)} FTE</span>
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
            <div className="pl-4">
              {group.items.map((item) => (
                <ForecastChecklistClosureRow key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
