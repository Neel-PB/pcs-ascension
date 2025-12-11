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
    "Florida": {
      "FLJAC": [
        { name: "ASV Clay County Hospital", ...generateVariance() },
        { name: "ASV Riverside Hospital", ...generateVariance() },
        { name: "ASV Southside Hospital", ...generateVariance() },
        { name: "St Johns County Hospital", ...generateVariance() },
      ],
    },
    "Illinois": {
      "ILARL": [
        { name: "Alexian Bros Medical Ctr", ...generateVariance() },
        { name: "Saint Joseph Hosp Chgo", ...generateVariance() },
      ],
    },
    "Indiana": {
      "ININD": [
        { name: "St Vincent Fishers Hosp", ...generateVariance() },
        { name: "St Vincent Heart Ctr", ...generateVariance() },
        { name: "St Vincent Indpls Acute", ...generateVariance() },
        { name: "St Vincent Kokomo", ...generateVariance() },
        { name: "St Vincent Anderson", ...generateVariance() },
        { name: "St Vincent Carmel", ...generateVariance() },
        { name: "St Vincent Evansville", ...generateVariance() },
        { name: "Peyton Manning Children's Hospital", ...generateVariance() },
      ],
    },
    "Kansas": {
      "KSWICH": [
        { name: "Via Christi Hosp Pittsburg", ...generateVariance() },
        { name: "Via Christi Hosp St Joseph", ...generateVariance() },
        { name: "Via Christi Hosp Wichita", ...generateVariance() },
      ],
    },
    "Maryland": {
      "MDBAL": [
        { name: "St Agnes Healthcare", ...generateVariance() },
      ],
    },
    "Oklahoma": {
      "OKTUL": [
        { name: "St John Medical Center", ...generateVariance() },
        { name: "St John Owasso", ...generateVariance() },
        { name: "St John Sapulpa", ...generateVariance() },
        { name: "St John Broken Arrow", ...generateVariance() },
        { name: "Jane Phillips Medical Center", ...generateVariance() },
      ],
    },
    "Tennessee": {
      "TNNAS": [
        { name: "AST DeKalb Hosp", ...generateVariance() },
        { name: "AST Hickman Hosp", ...generateVariance() },
        { name: "Saint Thomas Midtown", ...generateVariance() },
        { name: "Saint Thomas West", ...generateVariance() },
        { name: "Saint Thomas Rutherford", ...generateVariance() },
      ],
    },
    "Texas": {
      "TXAUS": [
        { name: "Asc Seton Williamson", ...generateVariance() },
        { name: "Dell Childrens MedCtr TX", ...generateVariance() },
        { name: "Seton Medical Center Austin", ...generateVariance() },
        { name: "Seton Northwest Hospital", ...generateVariance() },
        { name: "Seton Southwest Hospital", ...generateVariance() },
      ],
    },
    "Wisconsin": {
      "WIMIL": [
        { name: "All Saints Hospital", ...generateVariance() },
        { name: "CSM Milwaukee Hosp", ...generateVariance() },
      ],
    },
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

    // Show facilities when market is selected (group by submarket)
    if (selectedMarket !== "all-markets") {
      const marketData = varianceDataByLevel.facilities[selectedMarket as keyof typeof varianceDataByLevel.facilities];
      if (marketData) {
        const groups: GroupedVarianceData[] = [];

        // Iterate over submarkets
        Object.entries(marketData).forEach(([submarket, facilities]) => {
          if (facilities.length > 0) {
            const groupTotal = facilities.reduce((acc, curr) => ({
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
              children: facilities.map((f, idx) => ({
                ...f,
                type: 'skill' as const,
                id: `${submarket}-${idx}`,
              })),
            });
          }
        });

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
    <TableRow className="hover:bg-muted/30 bg-primary/5">
      <TableCell className="font-medium sticky left-0 bg-primary/5 pl-8 whitespace-nowrap">
        {row.name}
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
    <TableRow className="bg-muted/20 border-t-2 font-bold">
      <TableCell className="font-bold sticky left-0 bg-muted/20">
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
        <TableRow>
          <TableHead className="font-semibold sticky left-0 bg-card z-10 min-w-[200px]">{columnHeader}</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l-2 border-muted-foreground/30">CL Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l-2 border-muted-foreground/30">RN Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l-2 border-muted-foreground/30">PCT Skill</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l-2 border-muted-foreground/30">HUC</TableHead>
          <TableHead colSpan={3} className="text-center font-semibold border-l-2 border-muted-foreground/30">Overhead</TableHead>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableHead className="sticky left-0 bg-muted/50 z-10"></TableHead>
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
        <h2 className="text-2xl font-bold">Variance Analysis</h2>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex flex-col gap-0.5 text-sm">
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