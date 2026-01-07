import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { OpeningFacilityGroup, OpeningSkillSubGroup } from '@/hooks/useForecastChecklist';
import { ForecastChecklistOpeningRow } from './ForecastChecklistOpeningRow';

interface ForecastChecklistOpeningGroupProps {
  group: OpeningFacilityGroup;
}

interface SkillTypeSubGroupProps {
  skillGroup: OpeningSkillSubGroup;
}

function SkillTypeSubGroup({ skillGroup }: SkillTypeSubGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 pl-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">{skillGroup.skillType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {skillGroup.totalCount}
          </Badge>
          <span className="text-xs font-medium tabular-nums text-emerald-600">{skillGroup.totalFTE.toFixed(1)} FTE</span>
        </div>
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
            <div className="pl-6">
              {skillGroup.items.map((item) => (
                <ForecastChecklistOpeningRow key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          <span className="font-medium text-sm">{group.facilityName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {group.totalCount} {group.totalCount === 1 ? 'position' : 'positions'}
          </Badge>
          <span className="text-sm font-medium tabular-nums text-emerald-600">{group.totalFTE.toFixed(1)} FTE</span>
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
            {group.skillGroups.map((skillGroup) => (
              <SkillTypeSubGroup key={skillGroup.skillType} skillGroup={skillGroup} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
