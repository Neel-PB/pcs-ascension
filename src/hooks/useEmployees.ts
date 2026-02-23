import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseEmployeesProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function useEmployees({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: UseEmployeesProps) {
  return useQuery({
    queryKey: ["employees", selectedRegion, selectedMarket, selectedFacility, selectedDepartment],
    queryFn: async () => {
      const buildQuery = (opts?: { count?: "exact"; head?: boolean }) => {
        let q = supabase
          .from("positions")
          .select("*", opts?.count ? { count: opts.count, head: opts.head } : undefined)
          .eq("positionLifecycle", "Filled")
          .not("employmentFlag", "like", "%Contingent%");

        if (selectedMarket && selectedMarket !== "all-markets") {
          q = q.ilike("market", selectedMarket);
        }
        if (selectedFacility && selectedFacility !== "all-facilities") {
          q = q.eq("facilityId", selectedFacility);
        }
        if (selectedDepartment && selectedDepartment !== "all-departments") {
          q = q.eq("departmentId", selectedDepartment);
        }
        return q;
      };

      // Get exact count first
      const { count, error: countError } = await buildQuery({ count: "exact", head: true });
      if (countError) throw countError;
      if (!count || count === 0) return [];

      // Fetch all rows in batches of 1000
      const PAGE_SIZE = 1000;
      const pages = Math.ceil(count / PAGE_SIZE);
      const allData: any[] = [];

      for (let i = 0; i < pages; i++) {
        const { data, error } = await buildQuery()
          .range(i * PAGE_SIZE, (i + 1) * PAGE_SIZE - 1)
          .order("employeeName", { ascending: true });

        if (error) throw error;
        if (data) allData.push(...data);
      }

      return allData;
    },
  });
}
