import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const getVarianceColor = (value: number): string => {
    if (value < 0) return "text-green-600 dark:text-green-400";
    if (value > 0) return "text-red-600 dark:text-red-400";
    return "text-yellow-600 dark:text-yellow-400";
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold">FTE Skill Shift Variance Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Target vs Actual FTE by skill level
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Under Target (Surplus)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Over Target (Shortage)</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-lg border bg-card overflow-x-auto"
      >
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
                <TableCell className={`text-center font-semibold border-l ${getVarianceColor(row.clDay)}`}>
                  {row.clDay > 0 ? '+' : ''}{row.clDay.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.clNight)}`}>
                  {row.clNight > 0 ? '+' : ''}{row.clNight.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.clTotal)}`}>
                  {row.clTotal > 0 ? '+' : ''}{row.clTotal.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold border-l ${getVarianceColor(row.rnDay)}`}>
                  {row.rnDay > 0 ? '+' : ''}{row.rnDay.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.rnNight)}`}>
                  {row.rnNight > 0 ? '+' : ''}{row.rnNight.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.rnTotal)}`}>
                  {row.rnTotal > 0 ? '+' : ''}{row.rnTotal.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold border-l ${getVarianceColor(row.pctDay)}`}>
                  {row.pctDay > 0 ? '+' : ''}{row.pctDay.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.pctNight)}`}>
                  {row.pctNight > 0 ? '+' : ''}{row.pctNight.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.pctTotal)}`}>
                  {row.pctTotal > 0 ? '+' : ''}{row.pctTotal.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold border-l ${getVarianceColor(row.hucDay)}`}>
                  {row.hucDay > 0 ? '+' : ''}{row.hucDay.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.hucNight)}`}>
                  {row.hucNight > 0 ? '+' : ''}{row.hucNight.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.hucTotal)}`}>
                  {row.hucTotal > 0 ? '+' : ''}{row.hucTotal.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold border-l ${getVarianceColor(row.overheadDay)}`}>
                  {row.overheadDay > 0 ? '+' : ''}{row.overheadDay.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.overheadNight)}`}>
                  {row.overheadNight > 0 ? '+' : ''}{row.overheadNight.toFixed(1)}
                </TableCell>
                <TableCell className={`text-center font-semibold ${getVarianceColor(row.overheadTotal)}`}>
                  {row.overheadTotal > 0 ? '+' : ''}{row.overheadTotal.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}