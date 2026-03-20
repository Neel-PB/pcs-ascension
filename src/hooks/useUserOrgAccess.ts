import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export interface AccessScopeFlat {
  regions: string[];
  markets: string[];
  facilities: { facilityId: string; facilityName: string }[];
  departments: { departmentId: string; departmentName: string; facilityId?: string }[];
  
  hasRegionRestriction: boolean;
  hasMarketRestriction: boolean;
  hasFacilityRestriction: boolean;
  hasDepartmentRestriction: boolean;
}

// Backward compatibility alias
export type OrgAccessFlat = AccessScopeFlat;

interface AccessAssignment {
  region?: string | null;
  market?: string | null;
  facility_id?: string | null;
  facility_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
}

export function useUserAccessScope(userId?: string) {
  const { data: accessScope, isLoading } = useQuery({
    queryKey: ['user-access-scope', userId],
    queryFn: async () => {
      if (!userId) return null;

      const data = await apiFetch<{ assignments: AccessAssignment[] }>(`/users/${userId}/access-scope`);
      const assignments = data.assignments || [];

      // If no assignments, user has unrestricted access
      if (assignments.length === 0) return null;

      const regions = new Set<string>();
      const markets = new Set<string>();
      const facilities = new Map<string, string>();
      const departments = new Map<string, { name: string; facilityId?: string }>();
      
      assignments.forEach((access) => {
        if (access.region) regions.add(access.region);
        if (access.market) markets.add(access.market);
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
    orgAccess: accessScope,
  };
}

// Backward compatibility alias
export const useUserOrgAccess = useUserAccessScope;
