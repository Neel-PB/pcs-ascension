import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistPositionToOpen } from '@/hooks/useForecastChecklist';

interface ForecastChecklistOpeningRowProps {
  item: ChecklistPositionToOpen;
}

export function ForecastChecklistOpeningRow({ item }: ForecastChecklistOpeningRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEmploymentBadgeVariant = () => {
    switch (item.employmentType) {
      case 'Full-Time':
        return 'default';
      case 'Part-Time':
        return 'secondary';
      case 'PRN':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Header Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <Plus className="h-3 w-3 text-emerald-500 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{item.skillType}</span>
          <Badge variant={getEmploymentBadgeVariant()} className="text-[10px] px-1.5 py-0 h-4">
            {item.employmentType}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.count > 1 && (
            <span className="text-[10px] text-muted-foreground">×{item.count}</span>
          )}
          <span className="text-xs font-semibold text-emerald-600">{item.fte.toFixed(1)}</span>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-7 pb-2 space-y-1">
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">{item.facilityName}</span>
                <span className="mx-1">•</span>
                <span>{item.departmentName}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {item.shift} Shift
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
