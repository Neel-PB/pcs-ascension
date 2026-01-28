import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserOrgAccess, type OrgAccessFlat } from "./useUserOrgAccess";
import { useFilterData, type Facility, type Department } from "./useFilterData";

export interface OrgScopedFilterDefaults {
  region: string;
  market: string;
  facility: string;
  department: string;
}

export interface OrgScopedFilterOptions {
  availableRegions: string[];
  availableMarkets: string[];
  availableFacilities: Facility[];
  availableDepartments: Department[];
}

export interface LockedFilters {
  region: boolean;
  market: boolean;
  facility: boolean;
  department: boolean;
}

export interface OrgScopedFiltersResult {
  // Default filter values based on org access
  defaultFilters: OrgScopedFilterDefaults;
  
  // Available options (filtered by org access if applicable)
  restrictedOptions: OrgScopedFilterOptions;
  
  // Which filters are locked (single assignment means locked)
  lockedFilters: LockedFilters;
  
  // Whether user has ANY org access restrictions
  hasRestrictions: boolean;
  
  // Per-level restriction check
  hasRestrictionAt: (level: 'region' | 'market' | 'facility' | 'department') => boolean;
  
  // Loading state
  isLoading: boolean;
  
  // Helper to check if a filter should show "All X" option
  shouldShowAllOption: (filterType: 'region' | 'market' | 'facility' | 'department') => boolean;
}

export function useOrgScopedFilters(): OrgScopedFiltersResult {
  const { user } = useAuth();
  const { orgAccess, isLoading: orgLoading, hasUnrestrictedAccess } = useUserOrgAccess(user?.id);
  const { regions, markets, facilities, departments, isLoading: filterLoading } = useFilterData();
  
  const result = useMemo(() => {
    // Users with full access get no restrictions
    if (hasUnrestrictedAccess || !orgAccess) {
      return {
        defaultFilters: {
          region: "all-regions",
          market: "all-markets",
          facility: "all-facilities",
          department: "all-departments",
        },
        restrictedOptions: {
          availableRegions: regions.map(r => r.region),
          availableMarkets: markets.map(m => m.market),
          availableFacilities: facilities,
          availableDepartments: departments,
        },
        lockedFilters: {
          region: false,
          market: false,
          facility: false,
          department: false,
        },
        hasRestrictions: false,
        hasRestrictionAt: () => false,
      };
    }
    
    // Build available options from flat org access
    // Each level is independent - only filter if there ARE restrictions at that level
    
    // Regions - now fully supported in DB
    const availableRegions = orgAccess.hasRegionRestriction 
      ? orgAccess.regions 
      : regions.map(r => r.region);
    
    // Markets
    const availableMarkets = orgAccess.hasMarketRestriction
      ? orgAccess.markets
      : markets.map(m => m.market);
    
    // Facilities - map to full Facility objects from filter data
    const availableFacilities = orgAccess.hasFacilityRestriction
      ? facilities.filter(f => 
          orgAccess.facilities.some(of => of.facilityId === f.facility_id)
        )
      : facilities;
    
    // Departments - map to full Department objects from filter data
    const availableDepartments = orgAccess.hasDepartmentRestriction
      ? departments.filter(d =>
          orgAccess.departments.some(od => od.departmentId === d.department_id)
        )
      : departments;
    
    // Determine defaults - pre-select if only ONE option at that level
    const defaultRegion = availableRegions.length === 1 ? availableRegions[0] : "all-regions";
    const defaultMarket = availableMarkets.length === 1 ? availableMarkets[0] : "all-markets";
    const defaultFacility = availableFacilities.length === 1 ? availableFacilities[0].facility_id : "all-facilities";
    const defaultDepartment = availableDepartments.length === 1 ? availableDepartments[0].department_id : "all-departments";
    
    // Lock filters if user has exactly ONE option (no choice to make)
    const lockedRegion = orgAccess.hasRegionRestriction && availableRegions.length === 1;
    const lockedMarket = orgAccess.hasMarketRestriction && availableMarkets.length === 1;
    const lockedFacility = orgAccess.hasFacilityRestriction && availableFacilities.length === 1;
    const lockedDepartment = orgAccess.hasDepartmentRestriction && availableDepartments.length === 1;
    
    // Check if there are any restrictions at all
    const hasRestrictions = orgAccess.hasRegionRestriction || 
                           orgAccess.hasMarketRestriction || 
                           orgAccess.hasFacilityRestriction || 
                           orgAccess.hasDepartmentRestriction;
    
    const hasRestrictionAt = (level: 'region' | 'market' | 'facility' | 'department'): boolean => {
      switch (level) {
        case 'region': return orgAccess.hasRegionRestriction;
        case 'market': return orgAccess.hasMarketRestriction;
        case 'facility': return orgAccess.hasFacilityRestriction;
        case 'department': return orgAccess.hasDepartmentRestriction;
        default: return false;
      }
    };
    
    return {
      defaultFilters: {
        region: defaultRegion,
        market: defaultMarket,
        facility: defaultFacility,
        department: defaultDepartment,
      },
      restrictedOptions: {
        availableRegions,
        availableMarkets,
        availableFacilities,
        availableDepartments,
      },
      lockedFilters: {
        region: lockedRegion,
        market: lockedMarket,
        facility: lockedFacility,
        department: lockedDepartment,
      },
      hasRestrictions,
      hasRestrictionAt,
    };
  }, [orgAccess, hasUnrestrictedAccess, regions, markets, facilities, departments]);
  
  const shouldShowAllOption = (filterType: 'region' | 'market' | 'facility' | 'department'): boolean => {
    // Don't show "All X" if user has restrictions at this level AND only has 1 option
    if (result.hasRestrictions && result.hasRestrictionAt(filterType)) {
      switch (filterType) {
        case 'region': return result.restrictedOptions.availableRegions.length > 1;
        case 'market': return result.restrictedOptions.availableMarkets.length > 1;
        case 'facility': return result.restrictedOptions.availableFacilities.length > 1;
        case 'department': return result.restrictedOptions.availableDepartments.length > 1;
      }
    }
    return true;
  };
  
  return {
    ...result,
    isLoading: orgLoading || filterLoading,
    shouldShowAllOption,
  };
}
