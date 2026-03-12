import { useState, useMemo, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
// nursing status is now derived from API data, not Supabase DB
import { useSkillShift, type SkillShiftRecord } from "@/hooks/useSkillShift";
import { Download, Maximize2, ChevronRight } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VarianceData {
  skill: string;
  targetDay: number;
  targetNight: number;
  targetTotal: number;
  hiredDay: number;
  hiredNight: number;
  hiredTotal: number;
  reqsDay: number;
  reqsNight: number;
  reqsTotal: number;
  varianceDay: number;
  varianceNight: number;
  varianceTotal: number;
}

interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
  defaultExpanded?: boolean;
}

interface GroupedVarianceData {
  type: 'group' | 'skill' | 'total';
  id: string;
  name: string;
  data: VarianceData;
  children?: VarianceData[];
  isExpanded?: boolean;
}

// Build skill groups dynamically from API data based on broader_skill_mix_category
function buildSkillGroups(records: SkillShiftRecord[]): SkillGroup[] {
  const categoryMap = new Map<string, Set<string>>();
  records.forEach(r => {
    const cat = r.broader_skill_mix_category || 'Other';
    if (!categoryMap.has(cat)) categoryMap.set(cat, new Set());
    categoryMap.get(cat)!.add(r.skill_mix);
  });
  return Array.from(categoryMap.entries()).map(([cat, skills]) => ({
    id: cat.toLowerCase().replace(/\s+/g, '_'),
    name: cat,
    skills: Array.from(skills),
    defaultExpanded: false,
  }));
}

// Map API records to VarianceData for a given view mode
function mapRecordsToVariance(records: SkillShiftRecord[], mode: 'planned' | 'active'): VarianceData[] {
  // Aggregate by skill_mix (in case multiple records per skill)
  const skillMap = new Map<string, VarianceData>();
  records.forEach(r => {
    const existing = skillMap.get(r.skill_mix);
    const hDay = mode === 'active' ? Number(r.active_day_fte ?? 0) : Number(r.hired_day_fte ?? 0);
    const hNight = mode === 'active' ? Number(r.active_night_fte ?? 0) : Number(r.hired_night_fte ?? 0);
    const hTotal = mode === 'active' ? Number(r.active_total_fte ?? 0) : Number(r.hired_total_fte ?? 0);
    const tDay = Number(r.target_fte_day ?? 0);
    const tNight = Number(r.target_fte_night ?? 0);
    const tTotal = Number(r.target_fte_total ?? 0);
    const rDay = Number(r.open_reqs_day_fte ?? 0);
    const rNight = Number(r.open_reqs_night_fte ?? 0);
    const rTotal = Number(r.open_reqs_total_fte ?? 0);

    if (existing) {
      existing.targetDay += tDay;
      existing.targetNight += tNight;
      existing.targetTotal += tTotal;
      existing.hiredDay += hDay;
      existing.hiredNight += hNight;
      existing.hiredTotal += hTotal;
      existing.reqsDay += rDay;
      existing.reqsNight += rNight;
      existing.reqsTotal += rTotal;
      existing.varianceDay = existing.targetDay - existing.hiredDay - existing.reqsDay;
      existing.varianceNight = existing.targetNight - existing.hiredNight - existing.reqsNight;
      existing.varianceTotal = existing.targetTotal - existing.hiredTotal - existing.reqsTotal;
    } else {
      skillMap.set(r.skill_mix, {
        skill: r.skill_mix,
        targetDay: tDay,
        targetNight: tNight,
        targetTotal: tTotal,
        hiredDay: hDay,
        hiredNight: hNight,
        hiredTotal: hTotal,
        reqsDay: rDay,
        reqsNight: rNight,
        reqsTotal: rTotal,
        varianceDay: tDay - hDay - rDay,
        varianceNight: tNight - hNight - rNight,
        varianceTotal: tTotal - hTotal - rTotal,
      });
    }
  });
  return Array.from(skillMap.values());
}

const getVarianceColor = (value: number) => {
  if (value < 0) return "text-orange-600 font-semibold";
  return "text-foreground font-semibold";
};

