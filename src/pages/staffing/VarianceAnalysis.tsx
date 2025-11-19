import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Maximize2, ChevronRight } from "lucide-react";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExpandStore } from "@/stores/useExpandStore";
import { cn } from "@/lib/utils";

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

// Region groupings
const regionMap: { [key: string]: string[] } = {
  "Southeast": ["Florida", "Tennessee", "Maryland"],
  "Midwest": ["Illinois", "Indiana", "Wisconsin"],
  "South Central": ["Kansas", "Oklahoma", "Texas"],
};

// Real hierarchical data structure
const varianceDataByLevel = {
  regions: [
    { name: "Southeast", ...generateVariance() },
    { name: "Midwest", ...generateVariance() },
    { name: "South Central", ...generateVariance() },
  ],
  markets: [
    { name: "Florida", ...generateVariance() },
    { name: "Illinois", ...generateVariance() },
    { name: "Indiana", ...generateVariance() },
    { name: "Kansas", ...generateVariance() },
    { name: "Maryland", ...generateVariance() },
    { name: "Oklahoma", ...generateVariance() },
    { name: "Tennessee", ...generateVariance() },
    { name: "Texas", ...generateVariance() },
    { name: "Wisconsin", ...generateVariance() },
  ],
  facilities: {
    "Florida": [
      { name: "Ascension Sacred Heart Pensacola", ...generateVariance() },
      { name: "Studer Family Children's Hospital", ...generateVariance() },
      { name: "Ascension St. Vincent's Riverside", ...generateVariance() },
      { name: "Ascension St. Vincent's Southside", ...generateVariance() },
      { name: "Ascension St. Vincent's St. Clair's", ...generateVariance() },
      { name: "Ascension St. Vincent's Clay County", ...generateVariance() },
    ],
    "Illinois": [
      { name: "Ascension Illinois", ...generateVariance() },
    ],
    "Indiana": [
      { name: "Peyton Manning Children's Hospital", ...generateVariance() },
      { name: "Ascension St. Vincent Indianapolis", ...generateVariance() },
      { name: "Ascension St. Vincent Heart Center", ...generateVariance() },
      { name: "Ascension St. Vincent Kokomo", ...generateVariance() },
      { name: "Ascension St. Vincent Anderson", ...generateVariance() },
      { name: "Ascension St. Vincent Fishers", ...generateVariance() },
      { name: "Ascension St. Vincent Carmel", ...generateVariance() },
      { name: "Ascension St. Vincent Warrick", ...generateVariance() },
      { name: "Ascension St. Vincent Evansville", ...generateVariance() },
    ],
    "Kansas": [
      { name: "Ascension Via Christi Wichita", ...generateVariance() },
      { name: "Ascension Via Christi Pittsburg", ...generateVariance() },
      { name: "Ascension Via Christi St. Joseph", ...generateVariance() },
      { name: "Ascension Via Christi Manhattan", ...generateVariance() },
      { name: "Ascension Via Christi St. Teresa", ...generateVariance() },
    ],
    "Maryland": [
      { name: "Ascension St. Agnes Hospital", ...generateVariance() },
    ],
    "Oklahoma": [
      { name: "St. John Medical Center", ...generateVariance() },
      { name: "St. John Sapulpa", ...generateVariance() },
      { name: "St. John Owasso", ...generateVariance() },
      { name: "St. John Broken Arrow", ...generateVariance() },
      { name: "Jane Phillips Medical Center", ...generateVariance() },
    ],
    "Tennessee": [
      { name: "Ascension Saint Thomas Midtown", ...generateVariance() },
      { name: "Ascension Saint Thomas West", ...generateVariance() },
      { name: "Ascension Saint Thomas Rutherford", ...generateVariance() },
      { name: "Ascension Saint Thomas Hickman", ...generateVariance() },
      { name: "Ascension Saint Thomas DeKalb", ...generateVariance() },
      { name: "Ascension Saint Thomas Highlands", ...generateVariance() },
      { name: "Ascension Saint Thomas River Park", ...generateVariance() },
    ],
    "Texas": [
      { name: "Ascension Seton Austin", ...generateVariance() },
      { name: "Ascension Seton Northwest", ...generateVariance() },
      { name: "Ascension Seton Southwest", ...generateVariance() },
      { name: "Dell Children's Medical Center", ...generateVariance() },
      { name: "Ascension Seton Hays", ...generateVariance() },
      { name: "Ascension Seton Williamson", ...generateVariance() },
      { name: "Ascension Seton Harker Heights", ...generateVariance() },
      { name: "Ascension Providence", ...generateVariance() },
    ],
    "Wisconsin": [
      { name: "Ascension Columbia St. Mary's Milwaukee", ...generateVariance() },
      { name: "Ascension Columbia St. Mary's Ozaukee", ...generateVariance() },
    ],
  },
  departments: [
    { name: "Emergency", ...generateVariance() },
    { name: "ICU", ...generateVariance() },
    { name: "Surgery", ...generateVariance() },
    { name: "Cardiology", ...generateVariance() },
  ],
};

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

  // Format variance value with +/- sign
  const formatVariance = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
  };

  const getColumnHeader = (): string => {
    if (selectedDepartment !== "all-departments") return "Department";
    if (selectedFacility !== "all-facilities") return "Departments";
    if (selectedMarket !== "all-markets") return "Facilities";
    if (selectedRegion !== "all-regions") return "Markets";
    return "Regions";
  };

  const getData = (): GroupedVarianceData[] => {
    // Show departments when facility is selected (no grouping)
    if (selectedFacility !== "all-facilities") {
      return varianceDataByLevel.departments.map((dept, idx) => ({
        ...dept,
        type: 'skill' as const,
        id: `dept-${idx}`,
      }));
    }

    // Show facilities when market is selected (group by facility type or just list)
    if (selectedMarket !== "all-markets") {
      const facilityData = varianceDataByLevel.facilities[selectedMarket as keyof typeof varianceDataByLevel.facilities];
      if (facilityData) {
        // For simplicity, create groups for different facility types
        const childrenHospitals = facilityData.filter(f => f.name.includes("Children"));
        const otherFacilities = facilityData.filter(f => !f.name.includes("Children"));

        const groups: GroupedVarianceData[] = [];

        if (childrenHospitals.length > 0) {
          const groupTotal = childrenHospitals.reduce((acc, curr) => ({
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
            name: "Children's Hospitals",
            type: 'group',
            id: 'group-children',
            ...groupTotal,
            children: childrenHospitals.map((f, idx) => ({
              ...f,
              type: 'skill' as const,
              id: `child-${idx}`,
            })),
          });
        }

        if (otherFacilities.length > 0) {
          const groupTotal = otherFacilities.reduce((acc, curr) => ({
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
            name: "Regional Medical Centers",
            type: 'group',
            id: 'group-regional',
            ...groupTotal,
            children: otherFacilities.map((f, idx) => ({
              ...f,
              type: 'skill' as const,
              id: `regional-${idx}`,
            })),
          });
        }

        return groups;
      }
    }

    // Show markets grouped by region when region is selected
    if (selectedRegion !== "all-regions") {
      const marketsInRegion = regionMap[selectedRegion] || [];
      const marketData = varianceDataByLevel.markets.filter(m => marketsInRegion.includes(m.name));
      
      return marketData.map((market, idx) => ({
        ...market,
        type: 'skill' as const,
        id: `market-${idx}`,
      }));
    }

    // Default: show all regions with markets as children
    return varianceDataByLevel.regions.map((region, idx) => {
      const marketsInRegion = regionMap[region.name] || [];
      const marketData = varianceDataByLevel.markets.filter(m => marketsInRegion.includes(m.name));
      
      return {
        ...region,
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
          className="bg-primary/5 hover:bg-primary/10 border-t-2 border-primary/20 cursor-pointer"
          onClick={() => toggleExpanded(row.id)}
        >
          <TableCell className="font-semibold sticky left-0 bg-primary/5 whitespace-nowrap">
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
          <TableCell className="text-center font-semibold border-l">
            {formatVariance(row.clDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.clNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.clTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l">
            {formatVariance(row.rnDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.rnNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.rnTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l">
            {formatVariance(row.pctDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.pctNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.pctTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l">
            {formatVariance(row.hucDay)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.hucNight)}
          </TableCell>
          <TableCell className="text-center font-semibold">
            {formatVariance(row.hucTotal)}
          </TableCell>
          <TableCell className="text-center font-semibold border-l">
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
    <TableRow className="hover:bg-muted/30 bg-primary/5">
      <TableCell className="font-medium sticky left-0 bg-primary/5 pl-8 whitespace-nowrap">
        {row.name}
      </TableCell>
      <TableCell className="text-center font-semibold border-l">
        {formatVariance(row.clDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.clNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.clTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l">
        {formatVariance(row.rnDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.rnNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.rnTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l">
        {formatVariance(row.pctDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.pctNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.pctTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l">
        {formatVariance(row.hucDay)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.hucNight)}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {formatVariance(row.hucTotal)}
      </TableCell>
      <TableCell className="text-center font-semibold border-l">
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
    <TableRow className="bg-muted/20 border-t-2 font-bold">
      <TableCell className="font-bold sticky left-0 bg-muted/20">
        TOTAL
      </TableCell>
      <TableCell className="text-center font-bold border-l">
        {formatVariance(totals.clDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.clNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.clTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l">
        {formatVariance(totals.rnDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.rnNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.rnTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l">
        {formatVariance(totals.pctDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.pctNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.pctTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l">
        {formatVariance(totals.hucDay)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.hucNight)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatVariance(totals.hucTotal)}
      </TableCell>
      <TableCell className="text-center font-bold border-l">
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
        <TableRow>
          <TableHead className="font-semibold sticky left-0 bg-card z-10 min-w-[200px]">{columnHeader}</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l">CL Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l">RN Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l">PCT Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l">HUC</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l">Overhead</TableHead>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableHead className="sticky left-0 bg-muted/50 z-10"></TableHead>
          <TableHead className="text-center text-xs border-l">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l">Day</TableHead>
          <TableHead className="text-center text-xs">Night</TableHead>
          <TableHead className="text-center text-xs">Total</TableHead>
          <TableHead className="text-center text-xs border-l">Day</TableHead>
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
        <h2 className="text-2xl font-bold">Variance Analysis</h2>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex flex-col gap-0.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-500 leading-none w-4 text-center">+</span>
              <span className="text-muted-foreground">FTE Shortage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground leading-none w-4 text-center">-</span>
              <span className="text-muted-foreground">FTE Surplus</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <DataRefreshButton dataSources={['staffing_grid', 'labor_uos_data']} />
            <Button
              variant="ascension"
              size="icon"
              onClick={downloadCSV}
              aria-label="Download CSV"
              title="Download CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ascension"
              size="icon"
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
        className="rounded-lg border bg-card overflow-x-auto"
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
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-500 leading-none w-4 text-center">+</span>
                    <span className="text-muted-foreground">FTE Shortage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground leading-none w-4 text-center">-</span>
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