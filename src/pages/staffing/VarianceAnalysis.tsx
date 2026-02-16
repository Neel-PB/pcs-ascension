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

// Helper function to generate realistic variance data
const generateVariance = () => ({
  clDay: (Math.random() * 6 - 3),
  clNight: (Math.random() * 4 - 2),
  clTotal: (Math.random() * 5 - 2.5),
  rnDay: (Math.random() * 6 - 3),
  rnNight: (Math.random() * 4 - 2),
  rnTotal: (Math.random() * 5 - 2.5),
  pctDay: (Math.random() * 3 - 1.5),
  pctNight: (Math.random() * 2 - 1),
  pctTotal: (Math.random() * 3 - 1.5),
  hucDay: (Math.random() * 3 - 1.5),
  hucNight: (Math.random() * 2 - 1),
  hucTotal: (Math.random() * 3 - 1.5),
  overheadDay: (Math.random() * 1 - 0.5),
  overheadNight: (Math.random() * 0.6 - 0.3),
  overheadTotal: (Math.random() * 1 - 0.5),
});

// Note: regionMap is now derived from database via useFilterData hook
// Markets and departments are now fetched dynamically from database

interface VarianceAnalysisProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function VarianceAnalysis({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: VarianceAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isExpanded: isGroupExpanded, toggleExpanded } = useExpandStore();
  const { markets, getFacilitiesGroupedBySubmarket, getDepartmentsByFacility, facilities } = useFilterData();
  const { restrictedOptions, hasRestrictions, hasRestrictionAt } = useOrgScopedFilters();

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

  // Dynamic markets data from database with mock variance numbers
  const dynamicMarkets = useMemo(() => 
    markets.map(m => ({
      name: m.market,
      ...generateVariance()
    })), [markets]
  );

  // Dynamic departments data from database based on selected facility OR access scope
  const dynamicDepartments = useMemo(() => {
    // If user has department restrictions and viewing "all" departments, show only authorized ones
    if (hasRestrictionAt('department') && selectedFacility === "all-facilities" && selectedDepartment === "all-departments") {
      return restrictedOptions.availableDepartments.map(d => ({
        name: d.department_name,
        subText: d.department_id,
        ...generateVariance()
      }));
    }
    
    if (selectedFacility === "all-facilities") return [];
    const facilityDepts = getDepartmentsByFacility(selectedFacility);
    return facilityDepts.map(d => ({
      name: d.department_name,
      subText: d.department_id,
      ...generateVariance()
    }));
  }, [selectedFacility, selectedDepartment, getDepartmentsByFacility, hasRestrictionAt, restrictedOptions.availableDepartments]);

  // Format variance value with +/- sign
  const formatVariance = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
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

  const getData = (): GroupedVarianceData[] => {
    // PRIORITY 1: If user has department restrictions and "all-departments" is selected,
    // show ONLY their authorized departments (not all departments in the database)
    if (hasRestrictionAt('department') && selectedDepartment === "all-departments" && selectedFacility === "all-facilities") {
      return dynamicDepartments.map((dept, idx) => ({
        ...dept,
        type: 'skill' as const,
        id: `dept-${idx}`,
      }));
    }
    
    // Show departments when facility is selected (no grouping)
    if (selectedFacility !== "all-facilities") {
      return dynamicDepartments.map((dept, idx) => ({
        ...dept,
        type: 'skill' as const,
        id: `dept-${idx}`,
      }));
    }
    
    // PRIORITY 2: If user has facility restrictions and "all-facilities" is selected,
    // show ONLY their authorized facilities (grouped by submarket if available)
    if (hasRestrictionAt('facility') && selectedFacility === "all-facilities" && selectedMarket === "all-markets") {
      const authorizedFacilities = restrictedOptions.availableFacilities;
      // Group authorized facilities by submarket
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
            ...generateVariance(),
          }));
          
          const groupTotal = facilitiesWithVariance.reduce((acc, curr) => ({
            clDay: acc.clDay + curr.clDay, clNight: acc.clNight + curr.clNight, clTotal: acc.clTotal + curr.clTotal,
            rnDay: acc.rnDay + curr.rnDay, rnNight: acc.rnNight + curr.rnNight, rnTotal: acc.rnTotal + curr.rnTotal,
            pctDay: acc.pctDay + curr.pctDay, pctNight: acc.pctNight + curr.pctNight, pctTotal: acc.pctTotal + curr.pctTotal,
            hucDay: acc.hucDay + curr.hucDay, hucNight: acc.hucNight + curr.hucNight, hucTotal: acc.hucTotal + curr.hucTotal,
            overheadDay: acc.overheadDay + curr.overheadDay, overheadNight: acc.overheadNight + curr.overheadNight, overheadTotal: acc.overheadTotal + curr.overheadTotal,
          }), { clDay: 0, clNight: 0, clTotal: 0, rnDay: 0, rnNight: 0, rnTotal: 0, pctDay: 0, pctNight: 0, pctTotal: 0, hucDay: 0, hucNight: 0, hucTotal: 0, overheadDay: 0, overheadNight: 0, overheadTotal: 0 });
          
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
    
    // PRIORITY 3: If user has market restrictions and "all-markets" is selected,
    // show ONLY their authorized markets
    if (hasRestrictionAt('market') && selectedMarket === "all-markets" && selectedRegion === "all-regions") {
      const authorizedMarkets = restrictedOptions.availableMarkets;
      const marketData = dynamicMarkets.filter(m =>
        authorizedMarkets.some(am => am.toUpperCase() === m.name.toUpperCase())
      );
      return marketData.map((market, idx) => ({
        ...market,
        type: 'skill' as const,
        id: `market-${idx}`,
      }));
    }

    // Show facilities when market is selected (group by submarket from DB)
    if (selectedMarket !== "all-markets") {
      const submarketGroups = getFacilitiesGroupedBySubmarket(selectedMarket);
      const groups: GroupedVarianceData[] = [];

      Object.entries(submarketGroups).forEach(([submarket, facilities]) => {
        if (facilities.length > 0) {
          // Generate mock variance data for each facility
          const facilitiesWithVariance = facilities.map(f => ({
            name: f.facility_name,
            subText: f.facility_id,
            ...generateVariance(),
          }));

          const groupTotal = facilitiesWithVariance.reduce((acc, curr) => ({
            clDay: acc.clDay + curr.clDay,
            clNight: acc.clNight + curr.clNight,
            clTotal: acc.clTotal + curr.clTotal,
            rnDay: acc.rnDay + curr.rnDay,
            rnNight: acc.rnNight + curr.rnNight,
            rnTotal: acc.rnTotal + curr.rnTotal,
            pctDay: acc.pctDay + curr.pctDay,
            pctNight: acc.pctNight + curr.pctNight,
            pctTotal: acc.pctTotal + curr.pctTotal,
            hucDay: acc.hucDay + curr.hucDay,
            hucNight: acc.hucNight + curr.hucNight,
            hucTotal: acc.hucTotal + curr.hucTotal,
            overheadDay: acc.overheadDay + curr.overheadDay,
            overheadNight: acc.overheadNight + curr.overheadNight,
            overheadTotal: acc.overheadTotal + curr.overheadTotal,
          }), {
            clDay: 0, clNight: 0, clTotal: 0,
            rnDay: 0, rnNight: 0, rnTotal: 0,
            pctDay: 0, pctNight: 0, pctTotal: 0,
            hucDay: 0, hucNight: 0, hucTotal: 0,
            overheadDay: 0, overheadNight: 0, overheadTotal: 0,
          });

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

    // Show markets grouped by region when region is selected
    if (selectedRegion !== "all-regions") {
      const marketsInRegion = regionMap[selectedRegion] || [];
      const marketData = dynamicMarkets.filter(m => 
        marketsInRegion.some(mr => mr.toUpperCase() === m.name.toUpperCase())
      );
      
      return marketData.map((market, idx) => ({
        ...market,
        type: 'skill' as const,
        id: `market-${idx}`,
      }));
    }

    // Default: show all regions with markets as children (dynamically from database)
    const dynamicRegions = Object.keys(regionMap);
    
    return dynamicRegions.map((regionName, idx) => {
      const marketsInRegion = regionMap[regionName] || [];
      const marketData = dynamicMarkets.filter(m => 
        marketsInRegion.some(mr => mr.toUpperCase() === m.name.toUpperCase())
      );
      
      // Calculate aggregated variance for the region from its markets
      const regionVariance = marketData.length > 0 
        ? marketData.reduce((acc, curr) => ({
            clDay: acc.clDay + curr.clDay,
            clNight: acc.clNight + curr.clNight,
            clTotal: acc.clTotal + curr.clTotal,
            rnDay: acc.rnDay + curr.rnDay,
            rnNight: acc.rnNight + curr.rnNight,
            rnTotal: acc.rnTotal + curr.rnTotal,
            pctDay: acc.pctDay + curr.pctDay,
            pctNight: acc.pctNight + curr.pctNight,
            pctTotal: acc.pctTotal + curr.pctTotal,
            hucDay: acc.hucDay + curr.hucDay,
            hucNight: acc.hucNight + curr.hucNight,
            hucTotal: acc.hucTotal + curr.hucTotal,
            overheadDay: acc.overheadDay + curr.overheadDay,
            overheadNight: acc.overheadNight + curr.overheadNight,
            overheadTotal: acc.overheadTotal + curr.overheadTotal,
          }), {
            clDay: 0, clNight: 0, clTotal: 0,
            rnDay: 0, rnNight: 0, rnTotal: 0,
            pctDay: 0, pctNight: 0, pctTotal: 0,
            hucDay: 0, hucNight: 0, hucTotal: 0,
            overheadDay: 0, overheadNight: 0, overheadTotal: 0,
          })
        : generateVariance();
      
      return {
        name: regionName,
        ...regionVariance,
        type: 'group' as const,
        id: `region-${idx}`,
        children: marketData.map((market, midx) => ({
          ...market,
          type: 'skill' as const,
          id: `region-${idx}-market-${midx}`,
        })),
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
      <TableHeader>
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
    <div className="space-y-6">
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
              <span className="text-muted-foreground">FTE Shortage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-foreground leading-none w-4 text-center">-</span>
              <span className="text-muted-foreground">FTE Surplus</span>
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border shadow-sm bg-card overflow-hidden overflow-x-auto"
        data-tour="variance-table"
      >
        <VarianceTable />
      </motion.div>

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
                    <span className="text-muted-foreground">FTE Shortage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-light text-foreground leading-none w-4 text-center">-</span>
                    <span className="text-muted-foreground">FTE Surplus</span>
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