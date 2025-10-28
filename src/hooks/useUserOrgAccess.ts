import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrgAccessHierarchy {
  markets: {
    market: string;
    facilities: {
      facilityId: string;
      facilityName: string;
      departments: {
        departmentId: string;
        departmentName: string;
      }[];
    }[];
  }[];
}

export function useUserOrgAccess(userId?: string) {
  const { data: orgAccess, isLoading } = useQuery({
    queryKey: ['user-org-access', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_organization_access')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // If no records, user has access to all
      if (!data || data.length === 0) {
        return null;
      }

      // Format into hierarchical structure
      const hierarchy: OrgAccessHierarchy = { markets: [] };
      
      data.forEach((access) => {
        if (!access.market) return;

        // Find or create market
        let marketEntry = hierarchy.markets.find(m => m.market === access.market);
        if (!marketEntry) {
          marketEntry = { market: access.market, facilities: [] };
          hierarchy.markets.push(marketEntry);
        }

        // Find or create facility
        if (access.facility_id && access.facility_name) {
          let facilityEntry = marketEntry.facilities.find(
            f => f.facilityId === access.facility_id
          );
          if (!facilityEntry) {
            facilityEntry = {
              facilityId: access.facility_id,
              facilityName: access.facility_name,
              departments: []
            };
            marketEntry.facilities.push(facilityEntry);
          }

          // Add department if exists
          if (access.department_id && access.department_name) {
            const deptExists = facilityEntry.departments.some(
              d => d.departmentId === access.department_id
            );
            if (!deptExists) {
              facilityEntry.departments.push({
                departmentId: access.department_id,
                departmentName: access.department_name
              });
            }
          }
        }
      });

      return hierarchy;
    },
    enabled: !!userId,
  });

  return {
    orgAccess,
    isLoading,
    hasUnrestrictedAccess: orgAccess === null
  };
}
