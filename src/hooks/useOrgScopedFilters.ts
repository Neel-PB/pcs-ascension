import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserAccessScope, type AccessScopeFlat } from "./useUserOrgAccess";
import { useFilterData, type Facility, type Department } from "./useFilterData";

export interface AccessScopeFilterDefaults {
  region: string;
  market: string;
  facility: string;
  department: string;
}

export interface AccessScopeFilterOptions {
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

export interface AccessScopedFiltersResult {
  // Default filter values based on access scope
  defaultFilters: AccessScopeFilterDefaults;
  
  // Available options (filtered by access scope if applicable)
  restrictedOptions: AccessScopeFilterOptions;
  
  // Which filters are locked (single assignment means locked)
  lockedFilters: LockedFilters;
  
  // Whether user has ANY access scope restrictions
  hasRestrictions: boolean;
  
  // Per-level restriction check
  hasRestrictionAt: (level: 'region' | 'market' | 'facility' | 'department') => boolean;
  
  // Loading state
  isLoading: boolean;
  
  // Helper to check if a filter should show "All X" option
  shouldShowAllOption: (filterType: 'region' | 'market' | 'facility' | 'department') => boolean;
}

// Backward compatibility types
export type OrgScopedFilterDefaults = AccessScopeFilterDefaults;
export type OrgScopedFilterOptions = AccessScopeFilterOptions;
export type OrgScopedFiltersResult = AccessScopedFiltersResult;

export function useOrgScopedFilters(): AccessScopedFiltersResult {
  const { user } = useAuth();
  const { accessScope, isLoading: scopeLoading, hasUnrestrictedAccess } = useUserAccessScope(user?.id);
  const { regions, markets, facilities, departments, isLoading: filterLoading } = useFilterData();
  
  const result = useMemo(() => {
    // Users with full access get no restrictions
    if (hasUnrestrictedAccess || !accessScope) {
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
    
    // Build available options from flat access scope
    // Each level is independent - only filter if there ARE restrictions at that level
    
    // Regions - now fully supported in DB
    const availableRegions = accessScope.hasRegionRestriction 
      ? accessScope.regions 
      : regions.map(r => r.region);
    
    // Markets
    const availableMarkets = accessScope.hasMarketRestriction
      ? accessScope.markets
      : markets.map(m => m.market);
    
    // Facilities - map to full Facility objects from filter data
    // If filter data hasn't loaded yet but we have Access Scope, use Access Scope data directly
    const availableFacilities = accessScope.hasFacilityRestriction
      ? (facilities.length > 0 
          ? facilities.filter(f => 
              accessScope.facilities.some(of => of.facilityId === f.facility_id)
            )
          : accessScope.facilities.map(f => ({
              facility_id: f.facilityId,
              facility_name: f.facilityName,
              id: f.facilityId,
              market: '',
              region: null,
              submarket: null,
            }))
        )
      : facilities;
    
    // PRIORITY ORDER: Most specific assignment wins
    // Department > Facility > Market > Region
    const getAvailableDepartments = (): Department[] => {
      // PRIORITY 1: Department restrictions (most specific) - always wins
      if (accessScope.hasDepartmentRestriction) {
        if (departments.length > 0) {
          return departments.filter(d =>
            accessScope.departments.some(od => od.departmentId === d.department_id)
          );
        }
        // Fallback to access scope data if departments haven't loaded
        return accessScope.departments.map(d => ({
          department_id: d.departmentId,
          department_name: d.departmentName,
          id: d.departmentId,
          facility_id: d.facilityId || '',
        }));
      }
      
      // PRIORITY 2: Facility restrictions - show ALL departments in those facilities
      if (accessScope.hasFacilityRestriction) {
        const allowedFacilityIds = new Set(
          accessScope.facilities.map(f => f.facilityId)
        );
        return departments.filter(d => allowedFacilityIds.has(d.facility_id));
      }
      
      // PRIORITY 3: Market restrictions - show departments from facilities in those markets
      if (accessScope.hasMarketRestriction) {
        const allowedFacilityIds = new Set(
          facilities
            .filter(f => accessScope.markets.some(m => 
              m.toLowerCase() === f.market?.toLowerCase()
            ))
            .map(f => f.facility_id)
        );
        return departments.filter(d => allowedFacilityIds.has(d.facility_id));
      }
      
      // PRIORITY 4: Region restrictions - show departments from facilities in those regions
      if (accessScope.hasRegionRestriction) {
        const allowedFacilityIds = new Set(
          facilities
            .filter(f => f.region && accessScope.regions.some(r => 
              r.toLowerCase() === f.region?.toLowerCase()
            ))
            .map(f => f.facility_id)
        );
        return departments.filter(d => allowedFacilityIds.has(d.facility_id));
      }
      
      // No restrictions at any level
      return departments;
    };
    
    const availableDepartments = getAvailableDepartments();
    
    // Determine defaults - pre-select if only ONE option at that level
    const defaultRegion = availableRegions.length === 1 ? availableRegions[0] : "all-regions";
    const defaultMarket = availableMarkets.length === 1 ? availableMarkets[0] : "all-markets";
    const defaultFacility = availableFacilities.length === 1 ? availableFacilities[0].facility_id : "all-facilities";
    const defaultDepartment = availableDepartments.length === 1 ? availableDepartments[0].department_id : "all-departments";
    
    // Lock filters if user has exactly ONE option (no choice to make)
    const lockedRegion = accessScope.hasRegionRestriction && availableRegions.length === 1;
    const lockedMarket = accessScope.hasMarketRestriction && availableMarkets.length === 1;
    const lockedFacility = accessScope.hasFacilityRestriction && availableFacilities.length === 1;
    const lockedDepartment = accessScope.hasDepartmentRestriction && availableDepartments.length === 1;
    
    // Check if there are any restrictions at all
    const hasRestrictions = accessScope.hasRegionRestriction || 
                           accessScope.hasMarketRestriction || 
                           accessScope.hasFacilityRestriction || 
                           accessScope.hasDepartmentRestriction;
    
    const hasRestrictionAt = (level: 'region' | 'market' | 'facility' | 'department'): boolean => {
      switch (level) {
        case 'region': return accessScope.hasRegionRestriction;
        case 'market': return accessScope.hasMarketRestriction;
        case 'facility': return accessScope.hasFacilityRestriction;
        case 'department': return accessScope.hasDepartmentRestriction;
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
  }, [accessScope, hasUnrestrictedAccess, regions, markets, facilities, departments]);
  
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
    isLoading: scopeLoading || filterLoading,
    shouldShowAllOption,
  };
}
