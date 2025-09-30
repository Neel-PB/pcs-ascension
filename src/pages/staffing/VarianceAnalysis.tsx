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

// Sample hierarchical data
const varianceDataByLevel = {
  regions: [
    {
      name: "Northeast",
      clDay: -2.5, clNight: 1.2, clTotal: -1.3,
      rnDay: 3.4, rnNight: -1.8, rnTotal: 1.6,
      pctDay: -1.2, pctNight: 0.8, pctTotal: -0.4,
      hucDay: 2.1, hucNight: -0.5, hucTotal: 1.6,
      overheadDay: 0.3, overheadNight: 0.1, overheadTotal: 0.4,
    },
    {
      name: "Southeast",
      clDay: 1.8, clNight: -2.3, clTotal: -0.5,
      rnDay: -2.1, rnNight: 3.5, rnTotal: 1.4,
      pctDay: 0.9, pctNight: -1.5, pctTotal: -0.6,
      hucDay: -1.7, hucNight: 2.2, hucTotal: 0.5,
      overheadDay: -0.2, overheadNight: 0.4, overheadTotal: 0.2,
    },
    {
      name: "Midwest",
      clDay: -3.2, clNight: 0.7, clTotal: -2.5,
      rnDay: 2.8, rnNight: -1.2, rnTotal: 1.6,
      pctDay: -0.6, pctNight: 1.3, pctTotal: 0.7,
      hucDay: 1.5, hucNight: -0.8, hucTotal: 0.7,
      overheadDay: 0.1, overheadNight: -0.3, overheadTotal: -0.2,
    },
    {
      name: "West",
      clDay: 2.1, clNight: -1.6, clTotal: 0.5,
      rnDay: -1.5, rnNight: 2.9, rnTotal: 1.4,
      pctDay: 1.2, pctNight: -0.9, pctTotal: 0.3,
      hucDay: -2.3, hucNight: 1.7, hucTotal: -0.6,
      overheadDay: 0.5, overheadNight: -0.2, overheadTotal: 0.3,
    },
  ],
  markets: {
    "Northeast": [
      {
        name: "Boston",
        clDay: -1.5, clNight: 0.8, clTotal: -0.7,
        rnDay: 2.1, rnNight: -1.2, rnTotal: 0.9,
        pctDay: -0.8, pctNight: 0.5, pctTotal: -0.3,
        hucDay: 1.3, hucNight: -0.3, hucTotal: 1.0,
        overheadDay: 0.2, overheadNight: 0.1, overheadTotal: 0.3,
      },
      {
        name: "New York",
        clDay: -1.0, clNight: 0.4, clTotal: -0.6,
        rnDay: 1.3, rnNight: -0.6, rnTotal: 0.7,
        pctDay: -0.4, pctNight: 0.3, pctTotal: -0.1,
        hucDay: 0.8, hucNight: -0.2, hucTotal: 0.6,
        overheadDay: 0.1, overheadNight: 0.0, overheadTotal: 0.1,
      },
    ],
    "Southeast": [
      {
        name: "Atlanta",
        clDay: 0.9, clNight: -1.2, clTotal: -0.3,
        rnDay: -1.1, rnNight: 1.8, rnTotal: 0.7,
        pctDay: 0.5, pctNight: -0.8, pctTotal: -0.3,
        hucDay: -0.9, hucNight: 1.1, hucTotal: 0.2,
        overheadDay: -0.1, overheadNight: 0.2, overheadTotal: 0.1,
      },
      {
        name: "Pensacola",
        clDay: 0.9, clNight: -1.1, clTotal: -0.2,
        rnDay: -1.0, rnNight: 1.7, rnTotal: 0.7,
        pctDay: 0.4, pctNight: -0.7, pctTotal: -0.3,
        hucDay: -0.8, hucNight: 1.1, hucTotal: 0.3,
        overheadDay: -0.1, overheadNight: 0.2, overheadTotal: 0.1,
      },
    ],
    "Midwest": [
      {
        name: "Chicago",
        clDay: -1.6, clNight: 0.4, clTotal: -1.2,
        rnDay: 1.4, rnNight: -0.6, rnTotal: 0.8,
        pctDay: -0.3, pctNight: 0.7, pctTotal: 0.4,
        hucDay: 0.8, hucNight: -0.4, hucTotal: 0.4,
        overheadDay: 0.1, overheadNight: -0.2, overheadTotal: -0.1,
      },
      {
        name: "Minneapolis",
        clDay: -1.6, clNight: 0.3, clTotal: -1.3,
        rnDay: 1.4, rnNight: -0.6, rnTotal: 0.8,
        pctDay: -0.3, pctNight: 0.6, pctTotal: 0.3,
        hucDay: 0.7, hucNight: -0.4, hucTotal: 0.3,
        overheadDay: 0.0, overheadNight: -0.1, overheadTotal: -0.1,
      },
    ],
    "West": [
      {
        name: "Los Angeles",
        clDay: 1.1, clNight: -0.8, clTotal: 0.3,
        rnDay: -0.8, rnNight: 1.5, rnTotal: 0.7,
        pctDay: 0.6, pctNight: -0.5, pctTotal: 0.1,
        hucDay: -1.2, hucNight: 0.9, hucTotal: -0.3,
        overheadDay: 0.3, overheadNight: -0.1, overheadTotal: 0.2,
      },
      {
        name: "Seattle",
        clDay: 1.0, clNight: -0.8, clTotal: 0.2,
        rnDay: -0.7, rnNight: 1.4, rnTotal: 0.7,
        pctDay: 0.6, pctNight: -0.4, pctTotal: 0.2,
        hucDay: -1.1, hucNight: 0.8, hucTotal: -0.3,
        overheadDay: 0.2, overheadNight: -0.1, overheadTotal: 0.1,
      },
    ],
  },
  facilities: {
    "Pensacola": [
      {
        name: "Sacred Heart Pensacola",
        clDay: 0.5, clNight: -0.6, clTotal: -0.1,
        rnDay: -0.5, rnNight: 0.9, rnTotal: 0.4,
        pctDay: 0.2, pctNight: -0.4, pctTotal: -0.2,
        hucDay: -0.4, hucNight: 0.6, hucTotal: 0.2,
        overheadDay: 0.0, overheadNight: 0.1, overheadTotal: 0.1,
      },
      {
        name: "St. Vincent's",
        clDay: 0.4, clNight: -0.5, clTotal: -0.1,
        rnDay: -0.5, rnNight: 0.8, rnTotal: 0.3,
        pctDay: 0.2, pctNight: -0.3, pctTotal: -0.1,
        hucDay: -0.4, hucNight: 0.5, hucTotal: 0.1,
        overheadDay: -0.1, overheadNight: 0.1, overheadTotal: 0.0,
      },
    ],
    "Atlanta": [
      {
        name: "Atlanta Medical Center",
        clDay: 0.5, clNight: -0.6, clTotal: -0.1,
        rnDay: -0.6, rnNight: 0.9, rnTotal: 0.3,
        pctDay: 0.3, pctNight: -0.4, pctTotal: -0.1,
        hucDay: -0.5, hucNight: 0.6, hucTotal: 0.1,
        overheadDay: 0.0, overheadNight: 0.1, overheadTotal: 0.1,
      },
      {
        name: "Northside Hospital",
        clDay: 0.4, clNight: -0.6, clTotal: -0.2,
        rnDay: -0.5, rnNight: 0.9, rnTotal: 0.4,
        pctDay: 0.2, pctNight: -0.4, pctTotal: -0.2,
        hucDay: -0.4, hucNight: 0.5, hucTotal: 0.1,
        overheadDay: -0.1, overheadNight: 0.1, overheadTotal: 0.0,
      },
    ],
  },
  departments: {
    "Sacred Heart Pensacola": [
      {
        name: "Emergency",
        clDay: 0.3, clNight: -0.4, clTotal: -0.1,
        rnDay: -0.3, rnNight: 0.5, rnTotal: 0.2,
        pctDay: 0.1, pctNight: -0.2, pctTotal: -0.1,
        hucDay: -0.2, hucNight: 0.3, hucTotal: 0.1,
        overheadDay: 0.0, overheadNight: 0.1, overheadTotal: 0.1,
      },
      {
        name: "ICU",
        clDay: 0.2, clNight: -0.2, clTotal: 0.0,
        rnDay: -0.2, rnNight: 0.4, rnTotal: 0.2,
        pctDay: 0.1, pctNight: -0.2, pctTotal: -0.1,
        hucDay: -0.2, hucNight: 0.3, hucTotal: 0.1,
        overheadDay: 0.0, overheadNight: 0.0, overheadTotal: 0.0,
      },
      {
        name: "Surgery",
        clDay: 0.1, clNight: -0.1, clTotal: 0.0,
        rnDay: -0.1, rnNight: 0.2, rnTotal: 0.1,
        pctDay: 0.0, pctNight: -0.1, pctTotal: -0.1,
        hucDay: -0.1, hucNight: 0.1, hucTotal: 0.0,
        overheadDay: 0.0, overheadNight: 0.0, overheadTotal: 0.0,
      },
      {
        name: "Cardiology",
        clDay: -0.1, clNight: 0.1, clTotal: 0.0,
        rnDay: 0.1, rnNight: -0.2, rnTotal: -0.1,
        pctDay: 0.0, pctNight: 0.1, pctTotal: 0.1,
        hucDay: 0.1, hucNight: -0.1, hucTotal: 0.0,
        overheadDay: 0.0, overheadNight: 0.0, overheadTotal: 0.0,
      },
    ],
  },
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
      const facilityName = selectedFacility === "sacred-heart" ? "Sacred Heart Pensacola" : 
                           selectedFacility === "st-vincents" ? "St. Vincent's" :
                           selectedFacility === "atlanta-medical" ? "Atlanta Medical Center" :
                           selectedFacility === "northside" ? "Northside Hospital" : "";
      
      if (facilityName && varianceDataByLevel.departments[facilityName]) {
        return varianceDataByLevel.departments[facilityName];
      }
    }

    // Show facilities when market is selected
    if (selectedMarket !== "all-markets") {
      const marketName = selectedMarket === "pensacola" ? "Pensacola" :
                        selectedMarket === "atlanta" ? "Atlanta" : "";
      
      if (marketName && varianceDataByLevel.facilities[marketName]) {
        return varianceDataByLevel.facilities[marketName];
      }
    }

    // Show markets when region is selected
    if (selectedRegion !== "all-regions") {
      const regionName = selectedRegion === "northeast" ? "Northeast" :
                        selectedRegion === "southeast" ? "Southeast" :
                        selectedRegion === "midwest" ? "Midwest" :
                        selectedRegion === "west" ? "West" : "";
      
      if (regionName && varianceDataByLevel.markets[regionName]) {
        return varianceDataByLevel.markets[regionName];
      }
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
        className="rounded-lg border bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold sticky left-0 bg-card z-10">{columnHeader}</TableHead>
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
