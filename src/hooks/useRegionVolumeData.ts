import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth } from "date-fns";

export interface CombinedMonthlyVolume {
  month: string;
  region1: number;
  region2: number;
}

export interface RegionVolumeData {
  combinedData: CombinedMonthlyVolume[];
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
      const region1Map: Record<string, number> = {};
      const region2Map: Record<string, number> = {};

      months.forEach((m) => {
        region1Map[m] = 0;
        region2Map[m] = 0;
      });

      // Aggregate volumes by region and month
      laborData?.forEach((record) => {
        if (!record.month || record.volume === null) return;

        const monthKey = format(new Date(record.month), "MMM yyyy");
        const region = marketToRegion[record.market] || "Unknown";
        const volume = Number(record.volume) || 0;

        if (region1Map[monthKey] !== undefined) {
          if (region === "Region 1") {
            region1Map[monthKey] += volume;
          } else if (region === "Region 2") {
            region2Map[monthKey] += volume;
          }
        }
      });

      // Convert to combined array format for multi-line chart
      const combinedData: CombinedMonthlyVolume[] = months.map((month) => ({
        month,
        region1: region1Map[month],
        region2: region2Map[month],
      }));

      return { combinedData };
    },
  });

  return {
    combinedData: data?.combinedData || [],
    isLoading,
    error: error as Error | null,
  };
}
