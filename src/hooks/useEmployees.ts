import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseEmployeesProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

// Check for expired Active FTE overrides once per session
let hasCheckedExpiredFte = false;

export function useEmployees({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: UseEmployeesProps) {
  const hasInvoked = useRef(false);

  // Call the expiry check function once when component mounts
  useEffect(() => {
    if (!hasCheckedExpiredFte && !hasInvoked.current) {
      hasInvoked.current = true;
      hasCheckedExpiredFte = true;
      
      supabase.functions.invoke('check-expired-fte').then(({ data, error }) => {
        if (error) {
          console.error('Error checking expired FTE:', error);
        } else if (data?.count > 0 || data?.sharedExpiredCount > 0) {
          console.log(`Reverted ${data.count} expired FTE override(s), ${data.sharedExpiredCount} shared expiry(s)`);
        }
      });
    }
  }, []);

  return useQuery({
    queryKey: ["employees", selectedRegion, selectedMarket, selectedFacility, selectedDepartment],
    queryFn: async () => {
      let query = supabase
        .from("positions")
        .select("*")
        .eq("positionLifecycle", "Filled")
        .not("employmentFlag", "like", "%Contingent%");

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

      const { data, error } = await query.order("employeeName", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
