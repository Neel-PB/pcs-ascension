import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseRequisitionsProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function useRequisitions({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: UseRequisitionsProps) {
  return useQuery({
    queryKey: ["requisitions", selectedRegion, selectedMarket, selectedFacility, selectedDepartment],
    queryFn: async () => {
      let query = supabase
        .from("positions")
        .select("*")
        .neq("positionLifecycle", "Filled");

      // Apply filters - use ilike for case-insensitive market matching
      if (selectedMarket && selectedMarket !== "all-markets") {
        query = query.ilike("market", selectedMarket);
      }

      if (selectedFacility && selectedFacility !== "all-facilities") {
        query = query.eq("facilityId", selectedFacility);
      }

      if (selectedDepartment && selectedDepartment !== "all-departments") {
        query = query.eq("departmentId", selectedDepartment);
      }

      const { data, error } = await query.order("positionStatusDate", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