const computeGroupTotals = (skills: VarianceData[]): VarianceData => {
  return skills.reduce((acc, skill) => ({
    skill: '',
    targetDay: acc.targetDay + skill.targetDay,
    targetNight: acc.targetNight + skill.targetNight,
    targetTotal: acc.targetTotal + skill.targetTotal,
    hiredDay: acc.hiredDay + skill.hiredDay,
    hiredNight: acc.hiredNight + skill.hiredNight,
    hiredTotal: acc.hiredTotal + skill.hiredTotal,
    reqsDay: acc.reqsDay + skill.reqsDay,
    reqsNight: acc.reqsNight + skill.reqsNight,
    reqsTotal: acc.reqsTotal + skill.reqsTotal,
    varianceDay: acc.varianceDay + skill.varianceDay,
    varianceNight: acc.varianceNight + skill.varianceNight,
    varianceTotal: acc.varianceTotal + skill.varianceTotal,
  }), {
    skill: '',
    targetDay: 0, targetNight: 0, targetTotal: 0,
    hiredDay: 0, hiredNight: 0, hiredTotal: 0,
    reqsDay: 0, reqsNight: 0, reqsTotal: 0,
    varianceDay: 0, varianceNight: 0, varianceTotal: 0,
  });
};

const organizeDataIntoGroups = (
  data: VarianceData[], 
  groups: SkillGroup[], 
  expandedGroups: Set<string>
): GroupedVarianceData[] => {
  const result: GroupedVarianceData[] = [];
  const skillMap = new Map(data.map(d => [d.skill, d]));
  
  groups.forEach(group => {
    const groupSkills = group.skills
      .map(skillName => skillMap.get(skillName))
      .filter(Boolean) as VarianceData[];
    
    if (groupSkills.length === 0) return;
    
    const groupTotal = computeGroupTotals(groupSkills);
    const isExpanded = expandedGroups.has(group.id);
    
    result.push({
      type: 'group',
      id: group.id,
      name: group.name,
      data: groupTotal,
      children: groupSkills,
      isExpanded
    });
    
    if (isExpanded) {
      groupSkills.forEach(skill => {
        result.push({
          type: 'skill',
          id: skill.skill,
          name: skill.skill,
          data: skill
        });
      });
    }
  });
  
  const totalRow = data.find(d => d.skill === 'TOTAL');
  if (totalRow) {
    result.push({
      type: 'total',
      id: 'total',
      name: 'TOTAL',
      data: totalRow
    });
  }
  
  return result;
};

