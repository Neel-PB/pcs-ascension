import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Maximize2, ChevronRight } from "lucide-react";
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

const skillGroups: SkillGroup[] = [
  {
    id: 'overheads',
    name: 'Overheads',
    skills: ['RN DIR', 'RN MGR', 'RN AST MGR', 'CORD', 'SPEC'],
    defaultExpanded: false
  },
  {
    id: 'clinical_staff',
    name: 'Clinical Staff',
    skills: ['CL', 'RN'],
    defaultExpanded: false
  },
  {
    id: 'support_staff',
    name: 'Support Staff',
    skills: ['PCT', 'CLERK'],
    defaultExpanded: false
  }
];

const varianceData: VarianceData[] = [
  {
    skill: "RN DIR",
    targetDay: 0,
    targetNight: 0,
    targetTotal: 0,
    hiredDay: 0,
    hiredNight: 0,
    hiredTotal: 0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "RN MGR",
    targetDay: 1.0,
    targetNight: 0,
    targetTotal: 1.0,
    hiredDay: 1.0,
    hiredNight: 0,
    hiredTotal: 1.0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "RN AST MGR",
    targetDay: 1.0,
    targetNight: 0,
    targetTotal: 1.0,
    hiredDay: 1.0,
    hiredNight: 0,
    hiredTotal: 1.0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "CORD",
    targetDay: 0,
    targetNight: 0,
    targetTotal: 0,
    hiredDay: 0,
    hiredNight: 0,
    hiredTotal: 0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "SPEC",
    targetDay: 0,
    targetNight: 0,
    targetTotal: 0,
    hiredDay: 0,
    hiredNight: 0,
    hiredTotal: 0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "CL",
    targetDay: 2.4,
    targetNight: 2.4,
    targetTotal: 4.8,
    hiredDay: 1.8,
    hiredNight: 1.8,
    hiredTotal: 3.6,
    reqsDay: 0.6,
    reqsNight: 0.6,
    reqsTotal: 1.2,
    varianceDay: 0.6,
    varianceNight: 0.6,
    varianceTotal: 1.2,
  },
  {
    skill: "RN",
    targetDay: 14.3,
    targetNight: 14.3,
    targetTotal: 28.6,
    hiredDay: 13.8,
    hiredNight: 13.8,
    hiredTotal: 27.6,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: -0.5,
    varianceNight: -0.5,
    varianceTotal: -1.0,
  },
  {
    skill: "PCT",
    targetDay: 9.6,
    targetNight: 9.6,
    targetTotal: 19.2,
    hiredDay: 9.2,
    hiredNight: 9.2,
    hiredTotal: 18.4,
    reqsDay: 0.8,
    reqsNight: 0.8,
    reqsTotal: 1.6,
    varianceDay: 0.4,
    varianceNight: 0.4,
    varianceTotal: 0.8,
  },
  {
    skill: "CLERK",
    targetDay: 4.8,
    targetNight: 4.8,
    targetTotal: 9.6,
    hiredDay: 4.8,
    hiredNight: 4.8,
    hiredTotal: 9.6,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "TOTAL",
    targetDay: 33.1,
    targetNight: 31.1,
    targetTotal: 64.2,
    hiredDay: 31.6,
    hiredNight: 29.6,
    hiredTotal: 61.2,
    reqsDay: 1.4,
    reqsNight: 1.4,
    reqsTotal: 2.8,
    varianceDay: -0.1,
    varianceNight: -0.1,
    varianceTotal: -0.2,
  },
];

const getVarianceColor = (value: number) => {
  if (value < 0) return "text-green-600 font-semibold";
  if (value > 0) return "text-red-600 font-semibold";
  if (value === 0) return "text-yellow-600 font-semibold";
  return "";
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
  onToggle 
}: { 
  group: GroupedVarianceData; 
  onToggle?: (id: string) => void;
}) => {
  const { isExpanded, data, id, name, children } = group;
  
  return (
    <TableRow 
      className="font-semibold bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border-t-2 border-primary/20"
      onClick={() => onToggle?.(id)}
    >
      <TableCell className="font-semibold">
        <div className="flex items-center gap-2">
          <motion.div
            initial={false}
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-foreground">{name}</span>
          <Badge variant="secondary" className="ml-2 text-xs">
            {children?.length || 0} skills
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-center font-semibold">{data.targetDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.targetNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.targetTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.hiredDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.hiredNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.hiredTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.reqsDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.reqsNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.reqsTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className={cn("text-center font-semibold", getVarianceColor(data.varianceDay))}>
        {data.varianceDay?.toFixed(1) || "0.0"}
      </TableCell>
      <TableCell className={cn("text-center font-semibold", getVarianceColor(data.varianceNight))}>
        {data.varianceNight?.toFixed(1) || "0.0"}
      </TableCell>
      <TableCell className={cn("text-center font-semibold", getVarianceColor(data.varianceTotal))}>
        {data.varianceTotal?.toFixed(1) || "0.0"}
      </TableCell>
    </TableRow>
  );
};

