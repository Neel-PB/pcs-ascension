import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth } from "date-fns";

interface MonthlyVolume {
  month: string;
  volume: number;
}

interface RegionVolumeData {
  allRegionsData: MonthlyVolume[];
  region1Data: MonthlyVolume[];
  region2Data: MonthlyVolume[];
  isLoading: boolean;
  error: Error | null;
}

// Market to Region mapping
const marketToRegion: Record<string, string> = {
  "Baltimore": "Region 1",
  "Florida": "Region 1",
  "Illinois": "Region 1",
  "Indiana": "Region 1",
  "Kansas": "Region 2",
  "Oklahoma": "Region 2",
  "Tennessee": "Region 2",
  "Texas": "Region 2",
  "Wisconsin": "Region 2",
};

export function useRegionVolumeData(): RegionVolumeData {
  const { data, isLoading, error } = useQuery({
    queryKey: ["region-volume-data"],
    queryFn: async () => {
      // Calculate date range for last 12 months
      const now = new Date();
      const startDate = startOfMonth(subMonths(now, 11));

      const { data: laborData, error } = await supabase
        .from("labor_performance")
        .select("market, volume, month")
        .gte("month", startDate.toISOString())
        .order("month", { ascending: true });

      if (error) throw error;

      // Generate all 12 months for consistent x-axis
      const months: string[] = [];
      for (let i = 11; i >= 0; i--) {
        months.push(format(subMonths(now, i), "MMM yyyy"));
      }

      // Initialize data structures
      const allRegionsMap: Record<string, number> = {};
      const region1Map: Record<string, number> = {};
      const region2Map: Record<string, number> = {};

      months.forEach((m) => {
        allRegionsMap[m] = 0;
        region1Map[m] = 0;
        region2Map[m] = 0;
      });

      // Aggregate volumes by region and month
      laborData?.forEach((record) => {
        if (!record.month || record.volume === null) return;

        const monthKey = format(new Date(record.month), "MMM yyyy");
        const region = marketToRegion[record.market] || "Unknown";
        const volume = Number(record.volume) || 0;

        if (allRegionsMap[monthKey] !== undefined) {
          allRegionsMap[monthKey] += volume;

          if (region === "Region 1") {
            region1Map[monthKey] += volume;
          } else if (region === "Region 2") {
            region2Map[monthKey] += volume;
          }
        }
      });

      // Convert to array format for recharts
      const allRegionsData = months.map((month) => ({
        month,
        volume: allRegionsMap[month],
      }));

      const region1Data = months.map((month) => ({
        month,
        volume: region1Map[month],
      }));

      const region2Data = months.map((month) => ({
        month,
        volume: region2Map[month],
      }));

      return { allRegionsData, region1Data, region2Data };
    },
  });

  return {
    allRegionsData: data?.allRegionsData || [],
    region1Data: data?.region1Data || [],
    region2Data: data?.region2Data || [],
    isLoading,
    error: error as Error | null,
  };
}
