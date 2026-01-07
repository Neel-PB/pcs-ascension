import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistPositionToClose } from '@/hooks/useForecastChecklist';

interface ForecastChecklistClosureRowProps {
  item: ChecklistPositionToClose;
}

export function ForecastChecklistClosureRow({ item }: ForecastChecklistClosureRowProps) {
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

  const getSourceBadge = () => {
    if (item.source === 'open-reqs') {
      return (
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-emerald-50 text-emerald-700 border-emerald-200">
          Open Reqs
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-amber-50 text-amber-700 border-amber-200">
        Employed
      </Badge>
    );
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
          <span className="text-xs font-medium truncate">{item.skillType}</span>
          <Badge variant={getEmploymentBadgeVariant()} className="text-[10px] px-1.5 py-0 h-4">
            {item.employmentType}
          </Badge>
          {getSourceBadge()}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.count > 1 && (
            <span className="text-[10px] text-muted-foreground">×{item.count}</span>
          )}
          <span className="text-xs font-semibold text-red-600">{item.fte.toFixed(1)}</span>
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
              {item.source === 'open-reqs' && (
                <div className="text-[10px] text-emerald-600">
                  Can be closed by canceling open requisition
                </div>
              )}
              {item.source === 'employed' && (
                <div className="text-[10px] text-amber-600">
                  Requires employed position adjustment
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