const SkillRow = ({ 
  skill, 
  isChildRow 
}: { 
  skill: VarianceData; 
  isChildRow?: boolean;
}) => {
  return (
    <TableRow 
      className={cn(
        "hover:bg-muted/30 transition-colors",
        isChildRow && "bg-primary/5"
      )}
    >
      <TableCell className={cn(
        "font-medium",
        isChildRow && "pl-12"
      )}>
        {isChildRow && (
          <span className="text-muted-foreground mr-2">└─</span>
        )}
        {skill.skill}
      </TableCell>
      <TableCell className="text-center">{skill.targetDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.targetNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.targetTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.hiredDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.hiredNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.hiredTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.reqsDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.reqsNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center">{skill.reqsTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className={cn("text-center", getVarianceColor(skill.varianceDay))}>
        {skill.varianceDay?.toFixed(1) || "0.0"}
      </TableCell>
      <TableCell className={cn("text-center", getVarianceColor(skill.varianceNight))}>
        {skill.varianceNight?.toFixed(1) || "0.0"}
      </TableCell>
      <TableCell className={cn("text-center", getVarianceColor(skill.varianceTotal))}>
        {skill.varianceTotal?.toFixed(1) || "0.0"}
      </TableCell>
    </TableRow>
  );
};

const TotalRow = ({ data }: { data: VarianceData }) => {
  return (
    <TableRow className="font-semibold bg-muted/20 border-t-2">
      <TableCell className="font-semibold">{data.skill}</TableCell>
      <TableCell className="text-center font-semibold">{data.targetDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.targetNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.targetTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.hiredDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.hiredNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.hiredTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.reqsDay?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.reqsNight?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className="text-center font-semibold">{data.reqsTotal?.toFixed(1) || "0.0"}</TableCell>
      <TableCell className={cn("text-center font-semibold", getVarianceColor(data.varianceDay))}>
        {data.varianceDay?.toFixed(1) || "0.0"}
      </TableCell>
      <TableCell className={cn("text-center font-semibold", getVarianceColor(data.varianceNight))}>
        {data.varianceNight?.toFixed(1) || "0.0"}
      </TableCell>
      <TableCell className={cn("text-center font-semibold", getVarianceColor(data.varianceTotal))}>
        {data.varianceTotal?.toFixed(1) || "0.0"}
      </TableCell>
    </TableRow>
  );
};

interface FTESkillShiftTableProps {
  data: VarianceData[];
  expandedGroups?: Set<string>;
  onToggleGroup?: (groupId: string) => void;
  skillGroups?: SkillGroup[];
}

const FTESkillShiftTable = ({ 
  data, 
  expandedGroups, 
  onToggleGroup,
  skillGroups: groups 
}: FTESkillShiftTableProps) => {
  const displayData = groups && expandedGroups
    ? organizeDataIntoGroups(data, groups, expandedGroups)
    : data.map(d => ({ type: 'skill' as const, id: d.skill, name: d.skill, data: d }));
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-foreground w-32">Skills</TableHead>
            <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
              Target FTEs
            </TableHead>
            <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
              Hired FTEs
            </TableHead>
            <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
              Reqs
            </TableHead>
            <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
              Variance
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead></TableHead>
            {/* Target FTEs */}
            <TableHead className="text-center text-xs">Day</TableHead>
            <TableHead className="text-center text-xs">Night</TableHead>
            <TableHead className="text-center text-xs">Total</TableHead>
            {/* Hired FTEs */}
            <TableHead className="text-center text-xs">Day</TableHead>
            <TableHead className="text-center text-xs">Night</TableHead>
            <TableHead className="text-center text-xs">Total</TableHead>
            {/* Reqs */}
            <TableHead className="text-center text-xs">Day</TableHead>
            <TableHead className="text-center text-xs">Night</TableHead>
            <TableHead className="text-center text-xs">Total</TableHead>
            {/* Variance */}
            <TableHead className="text-center text-xs">Day</TableHead>
            <TableHead className="text-center text-xs">Night</TableHead>
            <TableHead className="text-center text-xs">Total</TableHead>
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
                />
              );
            }
            
            if (row.type === 'skill') {
              return (
                <SkillRow
                  key={row.id}
                  skill={row.data}
                  isChildRow={groups && expandedGroups ? true : false}
                />
              );
            }
            
            if (row.type === 'total') {
              return (
                <TotalRow
                  key={row.id}
                  data={row.data}
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

export default function PositionPlanning() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
    const headers = [
      'Group', 'Skill',
      'Target Day', 'Target Night', 'Target Total',
      'Hired Day', 'Hired Night', 'Hired Total',
      'Reqs Day', 'Reqs Night', 'Reqs Total',
      'Variance Day', 'Variance Night', 'Variance Total'
    ];
    
    const rows: any[] = [];
    
    skillGroups.forEach(group => {
      const groupSkills = group.skills
        .map(skillName => varianceData.find(d => d.skill === skillName))
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
    
    const totalRow = varianceData.find(d => d.skill === 'TOTAL');
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
    <div className="space-y-6">
      {/* Header with Legend */}
      <div className="flex items-center justify-between">
        <motion.h1
          className="text-2xl font-semibold text-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          FTE Skill Shift Analysis
        </motion.h1>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <motion.div
            className="flex items-center gap-6 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">FTE Surplus (Negative)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">FTE Shortage (Positive)</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Expand
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="bg-card rounded-xl border shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
          <FTESkillShiftTable 
            data={varianceData} 
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            skillGroups={skillGroups}
          />
      </motion.div>

      {/* Expanded Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-none w-[95vw] h-[95vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold">
                FTE Skill Shift Analysis (Expanded View)
              </DialogTitle>
              <div className="flex items-center gap-4">
                {/* Legend */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">FTE Surplus (Negative)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">FTE Shortage (Positive)</span>
                  </div>
                </div>
                {/* Download Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCSV}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-card rounded-xl border shadow-sm">
            <FTESkillShiftTable 
              data={varianceData} 
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              skillGroups={skillGroups}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