const GroupRow = ({ 
  group, 
  onToggle,
  staffCategory = 'nursing'
}: { 
  group: GroupedVarianceData; 
  onToggle?: (id: string) => void;
  staffCategory?: 'nursing' | 'non-nursing';
}) => {
  const { isExpanded, data, id, name, children } = group;
  
  return (
    <TableRow 
      className="font-semibold !bg-primary/10 hover:!bg-primary/15 transition-colors cursor-pointer border-t-2 border-primary/20"
      onClick={() => onToggle?.(id)}
    >
      <TableCell className="font-semibold whitespace-nowrap w-48 min-w-48 max-w-48">
        <div className="flex items-center gap-2">
          <motion.div
            initial={false}
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-foreground">{name}</span>
        </div>
      </TableCell>
      {/* Target FTEs - only for Nursing */}
      {staffCategory === 'nursing' && (
        <>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16">{data.targetDay?.toFixed(1) || "0.0"}</TableCell>
          <TableCell className="text-center font-semibold w-16 min-w-16">{data.targetNight?.toFixed(1) || "0.0"}</TableCell>
          <TableCell className="text-center font-semibold w-16 min-w-16">{data.targetTotal?.toFixed(1) || "0.0"}</TableCell>
        </>
      )}
      {/* Hired FTEs - always shown */}
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16">{data.hiredDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.hiredNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.hiredTotal?.toFixed(1) || "0.0"}</TableCell>
      {/* Open Reqs - always shown */}
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16">{data.reqsDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.reqsNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.reqsTotal?.toFixed(1) || "0.0"}</TableCell>
      {/* Variance - only for Nursing */}
      {staffCategory === 'nursing' && (
        <>
          <TableCell className={cn("text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16", getVarianceColor(data.varianceDay))}>
            {data.varianceDay?.toFixed(1) || "0.0"}
          </TableCell>
          <TableCell className={cn("text-center font-semibold w-16 min-w-16", getVarianceColor(data.varianceNight))}>
            {data.varianceNight?.toFixed(1) || "0.0"}
          </TableCell>
          <TableCell className={cn("text-center font-semibold w-16 min-w-16", getVarianceColor(data.varianceTotal))}>
            {data.varianceTotal?.toFixed(1) || "0.0"}
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

const SkillRow = ({
  skill, 
  isChildRow,
  staffCategory = 'nursing'
}: { 
  skill: VarianceData; 
  isChildRow?: boolean;
  staffCategory?: 'nursing' | 'non-nursing';
}) => {
  return (
    <TableRow 
      className="!bg-background hover:bg-muted/30 transition-colors"
    >
      <TableCell className={cn(
        "font-medium whitespace-nowrap w-48 min-w-48 max-w-48",
        isChildRow && "pl-8"
      )}>
        {skill.skill}
      </TableCell>
      {/* Target FTEs - only for Nursing */}
      {staffCategory === 'nursing' && (
        <>
          <TableCell className="text-center border-l-2 border-muted-foreground/30 w-16 min-w-16">{skill.targetDay?.toFixed(1) || "0.0"}</TableCell>
          <TableCell className="text-center w-16 min-w-16">{skill.targetNight?.toFixed(1) || "0.0"}</TableCell>
          <TableCell className="text-center w-16 min-w-16">{skill.targetTotal?.toFixed(1) || "0.0"}</TableCell>
        </>
      )}
      {/* Hired FTEs - always shown */}
      <TableCell className="text-center border-l-2 border-muted-foreground/30 w-16 min-w-16">{skill.hiredDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center w-16 min-w-16">{skill.hiredNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center w-16 min-w-16">{skill.hiredTotal?.toFixed(1) || "0.0"}</TableCell>
      {/* Open Reqs - always shown */}
      <TableCell className="text-center border-l-2 border-muted-foreground/30 w-16 min-w-16">{skill.reqsDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center w-16 min-w-16">{skill.reqsNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center w-16 min-w-16">{skill.reqsTotal?.toFixed(1) || "0.0"}</TableCell>
      {/* Variance - only for Nursing */}
      {staffCategory === 'nursing' && (
        <>
          <TableCell className={cn("text-center border-l-2 border-muted-foreground/30 w-16 min-w-16", getVarianceColor(skill.varianceDay))}>
            {skill.varianceDay?.toFixed(1) || "0.0"}
          </TableCell>
          <TableCell className={cn("text-center w-16 min-w-16", getVarianceColor(skill.varianceNight))}>
            {skill.varianceNight?.toFixed(1) || "0.0"}
          </TableCell>
          <TableCell className={cn("text-center w-16 min-w-16", getVarianceColor(skill.varianceTotal))}>
            {skill.varianceTotal?.toFixed(1) || "0.0"}
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

const TotalRow = ({ 
  data,
  staffCategory = 'nursing'
}: { 
  data: VarianceData;
  staffCategory?: 'nursing' | 'non-nursing';
}) => {
  return (
    <TableRow className="font-semibold bg-muted/50 border-t-2">
      <TableCell className="font-semibold whitespace-nowrap w-48 min-w-48 max-w-48">{data.skill}</TableCell>
      {/* Target FTEs - only for Nursing */}
      {staffCategory === 'nursing' && (
        <>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16">{data.targetDay?.toFixed(1) || "0.0"}</TableCell>
          <TableCell className="text-center font-semibold w-16 min-w-16">{data.targetNight?.toFixed(1) || "0.0"}</TableCell>
          <TableCell className="text-center font-semibold w-16 min-w-16">{data.targetTotal?.toFixed(1) || "0.0"}</TableCell>
        </>
      )}
      {/* Hired FTEs - always shown */}
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16">{data.hiredDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.hiredNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.hiredTotal?.toFixed(1) || "0.0"}</TableCell>
      {/* Open Reqs - always shown */}
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16">{data.reqsDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.reqsNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold w-16 min-w-16">{data.reqsTotal?.toFixed(1) || "0.0"}</TableCell>
      {/* Variance - only for Nursing */}
      {staffCategory === 'nursing' && (
        <>
          <TableCell className={cn("text-center font-semibold border-l-2 border-muted-foreground/30 w-16 min-w-16", getVarianceColor(data.varianceDay))}>
            {data.varianceDay?.toFixed(1) || "0.0"}
          </TableCell>
          <TableCell className={cn("text-center font-semibold w-16 min-w-16", getVarianceColor(data.varianceNight))}>
            {data.varianceNight?.toFixed(1) || "0.0"}
          </TableCell>
          <TableCell className={cn("text-center font-semibold w-16 min-w-16", getVarianceColor(data.varianceTotal))}>
            {data.varianceTotal?.toFixed(1) || "0.0"}
          </TableCell>
        </>
      )}
    </TableRow>
  );
};


interface FTESkillShiftTableProps {
  data: VarianceData[];
  expandedGroups?: Set<string>;
  onToggleGroup?: (groupId: string) => void;
  skillGroups?: SkillGroup[];
  viewMode?: 'planned' | 'active';
  staffCategory?: 'nursing' | 'non-nursing';
}

const FTESkillShiftTable = ({ 
  data, 
  expandedGroups, 
  onToggleGroup,
  skillGroups: groups,
  viewMode = 'planned',
  staffCategory = 'nursing'
}: FTESkillShiftTableProps) => {
  const displayData = groups && expandedGroups
    ? organizeDataIntoGroups(data, groups, expandedGroups)
    : data.map(d => ({ type: 'skill' as const, id: d.skill, name: d.skill, data: d }));
  
  return (
    <div className="overflow-auto flex-1 min-h-0 [&>div]:overflow-visible">
      <Table className="table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="font-semibold text-foreground w-48 min-w-48 max-w-48">Skills</TableHead>
            {/* Target FTEs - only for Nursing */}
            {staffCategory === 'nursing' && (
              <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30 border-l-2 border-muted-foreground/30">
                Target FTEs
              </TableHead>
            )}
            <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30 border-l-2 border-muted-foreground/30">
              {viewMode === 'active' ? 'Active FTEs' : 'Hired FTEs'}
            </TableHead>
            <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30 border-l-2 border-muted-foreground/30">
              Open Req FTEs
            </TableHead>
            {/* Variance - only for Nursing */}
            {staffCategory === 'nursing' && (
              <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30 border-l-2 border-muted-foreground/30">
                Variance
              </TableHead>
            )}
          </TableRow>
          <TableRow>
            <TableHead className="w-48 min-w-48 max-w-48"></TableHead>
            {/* Target FTEs sub-headers - only for Nursing */}
            {staffCategory === 'nursing' && (
              <>
                <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30 w-16 min-w-16">Day</TableHead>
                <TableHead className="text-center text-xs w-16 min-w-16">Night</TableHead>
                <TableHead className="text-center text-xs w-16 min-w-16">Total</TableHead>
              </>
            )}
            {/* Hired FTEs */}
            <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30 w-16 min-w-16">Day</TableHead>
            <TableHead className="text-center text-xs w-16 min-w-16">Night</TableHead>
            <TableHead className="text-center text-xs w-16 min-w-16">Total</TableHead>
            {/* Reqs */}
            <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30 w-16 min-w-16">Day</TableHead>
            <TableHead className="text-center text-xs w-16 min-w-16">Night</TableHead>
            <TableHead className="text-center text-xs w-16 min-w-16">Total</TableHead>
            {/* Variance sub-headers - only for Nursing */}
            {staffCategory === 'nursing' && (
              <>
                <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30 w-16 min-w-16">Day</TableHead>
                <TableHead className="text-center text-xs w-16 min-w-16">Night</TableHead>
                <TableHead className="text-center text-xs w-16 min-w-16">Total</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((row) => {
            if (row.type === 'group') {
              return (
                <GroupRow
                  key={row.id}
                  group={row}
                  onToggle={onToggleGroup}
                  staffCategory={staffCategory}
                />
              );
            }
            
            if (row.type === 'skill') {
              return (
                <SkillRow
                  key={row.id}
                  skill={row.data}
                  isChildRow={groups && expandedGroups ? true : false}
                  staffCategory={staffCategory}
                />
              );
            }
            
            if (row.type === 'total') {
              return (
                <TotalRow
                  key={row.id}
                  data={row.data}
                  staffCategory={staffCategory}
                />
              );
            }
            
            return null;
          })}
        </TableBody>
      </Table>
    </div>
  );
};

interface PositionPlanningProps {
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedDepartment?: string;
  selectedSubmarket?: string;
  selectedLevel2?: string;
  selectedPstat?: string;
}

export default function PositionPlanning({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
  selectedSubmarket,
  selectedLevel2,
  selectedPstat,
}: PositionPlanningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'planned' | 'active'>('planned');
  const [staffCategory, setStaffCategory] = useState<'nursing' | 'non-nursing'>('nursing');
   
   // Determine if a specific department is selected (not "all-departments")
   const isDepartmentSelected = selectedDepartment && selectedDepartment !== 'all-departments';
   
   // Track whether we need to auto-detect nursing status from API data
   const [autoDetected, setAutoDetected] = useState(false);
   
   // Reset auto-detected when department changes
   useEffect(() => {
     setAutoDetected(false);
   }, [selectedDepartment, selectedFacility]);
   
   // When department is selected, fetch without nursingFlag filter so we can
   // derive the category from the API data's nursing_flag field (source of truth)
   const nursingFlag = isDepartmentSelected ? undefined : (staffCategory === 'nursing' ? 'Y' : 'N');
   
   const { data: skillShiftData, isLoading: skillShiftLoading } = useSkillShift({
     region: selectedRegion,
     market: selectedMarket,
     facility: selectedFacility,
     department: selectedDepartment,
     submarket: selectedSubmarket,
     level2: selectedLevel2,
     pstat: selectedPstat,
     nursingFlag,
   });
   
    // Auto-detect nursing status from API data when a department is selected (case-insensitive)
    useEffect(() => {
      if (isDepartmentSelected && skillShiftData && skillShiftData.length > 0 && !autoDetected) {
        const hasNursing = skillShiftData.some(r => r.nursing_flag === true || r.nursing_flag === 'Y');
        const hasNonNursing = skillShiftData.some(r => r.nursing_flag === false || r.nursing_flag === 'N');
        if (hasNonNursing && !hasNursing) {
          setStaffCategory('non-nursing');
        } else if (hasNursing && !hasNonNursing) {
          setStaffCategory('nursing');
        } else {
          setStaffCategory('nursing');
        }
        setAutoDetected(true);
      }
    }, [isDepartmentSelected, skillShiftData, autoDetected]);

  // Filter skill-shift data by detected category when department is selected
  const filteredSkillShiftData = useMemo(() => {
    if (!skillShiftData?.length) return [];
    if (!isDepartmentSelected) return skillShiftData;
    const isNursing = staffCategory === 'nursing';
    return skillShiftData.filter(r => {
      if (typeof r.nursing_flag === 'boolean') return r.nursing_flag === isNursing;
      return (r.nursing_flag === 'Y') === isNursing;
    });
  }, [skillShiftData, isDepartmentSelected, staffCategory]);

  // Build dynamic skill groups from filtered API data
  const dynamicSkillGroups = useMemo(() => {
    if (!filteredSkillShiftData?.length) return [];
    return buildSkillGroups(filteredSkillShiftData);
  }, [filteredSkillShiftData]);

  // Map filtered API data to VarianceData based on view mode
  const displayVarianceData = useMemo(() => {
    if (!filteredSkillShiftData?.length) return [];
    const mapped = mapRecordsToVariance(filteredSkillShiftData, viewMode);
    const total = computeGroupTotals(mapped);
    return [...mapped, { ...total, skill: 'TOTAL' }];
  }, [filteredSkillShiftData, viewMode]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const downloadCSV = () => {
    const hiredLabel = viewMode === 'active' ? 'Active' : 'Hired';
    const headers = [
      'Group', 'Skill',
      'Target Day', 'Target Night', 'Target Total',
      `${hiredLabel} Day`, `${hiredLabel} Night`, `${hiredLabel} Total`,
      'Reqs Day', 'Reqs Night', 'Reqs Total',
      'Variance Day', 'Variance Night', 'Variance Total'
    ];
    
    const rows: any[] = [];
    
    dynamicSkillGroups.forEach(group => {
      const groupSkills = group.skills
        .map(skillName => displayVarianceData.find(d => d.skill === skillName))
        .filter(Boolean) as VarianceData[];
      
      if (groupSkills.length === 0) return;
      
      const groupTotal = computeGroupTotals(groupSkills);
      
      rows.push([
        group.name, 
        `${group.name} (Total)`,
        groupTotal.targetDay, groupTotal.targetNight, groupTotal.targetTotal,
        groupTotal.hiredDay, groupTotal.hiredNight, groupTotal.hiredTotal,
        groupTotal.reqsDay, groupTotal.reqsNight, groupTotal.reqsTotal,
        groupTotal.varianceDay, groupTotal.varianceNight, groupTotal.varianceTotal
      ]);
      
      groupSkills.forEach(skill => {
        rows.push([
          group.name,
          skill.skill,
          skill.targetDay, skill.targetNight, skill.targetTotal,
          skill.hiredDay, skill.hiredNight, skill.hiredTotal,
          skill.reqsDay, skill.reqsNight, skill.reqsTotal,
          skill.varianceDay, skill.varianceNight, skill.varianceTotal
        ]);
      });
    });
    
    const totalRow = displayVarianceData.find(d => d.skill === 'TOTAL');
    if (totalRow) {
      rows.push([
        'GRAND TOTAL',
        totalRow.skill,
        totalRow.targetDay, totalRow.targetNight, totalRow.targetTotal,
        totalRow.hiredDay, totalRow.hiredNight, totalRow.hiredTotal,
        totalRow.reqsDay, totalRow.reqsNight, totalRow.reqsTotal,
        totalRow.varianceDay, totalRow.varianceNight, totalRow.varianceTotal
      ]);
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FTE_Skill_Shift_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={300}>
    <div className="flex flex-col gap-4 h-full">
      {/* Header with Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.h1
            data-tour="planning-header"
            className="text-2xl font-semibold text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            FTE Skill Shift Analysis
          </motion.h1>

          {/* Toggle for Hired/Actual */}
          <motion.div
            data-tour="planning-hired-toggle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="inline-flex items-center justify-center rounded-full border-2 border-primary p-1">
              <LayoutGroup>
                <div className="flex gap-0.5">
                  {/* Hired button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode('planned')}
                        className="relative inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none"
                      >
                        {viewMode === 'planned' && (
                          <motion.div
                            layoutId="viewModeIndicator"
                            className="absolute inset-0 bg-primary rounded-full"
                            initial={false}
                            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                          />
                        )}
                        <span className={cn(
                          "relative z-10 transition-colors",
                          viewMode === 'planned' ? "text-primary-foreground" : "text-foreground hover:bg-muted/50"
                        )}>
                          Hired
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        <span className="font-semibold">Hired FTE:</span> Shows all hired employees,
                        including those on leave or inactive status
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Actual button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode('active')}
                        className="relative inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none"
                      >
                        {viewMode === 'active' && (
                          <motion.div
                            layoutId="viewModeIndicator"
                            className="absolute inset-0 bg-primary rounded-full"
                            initial={false}
                            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                          />
                        )}
                        <span className={cn(
                          "relative z-10 transition-colors",
                          viewMode === 'active' ? "text-primary-foreground" : "text-foreground hover:bg-muted/50"
                        )}>
                          Active
                        </span>
                      </button>
                    </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">
                              <span className="font-semibold">Active FTE:</span> Total FT, PT, PRN adjusted by the Dept leader based on their current availability. Eg, LOA, Training, education.
                            </p>
                          </TooltipContent>
                  </Tooltip>
                </div>
              </LayoutGroup>
            </div>
          </motion.div>

          {/* Nursing/Non-Nursing Toggle - Hidden when specific department is selected */}
          {!isDepartmentSelected && (
            <motion.div
              data-tour="planning-nursing-toggle"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center rounded-full border-2 border-primary p-1">
                <LayoutGroup>
                  <div className="flex gap-0.5">
                    {/* Nursing button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setStaffCategory('nursing')}
                          className="relative inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none"
                        >
                          {staffCategory === 'nursing' && (
                            <motion.div
                              layoutId="categoryIndicator"
                              className="absolute inset-0 bg-primary rounded-full"
                              initial={false}
                              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                            />
                          )}
                          <span className={cn(
                            "relative z-10 transition-colors",
                            staffCategory === 'nursing' ? "text-primary-foreground" : "text-foreground"
                          )}>
                            Nursing
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          <span className="font-semibold">Nursing:</span> Clinical departments with Target FTEs, Hired, Open Reqs, and Variance analysis
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Non-Nursing button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setStaffCategory('non-nursing')}
                          className="relative inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none"
                        >
                          {staffCategory === 'non-nursing' && (
                            <motion.div
                              layoutId="categoryIndicator"
                              className="absolute inset-0 bg-primary rounded-full"
                              initial={false}
                              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                            />
                          )}
                          <span className={cn(
                            "relative z-10 transition-colors",
                            staffCategory === 'non-nursing' ? "text-primary-foreground" : "text-foreground"
                          )}>
                            Non-Nursing
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          <span className="font-semibold">Non-Nursing:</span> Administrative/support departments showing Hired and Open Reqs only
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </LayoutGroup>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <motion.div
            data-tour="planning-legend"
            className="flex items-center gap-4 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-foreground leading-none w-4 text-center">+</span>
              <span className="text-muted-foreground">FTE Surplus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-orange-500 leading-none w-4 text-center">-</span>
              <span className="text-muted-foreground">FTE Shortage</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            data-tour="planning-actions"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <DataRefreshButton dataSources={['staffing_grid', 'labor_uos_data']} className="h-8 w-8" />
            <Button
              variant="ascension"
              size="icon"
              className="h-8 w-8"
              onClick={downloadCSV}
              aria-label="Download CSV"
              title="Download CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ascension"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(true)}
              aria-label="Expand view"
              title="Expand view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        data-tour="planning-table"
        className="bg-card rounded-xl border shadow-sm overflow-hidden min-h-0 max-h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {skillShiftLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : displayVarianceData.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No skill-shift data available for the selected filters.
          </div>
        ) : (
          <FTESkillShiftTable 
            data={displayVarianceData} 
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            skillGroups={dynamicSkillGroups}
            viewMode={viewMode}
            staffCategory={staffCategory}
          />
        )}
      </motion.div>

      {/* Expanded Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-none w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DialogTitle className="text-2xl font-semibold">
                  FTE Skill Shift Analysis (Expanded View)
                </DialogTitle>
                
                {/* Toggle for Hired/Actual in Modal */}
                <div className="inline-flex h-7 items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground">
                  <LayoutGroup>
                    <div className="flex gap-0.5">
                      {/* Hired button */}
                      <motion.button
                        onClick={() => setViewMode('planned')}
                        className="relative inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {viewMode === 'planned' && (
                          <motion.div
                            layoutId="viewModeIndicatorModal"
                            className="absolute inset-0 bg-gradient-primary rounded-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <span className={cn(
                          "relative z-10 transition-colors",
                          viewMode === 'planned' ? "text-white" : "text-muted-foreground"
                        )}>
                          Hired
                        </span>
                      </motion.button>

                      {/* Actual button */}
                      <motion.button
                        onClick={() => setViewMode('active')}
                        className="relative inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {viewMode === 'active' && (
                          <motion.div
                            layoutId="viewModeIndicatorModal"
                            className="absolute inset-0 bg-gradient-primary rounded-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <span className={cn(
                          "relative z-10 transition-colors",
                          viewMode === 'active' ? "text-white" : "text-muted-foreground"
                        )}>
                          Actual
                        </span>
                      </motion.button>
                    </div>
                  </LayoutGroup>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Legend */}
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-light text-foreground leading-none w-4 text-center">+</span>
                    <span className="text-muted-foreground">FTE Surplus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-light text-orange-500 leading-none w-4 text-center">-</span>
                    <span className="text-muted-foreground">FTE Shortage</span>
                  </div>
                </div>
                {/* Download Button */}
                <Button
                  variant="ascension"
                  size="icon"
                  onClick={downloadCSV}
                  aria-label="Download CSV"
                  title="Download CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-card rounded-xl border shadow-sm">
            <FTESkillShiftTable 
              data={displayVarianceData} 
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              skillGroups={dynamicSkillGroups}
              viewMode={viewMode}
              staffCategory={staffCategory}
            />
          </div>
        </DialogContent>
      </Dialog>
     </div>
    </TooltipProvider>
  );
}
