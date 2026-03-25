import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Maximize2, ChevronRight } from "@/lib/icons";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExpandStore } from "@/stores/useExpandStore";
import { cn } from "@/lib/utils";
import { useFilterData } from "@/hooks/useFilterData";
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";
import { useSkillShift, SkillShiftRecord } from "@/hooks/useSkillShift";
import { Skeleton } from "@/components/ui/skeleton";

interface VarianceData {
  name: string;
  clDay: number;
  clNight: number;
  clTotal: number;
  rnDay: number;
  rnNight: number;
  rnTotal: number;
  pctDay: number;
  pctNight: number;
  pctTotal: number;
  hucDay: number;
  hucNight: number;
  hucTotal: number;
  overheadDay: number;
  overheadNight: number;
  overheadTotal: number;
}

interface GroupedVarianceData extends VarianceData {
  type: 'group' | 'skill' | 'total';
  id: string;
  subText?: string;
  children?: GroupedVarianceData[];
}

const ZERO_VARIANCE: Omit<VarianceData, 'name'> = {
  clDay: 0, clNight: 0, clTotal: 0,
  rnDay: 0, rnNight: 0, rnTotal: 0,
  pctDay: 0, pctNight: 0, pctTotal: 0,
  hucDay: 0, hucNight: 0, hucTotal: 0,
  overheadDay: 0, overheadNight: 0, overheadTotal: 0,
};

// Map skill_mix to variance column prefix
function mapSkillToPrefix(skill: string): 'cl' | 'rn' | 'pct' | 'huc' | 'overhead' | null {
  const upper = skill.toUpperCase().trim();
  if (upper === 'CL') return 'cl';
  if (upper === 'RN') return 'rn';
  if (upper === 'PCT') return 'pct';
  if (upper === 'CLERK' || upper === 'HUC') return 'huc';
  return null;
}

// Check if a record is overhead based on broader_skill_mix_category
function isOverhead(record: SkillShiftRecord): boolean {
  const cat = (record.broader_skill_mix_category || '').toLowerCase().trim();
  return cat === 'overheads' || cat === 'overhead';
}

// Aggregate skill-shift records into a single VarianceData row
function aggregateRecordsToVariance(records: SkillShiftRecord[]): Omit<VarianceData, 'name'> {
  const result = { ...ZERO_VARIANCE };
  for (const r of records) {
    // Overhead records go to overhead column regardless of skill_mix
    const prefix = isOverhead(r) ? 'overhead' : mapSkillToPrefix(r.skill_mix || '');
    if (!prefix) continue;
    const dayVar = Number(r.hired_day_fte) - Number(r.target_fte_day) + Number(r.open_reqs_day_fte);
    const nightVar = Number(r.hired_night_fte) - Number(r.target_fte_night) + Number(r.open_reqs_night_fte);
    const totalVar = Number(r.hired_total_fte) - Number(r.target_fte_total) + Number(r.open_reqs_total_fte);
    result[`${prefix}Day` as keyof typeof result] += dayVar;
    result[`${prefix}Night` as keyof typeof result] += nightVar;
    result[`${prefix}Total` as keyof typeof result] += totalVar;
  }
  return result;
}

// Group records by a field and return a map
function groupBy(records: SkillShiftRecord[], field: keyof SkillShiftRecord): Record<string, SkillShiftRecord[]> {
  const map: Record<string, SkillShiftRecord[]> = {};
  for (const r of records) {
    const key = String(r[field] || 'Unknown');
    if (!map[key]) map[key] = [];
    map[key].push(r);
  }
  return map;
}

// Sum multiple VarianceData objects (without name)
function sumVariances(items: Omit<VarianceData, 'name'>[]): Omit<VarianceData, 'name'> {
  const result = { ...ZERO_VARIANCE };
  for (const item of items) {
    for (const key of Object.keys(result) as (keyof typeof result)[]) {
      result[key] += item[key];
    }
  }
  return result;
}

interface VarianceAnalysisProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
  selectedSubmarket?: string;
  selectedLevel2?: string;
  selectedPstat?: string;
  lastUpdated?: string | null;
}

