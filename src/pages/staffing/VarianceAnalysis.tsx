import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Maximize2 } from "lucide-react";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const getData = (): VarianceData[] => {
    // Show departments when facility is selected
    if (selectedFacility !== "all-facilities") {
      return varianceDataByLevel.departments;
    }

    // Show facilities when market (state) is selected
    if (selectedMarket !== "all-markets") {
      const facilityData = varianceDataByLevel.facilities[selectedMarket as keyof typeof varianceDataByLevel.facilities];
      if (facilityData) {
        return facilityData;
      }
    }

    // Show markets when region is selected
    if (selectedRegion !== "all-regions") {
      const marketsInRegion = regionMap[selectedRegion] || [];
      return varianceDataByLevel.markets.filter(m => marketsInRegion.includes(m.name));
    }

    // Default: show all regions
    return varianceDataByLevel.regions;
  };

  const data = getData();
  const columnHeader = getColumnHeader();

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
        {data.map((row, index) => (
          <TableRow key={index} className="hover:bg-muted/50">
            <TableCell className="font-medium sticky left-0 bg-card">{row.name}</TableCell>
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
        ))}
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Negative values indicate surplus, positive values indicate shortage</span>
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Negative values indicate surplus, positive values indicate shortage</span>
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