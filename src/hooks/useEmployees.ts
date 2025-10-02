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
      let query = supabase
        .from("positions")
        .select("*")
        .not("employeeId", "is", null)
        .eq("positionStatus", "Active");

      // Apply filters
      if (selectedMarket && selectedMarket !== "all-markets") {
        query = query.eq("market", selectedMarket);
      }

      if (selectedFacility && selectedFacility !== "all-facilities") {
        query = query.eq("facilityId", selectedFacility);
      }

      if (selectedDepartment && selectedDepartment !== "all-departments") {
        query = query.eq("departmentId", selectedDepartment);
      }

      const { data, error } = await query.order("employeeName", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
