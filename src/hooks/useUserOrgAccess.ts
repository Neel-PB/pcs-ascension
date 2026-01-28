import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Facility, Department } from "./useFilterData";

export interface AccessScopeFlat {
  regions: string[];
  markets: string[];
  facilities: { facilityId: string; facilityName: string }[];
  departments: { departmentId: string; departmentName: string; facilityId?: string }[];
  
  // Quick lookup flags - true means there ARE restrictions at this level
  hasRegionRestriction: boolean;
  hasMarketRestriction: boolean;
  hasFacilityRestriction: boolean;
  hasDepartmentRestriction: boolean;
}

// Backward compatibility alias
export type OrgAccessFlat = AccessScopeFlat;

export function useUserAccessScope(userId?: string) {
  const { data: accessScope, isLoading } = useQuery({
    queryKey: ['user-access-scope', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_organization_access')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // If no records, user has access to all (no restrictions)
      if (!data || data.length === 0) {
        return null;
      }

      // Extract unique values at each level independently (FLAT structure)
      const regions = new Set<string>();
      const markets = new Set<string>();
      const facilities = new Map<string, string>(); // facilityId -> facilityName
      const departments = new Map<string, { name: string; facilityId?: string }>(); // departmentId -> {name, facilityId}
      
      data.forEach((access) => {
        // Handle region field
        if (access.region) {
          regions.add(access.region);
        }
        
        if (access.market) {
          markets.add(access.market);
        }
        
        if (access.facility_id && access.facility_name) {
          facilities.set(access.facility_id, access.facility_name);
        }
        
        if (access.department_id && access.department_name) {
          departments.set(access.department_id, {
            name: access.department_name,
            facilityId: access.facility_id || undefined,
          });
        }
      });

      const flatAccess: AccessScopeFlat = {
        regions: Array.from(regions),
        markets: Array.from(markets),
        facilities: Array.from(facilities.entries()).map(([facilityId, facilityName]) => ({
          facilityId,
          facilityName,
        })),
        departments: Array.from(departments.entries()).map(([departmentId, { name, facilityId }]) => ({
          departmentId,
          departmentName: name,
          facilityId,
        })),
        
        // Restriction flags: true if there are specific assignments at this level
        hasRegionRestriction: regions.size > 0,
        hasMarketRestriction: markets.size > 0,
        hasFacilityRestriction: facilities.size > 0,
        hasDepartmentRestriction: departments.size > 0,
      };

      return flatAccess;
    },
    enabled: !!userId,
  });

  return {
    accessScope,
    isLoading,
    hasUnrestrictedAccess: accessScope === null,
    // Backward compatibility aliases
    orgAccess: accessScope,
  };
}

// Backward compatibility alias
export const useUserOrgAccess = useUserAccessScope;
