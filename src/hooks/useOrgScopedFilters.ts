import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserOrgAccess } from "./useUserOrgAccess";
import { useFilterData, type Facility, type Department } from "./useFilterData";
import { useRBAC } from "./useRBAC";

export interface OrgScopedFilterDefaults {
  market: string;
  facility: string;
  department: string;
}

export interface OrgScopedFilterOptions {
  availableMarkets: string[];
  availableFacilities: Facility[];
  availableDepartments: Department[];
}

export interface LockedFilters {
  market: boolean;
  facility: boolean;
  department: boolean;
}

export interface OrgScopedFiltersResult {
  // Default filter values based on org access
  defaultFilters: OrgScopedFilterDefaults;
  
  // Available options (filtered by org access)
  restrictedOptions: OrgScopedFilterOptions;
  
  // Which filters are locked (single assignment means locked)
  lockedFilters: LockedFilters;
  
  // Whether user has org access restrictions
  hasRestrictions: boolean;
  
  // Loading state
  isLoading: boolean;
  
  // Helper to check if a filter should show "All X" option
  shouldShowAllOption: (filterType: 'market' | 'facility' | 'department') => boolean;
}

export function useOrgScopedFilters(): OrgScopedFiltersResult {
  const { user } = useAuth();
  const { orgAccess, isLoading: orgLoading, hasUnrestrictedAccess } = useUserOrgAccess(user?.id);
  const { markets, facilities, departments, isLoading: filterLoading } = useFilterData();
  const { getFilterPermissions, loading: rbacLoading } = useRBAC();
  
  const filterPermissions = getFilterPermissions();
  
  const result = useMemo(() => {
    // Users with full access get no restrictions
    if (hasUnrestrictedAccess || !orgAccess) {
      return {
        defaultFilters: {
          market: "all-markets",
          facility: "all-facilities",
          department: "all-departments",
        },
        restrictedOptions: {
          availableMarkets: markets.map(m => m.market),
          availableFacilities: facilities,
          availableDepartments: departments,
        },
        lockedFilters: {
          market: false,
          facility: false,
          department: false,
        },
        hasRestrictions: false,
      };
    }
    
    // Extract unique values from org access
    const accessMarkets = [...new Set(orgAccess.markets.map(m => m.market))];
    const accessFacilities: Facility[] = [];
    const accessDepartments: Department[] = [];
    
    orgAccess.markets.forEach(market => {
      market.facilities.forEach(facility => {
        // Find the full facility object from filter data
        const fullFacility = facilities.find(f => f.facility_id === facility.facilityId);
        if (fullFacility && !accessFacilities.some(af => af.facility_id === fullFacility.facility_id)) {
          accessFacilities.push(fullFacility);
        }
        
        facility.departments.forEach(dept => {
          // Find the full department object from filter data
          const fullDept = departments.find(d => d.department_id === dept.departmentId);
          if (fullDept && !accessDepartments.some(ad => ad.department_id === fullDept.department_id)) {
            accessDepartments.push(fullDept);
          }
        });
      });
    });
    
    // Determine default values based on what user has access to
    // If they have single option at any level, pre-select it
    const defaultMarket = accessMarkets.length === 1 ? accessMarkets[0] : "all-markets";
    const defaultFacility = accessFacilities.length === 1 ? accessFacilities[0].facility_id : "all-facilities";
    const defaultDepartment = accessDepartments.length === 1 ? accessDepartments[0].department_id : "all-departments";
    
    // Lock filters if user has single option (no point changing it)
    const lockedMarket = accessMarkets.length === 1;
    const lockedFacility = accessFacilities.length === 1;
    const lockedDepartment = accessDepartments.length === 1;
    
    return {
      defaultFilters: {
        market: defaultMarket,
        facility: defaultFacility,
        department: defaultDepartment,
      },
      restrictedOptions: {
        availableMarkets: accessMarkets,
        availableFacilities: accessFacilities,
        availableDepartments: accessDepartments,
      },
      lockedFilters: {
        market: lockedMarket,
        facility: lockedFacility,
        department: lockedDepartment,
      },
      hasRestrictions: true,
    };
  }, [orgAccess, hasUnrestrictedAccess, markets, facilities, departments]);
  
  const shouldShowAllOption = (filterType: 'market' | 'facility' | 'department'): boolean => {
    // If user has restrictions and single option, don't show "All X"
    if (result.hasRestrictions) {
      if (filterType === 'market' && result.restrictedOptions.availableMarkets.length <= 1) return false;
      if (filterType === 'facility' && result.restrictedOptions.availableFacilities.length <= 1) return false;
      if (filterType === 'department' && result.restrictedOptions.availableDepartments.length <= 1) return false;
    }
    // Also don't show "All X" if user doesn't have permission for parent filter
    // This helps when user has facility permission but no market permission
    if (filterType === 'facility' && !filterPermissions.market && result.hasRestrictions) {
      return result.restrictedOptions.availableFacilities.length > 1;
    }
    if (filterType === 'department' && !filterPermissions.facility && result.hasRestrictions) {
      return result.restrictedOptions.availableDepartments.length > 1;
    }
    return true;
  };
  
  return {
    ...result,
    isLoading: orgLoading || filterLoading || rbacLoading,
    shouldShowAllOption,
  };
}
