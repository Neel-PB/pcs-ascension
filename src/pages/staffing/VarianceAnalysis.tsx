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

// Real hierarchical data with actual state names and hospital names
const varianceDataByLevel = {
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
    florida: [
      { name: "Ascension Sacred Heart Pensacola", ...generateVariance() },
      { name: "Studer Family Children's Hospital at Ascension Sacred Heart", ...generateVariance() },
      { name: "Ascension St. Vincent's Riverside", ...generateVariance() },
      { name: "Ascension St. Vincent's Southside", ...generateVariance() },
      { name: "Ascension St. Vincent's St. Clair's", ...generateVariance() },
      { name: "Ascension St. Vincent's Clay County", ...generateVariance() },
    ],
    illinois: [
      { name: "Ascension Illinois", ...generateVariance() },
    ],
    indiana: [
      { name: "Peyton Manning Children's Hospital at Ascension St. Vincent", ...generateVariance() },
      { name: "Ascension St. Vincent Indianapolis Hospital", ...generateVariance() },
      { name: "Ascension St. Vincent Heart Center of Indiana", ...generateVariance() },
      { name: "Ascension St. Vincent Kokomo", ...generateVariance() },
      { name: "Ascension St. Vincent Anderson", ...generateVariance() },
      { name: "Ascension St. Vincent Fishers", ...generateVariance() },
      { name: "Ascension St. Vincent Carmel Hospital", ...generateVariance() },
      { name: "Ascension St. Vincent Warrick", ...generateVariance() },
      { name: "Ascension St. Vincent Evansville", ...generateVariance() },
    ],
    kansas: [
      { name: "Ascension Via Christi Hospital Wichita", ...generateVariance() },
      { name: "Ascension Via Christi Hospital Pittsburg", ...generateVariance() },
      { name: "Ascension Via Christi St. Joseph", ...generateVariance() },
      { name: "Ascension Via Christi Hospital Manhattan", ...generateVariance() },
      { name: "Ascension Via Christi St. Teresa", ...generateVariance() },
    ],
    maryland: [
      { name: "Ascension St. Agnes Hospital", ...generateVariance() },
    ],
    oklahoma: [
      { name: "St. John Medical Center", ...generateVariance() },
      { name: "St. John Sapulpa", ...generateVariance() },
      { name: "St. John Owasso", ...generateVariance() },
      { name: "St. John Broken Arrow", ...generateVariance() },
      { name: "Jane Phillips Medical Center", ...generateVariance() },
    ],
    tennessee: [
      { name: "Ascension Saint Thomas Hospital Midtown", ...generateVariance() },
      { name: "Ascension Saint Thomas West Hospital", ...generateVariance() },
      { name: "Ascension Saint Thomas Rutherford Hospital", ...generateVariance() },
      { name: "Ascension Saint Thomas Hickman", ...generateVariance() },
      { name: "Ascension Saint Thomas DeKalb Hospital", ...generateVariance() },
      { name: "Ascension Saint Thomas Highlands Hospital", ...generateVariance() },
      { name: "Ascension Saint Thomas River Park Hospital", ...generateVariance() },
    ],
    texas: [
      { name: "Ascension Seton Medical Center Austin", ...generateVariance() },
      { name: "Ascension Seton Northwest", ...generateVariance() },
      { name: "Ascension Seton Southwest", ...generateVariance() },
      { name: "Dell Children's Medical Center", ...generateVariance() },
      { name: "Ascension Seton Hays", ...generateVariance() },
      { name: "Ascension Seton Williamson", ...generateVariance() },
      { name: "Ascension Seton Medical Center Harker Heights", ...generateVariance() },
      { name: "Ascension Providence", ...generateVariance() },
    ],
    wisconsin: [
      { name: "Ascension Columbia St. Mary's Hospital Milwaukee", ...generateVariance() },
      { name: "Ascension Columbia St. Mary's Hospital Ozaukee", ...generateVariance() },
    ],
  },
  departments: [
    { name: "Emergency", ...generateVariance() },
    { name: "ICU", ...generateVariance() },
    { name: "Surgery", ...generateVariance() },
    { name: "Cardiology", ...generateVariance() },
    { name: "Pediatrics", ...generateVariance() },
    { name: "Oncology", ...generateVariance() },
  ],
};

interface VarianceAnalysisProps {
  selectedRegion: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function VarianceAnalysis({
  selectedRegion,
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
    if (selectedRegion !== "all-regions") return "Facilities";
    return "Markets";
  };

  const getData = (): VarianceData[] => {
    // Show departments when facility is selected
    if (selectedFacility !== "all-facilities") {
      return varianceDataByLevel.departments;
    }

    // Show facilities when market (state) is selected
    if (selectedRegion !== "all-regions") {
      const stateKey = selectedRegion as keyof typeof varianceDataByLevel.facilities;
      if (varianceDataByLevel.facilities[stateKey]) {
        return varianceDataByLevel.facilities[stateKey];
      }
    }

    // Default: show all markets (states)
    return varianceDataByLevel.markets;
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