export function VarianceAnalysis({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
  selectedSubmarket,
  selectedLevel2,
  selectedPstat,
  lastUpdated,
}: VarianceAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isExpanded: isGroupExpanded, toggleExpanded } = useExpandStore();
  const { markets, getFacilitiesGroupedBySubmarket, getDepartmentsByFacility, facilities } = useFilterData();
  const { restrictedOptions, hasRestrictions, hasRestrictionAt } = useOrgScopedFilters();

  // Fetch skill-shift data with all active filters
  const { data: skillShiftData, isLoading: isSkillShiftLoading } = useSkillShift({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
    department: selectedDepartment,
    submarket: selectedSubmarket,
    level2: selectedLevel2,
    pstat: selectedPstat,
  });

  // Filter out non-nursing departments from variance analysis
  const records = useMemo(() => {
    const raw = skillShiftData || [];
    return raw.filter(r => {
      const flag = (r.nursing_flag || '').toString().toUpperCase().trim();
      return flag === 'Y' || flag === 'YES' || flag === 'TRUE' || flag === '1';
    });
  }, [skillShiftData]);

  // Build region-to-markets map from database
  const regionMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    markets.forEach(m => {
      if (m.region) {
        if (!map[m.region]) map[m.region] = [];
        if (!map[m.region].includes(m.market)) {
          map[m.region].push(m.market);
        }
      }
    });
    return map;
  }, [markets]);

  // Format variance value with +/- sign
  const formatVariance = (value: number | undefined | null): string => {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}`;
  };

  const getColumnHeader = (): string => {
    if (selectedDepartment !== "all-departments") return "Department";
    // If user has department restrictions, show "Departments" header even when "all-departments" is selected
    if (hasRestrictionAt('department') && selectedDepartment === "all-departments") return "Departments";
    if (selectedFacility !== "all-facilities") return "Departments";
    if (hasRestrictionAt('facility') && selectedFacility === "all-facilities") return "Facilities";
    if (selectedMarket !== "all-markets") return "Facilities";
    if (hasRestrictionAt('market') && selectedMarket === "all-markets") return "Markets";
    if (selectedRegion !== "all-regions") return "Markets";
    return "Regions";
  };

  // Build variance lookup from skill-shift records grouped by a field
  const varianceByField = useMemo(() => {
    const byMarket = groupBy(records, 'market');
    const byFacility = groupBy(records, 'business_unit');
    const byDept = groupBy(records, 'department_id');
    const byRegion = groupBy(records, 'region');
    return { byMarket, byFacility, byDept, byRegion };
  }, [records]);

  const getData = (): GroupedVarianceData[] => {
    // PRIORITY 1: Department restrictions — show only authorized departments
    if (hasRestrictionAt('department') && selectedDepartment === "all-departments" && selectedFacility === "all-facilities") {
      return restrictedOptions.availableDepartments.map((d, idx) => ({
        name: d.department_name,
        subText: d.department_id,
        ...aggregateRecordsToVariance(varianceByField.byDept[d.department_id] || []),
        type: 'skill' as const,
        id: `dept-${idx}`,
      }));
    }
    
    // Show departments when facility is selected
    if (selectedFacility !== "all-facilities") {
      const facilityDepts = getDepartmentsByFacility(selectedFacility);
      return facilityDepts.map((d, idx) => ({
        name: d.department_name,
        subText: d.department_id,
        ...aggregateRecordsToVariance(varianceByField.byDept[d.department_id] || []),
        type: 'skill' as const,
        id: `dept-${idx}`,
      }));
    }
    
    // PRIORITY 2: Facility restrictions — show authorized facilities grouped by submarket
    if (hasRestrictionAt('facility') && selectedFacility === "all-facilities" && selectedMarket === "all-markets") {
      const authorizedFacilities = restrictedOptions.availableFacilities;
      const submarketGroups: Record<string, typeof authorizedFacilities> = {};
      authorizedFacilities.forEach(f => {
        const submarket = f.submarket || "Other";
        if (!submarketGroups[submarket]) submarketGroups[submarket] = [];
        submarketGroups[submarket].push(f);
      });
      
      const groups: GroupedVarianceData[] = [];
      Object.entries(submarketGroups).forEach(([submarket, facs]) => {
        if (facs.length > 0) {
          const facilitiesWithVariance = facs.map(f => ({
            name: f.facility_name,
            subText: f.facility_id,
            ...aggregateRecordsToVariance(varianceByField.byFacility[f.facility_id] || []),
          }));
          
          const groupTotal = sumVariances(facilitiesWithVariance);
          
          groups.push({
            name: submarket,
            type: 'group',
            id: `group-${submarket}`,
            ...groupTotal,
            children: facilitiesWithVariance.map((f, idx) => ({
              ...f,
              type: 'skill' as const,
              id: `${submarket}-${idx}`,
            })),
          });
        }
      });
      return groups;
    }
    
    // PRIORITY 3: Market restrictions — show authorized markets
    if (hasRestrictionAt('market') && selectedMarket === "all-markets" && selectedRegion === "all-regions") {
      const authorizedMarkets = restrictedOptions.availableMarkets;
      return authorizedMarkets.map((mkt, idx) => ({
        name: mkt,
        ...aggregateRecordsToVariance(varianceByField.byMarket[mkt] || []),
        type: 'skill' as const,
        id: `market-${idx}`,
      }));
    }

    // Show facilities when market is selected (group by submarket from DB)
    if (selectedMarket !== "all-markets") {
      const submarketGroups = getFacilitiesGroupedBySubmarket(selectedMarket);
      const groups: GroupedVarianceData[] = [];

      Object.entries(submarketGroups).forEach(([submarket, facs]) => {
        if (facs.length > 0) {
          const facilitiesWithVariance = facs.map(f => ({
            name: f.facility_name,
            subText: f.facility_id,
            ...aggregateRecordsToVariance(varianceByField.byFacility[f.facility_id] || []),
          }));

          const groupTotal = sumVariances(facilitiesWithVariance);

          groups.push({
            name: submarket,
            type: 'group',
            id: `group-${submarket}`,
            ...groupTotal,
            children: facilitiesWithVariance.map((f, idx) => ({
              ...f,
              type: 'skill' as const,
              id: `${submarket}-${idx}`,
            })),
          });
        }
      });

      return groups;
    }

    // Show markets when region is selected
    if (selectedRegion !== "all-regions") {
      const marketsInRegion = regionMap[selectedRegion] || [];
      return marketsInRegion.map((mkt, idx) => ({
        name: mkt,
        ...aggregateRecordsToVariance(varianceByField.byMarket[mkt] || []),
        type: 'skill' as const,
        id: `market-${idx}`,
      }));
    }

    // Default: show all regions with markets as children
    const dynamicRegions = Object.keys(regionMap);
    
    return dynamicRegions.map((regionName, idx) => {
      const marketsInRegion = regionMap[regionName] || [];
      const marketItems = marketsInRegion.map((mkt, midx) => ({
        name: mkt,
        ...aggregateRecordsToVariance(varianceByField.byMarket[mkt] || []),
        type: 'skill' as const,
        id: `region-${idx}-market-${midx}`,
      }));
      
      const regionVariance = sumVariances(marketItems);
      
      return {
        name: regionName,
        ...regionVariance,
        type: 'group' as const,
        id: `region-${idx}`,
        children: marketItems,
      };
    });
  };

  const data = getData();
  const columnHeader = getColumnHeader();

  // Calculate totals
  const calculateTotals = (data: GroupedVarianceData[]): VarianceData => {
    return data.reduce((acc, row) => ({
      name: 'TOTAL',
      clDay: acc.clDay + row.clDay,
      clNight: acc.clNight + row.clNight,
      clTotal: acc.clTotal + row.clTotal,
      rnDay: acc.rnDay + row.rnDay,
      rnNight: acc.rnNight + row.rnNight,
      rnTotal: acc.rnTotal + row.rnTotal,
      pctDay: acc.pctDay + row.pctDay,
      pctNight: acc.pctNight + row.pctNight,
      pctTotal: acc.pctTotal + row.pctTotal,
      hucDay: acc.hucDay + row.hucDay,
      hucNight: acc.hucNight + row.hucNight,
      hucTotal: acc.hucTotal + row.hucTotal,
      overheadDay: acc.overheadDay + row.overheadDay,
      overheadNight: acc.overheadNight + row.overheadNight,
      overheadTotal: acc.overheadTotal + row.overheadTotal,
    }), {
      name: 'TOTAL',
      clDay: 0, clNight: 0, clTotal: 0,
      rnDay: 0, rnNight: 0, rnTotal: 0,
      pctDay: 0, pctNight: 0, pctTotal: 0,
      hucDay: 0, hucNight: 0, hucTotal: 0,
      overheadDay: 0, overheadNight: 0, overheadTotal: 0,
    });
  };

  const totals = calculateTotals(data);

  const downloadCSV = () => {
    const headers = [
      columnHeader,
      "CL Day", "CL Night", "CL Total",
      "RN Day", "RN Night", "RN Total",
      "PCT Day", "PCT Night", "PCT Total",
      "HUC Day", "HUC Night", "HUC Total",
      "Overhead Day", "Overhead Night", "Overhead Total"
    ];
    
    const rows = data.map(row => [
      row.name,
      row.clDay.toFixed(1),
      row.clNight.toFixed(1),
      row.clTotal.toFixed(1),
      row.rnDay.toFixed(1),
      row.rnNight.toFixed(1),
      row.rnTotal.toFixed(1),
      row.pctDay.toFixed(1),
      row.pctNight.toFixed(1),
      row.pctTotal.toFixed(1),
      row.hucDay.toFixed(1),
      row.hucNight.toFixed(1),
      row.hucTotal.toFixed(1),
      row.overheadDay.toFixed(1),
      row.overheadNight.toFixed(1),
      row.overheadTotal.toFixed(1),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Variance_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Row components
  const GroupRow = ({ row }: { row: GroupedVarianceData }) => {
    const expanded = isGroupExpanded(row.id);
    
    return (
      <>
        <TableRow
          className="!bg-primary/10 hover:!bg-primary/15 border-t-2 border-primary/20 cursor-pointer"
          onClick={() => toggleExpanded(row.id)}
        >
          <TableCell className="font-semibold whitespace-nowrap w-48 min-w-48 max-w-48">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
              {row.name}
            </div>
          </TableCell>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
            {formatVariance(row.clDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.clNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.clTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
            {formatVariance(row.rnDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.rnNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.rnTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
            {formatVariance(row.pctDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.pctNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.pctTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
            {formatVariance(row.hucDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.hucNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.hucTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
            {formatVariance(row.overheadDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.overheadNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.overheadTotal)}
          </TableCell>
        </TableRow>
        {expanded && row.children?.map((child) => (
          <SkillRow key={child.id} row={child} />
        ))}
      </>
    );
  };

  const SkillRow = ({ row }: { row: GroupedVarianceData }) => (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium pl-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 max-w-[180px]">
                <span className="truncate text-sm">{row.name}</span>
                {row.subText && (
                  <Badge variant="outline" className="bg-primary/10 text-primary text-xs shrink-0">
                    {row.subText}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{row.name}{row.subText ? ` (${row.subText})` : ''}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
        {formatVariance(row.clDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.clNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.clTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
        {formatVariance(row.rnDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.rnNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.rnTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
        {formatVariance(row.pctDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.pctNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.pctTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
        {formatVariance(row.hucDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.hucNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.hucTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l-2 border-muted-foreground/30">
        {formatVariance(row.overheadDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.overheadNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.overheadTotal)}
      </TableCell>
    </TableRow>
  );

  const TotalRow = ({ totals }: { totals: VarianceData }) => (
    <TableRow className="!bg-muted/50 border-t-2 font-bold">
      <TableCell className="font-bold">
        TOTAL
      </TableCell>
      <TableCell className="text-center font-bold border-l-2 border-muted-foreground/30">
        {formatVariance(totals.clDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.clNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.clTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l-2 border-muted-foreground/30">
        {formatVariance(totals.rnDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.rnNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.rnTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l-2 border-muted-foreground/30">
        {formatVariance(totals.pctDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.pctNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.pctTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l-2 border-muted-foreground/30">
        {formatVariance(totals.hucDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.hucNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.hucTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l-2 border-muted-foreground/30">
        {formatVariance(totals.overheadDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.overheadNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.overheadTotal)}
      </TableCell>
    </TableRow>
  );

  const VarianceTable = () => (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-card">
        <TableRow data-tour="variance-skill-headers">
          <TableHead className="font-semibold bg-muted/30 min-w-[200px]">{columnHeader}</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2 border-muted-foreground/30">CL Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2 border-muted-foreground/30">RN Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2 border-muted-foreground/30">PCT Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2 border-muted-foreground/30">HUC</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2 border-muted-foreground/30">Overhead</TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="min-w-[200px]"></TableHead>
          <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l-2 border-muted-foreground/30">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => {
          if (row.type === 'group') {
            return <GroupRow key={row.id} row={row} />;
          } else {
            return <SkillRow key={row.id} row={row} />;
          }
        })}
        <TotalRow totals={totals} />
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold" data-tour="variance-header">Variance Analysis</h2>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm" data-tour="variance-legend">
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-foreground leading-none w-4 text-center">+</span>
              <span className="text-muted-foreground">FTE Surplus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-foreground leading-none w-4 text-center">-</span>
              <span className="text-muted-foreground">FTE Shortage</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            data-tour="variance-actions"
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
      </motion.div>

      {isSkillShiftLoading ? (
        <div className="rounded-xl border shadow-sm bg-card p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border shadow-sm bg-card overflow-auto min-h-0 max-h-full [&>div]:overflow-visible"
          data-tour="variance-table"
        >
          <VarianceTable />
        </motion.div>
      )}

      {/* Expanded Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-none w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold">
                Variance Analysis (Expanded View)
              </DialogTitle>
              <div className="flex items-center gap-4">
                {/* Legend */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-light text-foreground leading-none w-4 text-center">+</span>
                    <span className="text-muted-foreground">FTE Surplus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-light text-foreground leading-none w-4 text-center">-</span>
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
            <VarianceTable />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}