import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Lock, Loader2 } from "lucide-react";
import { useFilterData } from "@/hooks/useFilterData";
import { useIsCompactScreen } from "@/hooks/use-compact-screen";
import { CombinedOptionalFilters } from "./CombinedOptionalFilters";
import { useRBAC } from "@/hooks/useRBAC";
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FilterBarProps {
  className?: string;
  onRegionChange?: (value: string) => void;
  onMarketChange?: (value: string) => void;
  onFacilityChange?: (value: string) => void;
  onSubmarketChange?: (value: string) => void;
  onPstatChange?: (value: string) => void;
  onLevel2Change?: (value: string) => void;
  onDepartmentChange?: (value: string) => void;
  onClearFilters?: () => void;
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedSubmarket?: string;
  selectedPstat?: string;
  selectedLevel2?: string;
  selectedDepartment?: string;
}

export function FilterBar({ 
  className,
  onRegionChange,
  onMarketChange,
  onFacilityChange,
  onSubmarketChange,
  onPstatChange,
  onLevel2Change,
  onDepartmentChange,
  onClearFilters,
  selectedRegion = "all-regions",
  selectedMarket = "all-markets",
  selectedFacility = "all-facilities",
  selectedSubmarket = "all-submarkets",
  selectedPstat = "all-pstat",
  selectedLevel2 = "all-level2",
  selectedDepartment = "all-departments",
}: FilterBarProps) {
  const { 
    regions, 
    markets: allMarkets,
    facilities: allFacilities,
    departments: allDepartments,
    getMarketsByRegion, 
    getFacilitiesByMarket, 
    getDepartmentsByFacility,
    getSubmarketsByMarket,
    regionsLoading,
    marketsLoading,
    facilitiesLoading,
    departmentsLoading,
  } = useFilterData();
  
  const { 
    restrictedOptions, 
    lockedFilters, 
    hasRestrictions, 
    hasRestrictionAt,
    shouldShowAllOption,
  } = useOrgScopedFilters();

  const isCompact = useIsCompactScreen();
  const { getFilterPermissions, getSubfilterPermissions, loading: rbacLoading } = useRBAC();
  
  // During loading, show all filters to prevent layout shift
  const filterPermissions = rbacLoading 
    ? { region: true, market: true, facility: true, department: true }
    : getFilterPermissions();
    
  const subfilterPermissions = rbacLoading
    ? { submarket: true, level2: true, pstat: true }
    : getSubfilterPermissions();

  // PSTAT Options
  const pstatOptions = [
    "P Patient DaysAndObservation",
    "P Total Adjusted Discharges",
    "P PatientDaysObservNewbornDays",
    "P Total Pat Days Obs",
    "P Procedures",
    "P Cases",
    "P Calendar Days",
    "P BTUs",
    "P Worked RVUs",
  ].sort();

  // Level 2 Options
  const level2Options = [
    "LngTrmAcuteCareLTACH",
    "NrsngPsychiatricCare",
    "Nursing Acute Care",
    "Nursing Rehab Acute Care",
    "NursingIntensiveCare",
    "Skilled Nursing Care",
  ].sort();

  // Get available options based on org restrictions OR full data
  // For markets: use restricted if user has market restrictions, otherwise cascade from region
  const availableMarkets = hasRestrictionAt('market')
    ? restrictedOptions.availableMarkets.map(m => ({ id: m, market: m }))
    : getMarketsByRegion(selectedRegion);

  // For facilities: use restricted if user has facility restrictions
  // Otherwise, if market is selected cascade from market
  // If user has market restrictions and no specific market selected, filter by allowed markets
  const getAvailableFacilities = () => {
    if (hasRestrictionAt('facility')) {
      return restrictedOptions.availableFacilities;
    }
    if (selectedMarket !== "all-markets") {
      return getFacilitiesByMarket(selectedMarket);
    }
    // When "All Markets" is selected, but user has market restrictions, filter facilities by allowed markets
    if (hasRestrictionAt('market')) {
      return allFacilities.filter(f => 
        restrictedOptions.availableMarkets.some(m => 
          m.toLowerCase() === f.market?.toLowerCase()
        )
      );
    }
    return allFacilities;
  };
  const availableFacilities = getAvailableFacilities();

  // Get unique department names when no facility is selected (to avoid duplicates like "ICU" x14)
  const uniqueDepartmentNames = useMemo(() => {
    const names = new Set<string>();
    allDepartments.forEach(d => names.add(d.department_name));
    return Array.from(names).sort();
  }, [allDepartments]);

  // PRIORITY ORDER for departments: Most specific wins
  // Department > Facility > Market > Region
  // IMPORTANT: Access Scope restrictions ALWAYS take priority over UI selections
  const getAvailableDepartments = () => {
    // PRIORITY 1: Department restrictions (most specific) - ALWAYS wins over UI selection
    if (hasRestrictionAt('department')) {
      return restrictedOptions.availableDepartments;
    }
    
    // When a specific facility is selected in the UI, cascade from that selection
    if (selectedFacility !== "all-facilities") {
      return getDepartmentsByFacility(selectedFacility);
    }
    
    // PRIORITY 2: Facility restrictions - show ALL departments in those facilities
    
    // PRIORITY 2: Facility restrictions - show ALL departments in those facilities
    if (hasRestrictionAt('facility')) {
      const allowedFacilityIds = new Set(
        restrictedOptions.availableFacilities.map(f => f.facility_id)
      );
      const filteredDepts = allDepartments.filter(d => 
        allowedFacilityIds.has(d.facility_id)
      );
      const seenNames = new Map<string, { department_id: string; department_name: string }>();
      filteredDepts.forEach(d => {
        if (!seenNames.has(d.department_name)) {
          seenNames.set(d.department_name, {
            department_id: d.department_id,
            department_name: d.department_name
          });
        }
      });
      return Array.from(seenNames.values()).sort((a, b) => 
        a.department_name.localeCompare(b.department_name)
      );
    }
    
    // PRIORITY 3: Market restrictions - show departments from facilities in those markets
    if (hasRestrictionAt('market')) {
      const allowedFacilityIds = new Set(
        allFacilities
          .filter(f => restrictedOptions.availableMarkets.some(m => 
            m.toLowerCase() === f.market?.toLowerCase()
          ))
          .map(f => f.facility_id)
      );
      const filteredDepts = allDepartments.filter(d => allowedFacilityIds.has(d.facility_id));
      const seenNames = new Map<string, { department_id: string; department_name: string }>();
      filteredDepts.forEach(d => {
        if (!seenNames.has(d.department_name)) {
          seenNames.set(d.department_name, {
            department_id: d.department_id,
            department_name: d.department_name
          });
        }
      });
      return Array.from(seenNames.values()).sort((a, b) => 
        a.department_name.localeCompare(b.department_name)
      );
    }
    
    // PRIORITY 4: Region restrictions - show departments from facilities in those regions
    if (hasRestrictionAt('region')) {
      const allowedFacilityIds = new Set(
        allFacilities
          .filter(f => f.region && restrictedOptions.availableRegions.some(r => 
            r.toLowerCase() === f.region?.toLowerCase()
          ))
          .map(f => f.facility_id)
      );
      const filteredDepts = allDepartments.filter(d => allowedFacilityIds.has(d.facility_id));
      const seenNames = new Map<string, { department_id: string; department_name: string }>();
      filteredDepts.forEach(d => {
        if (!seenNames.has(d.department_name)) {
          seenNames.set(d.department_name, {
            department_id: d.department_id,
            department_name: d.department_name
          });
        }
      });
      return Array.from(seenNames.values()).sort((a, b) => 
        a.department_name.localeCompare(b.department_name)
      );
    }
    
    // No restrictions - show all unique department names with real IDs
    const seenNames = new Map<string, { department_id: string; department_name: string }>();
    allDepartments.forEach(d => {
      if (!seenNames.has(d.department_name)) {
        seenNames.set(d.department_name, {
          department_id: d.department_id,
          department_name: d.department_name
        });
      }
    });
    return Array.from(seenNames.values()).sort((a, b) => 
      a.department_name.localeCompare(b.department_name)
    );
  };
  const availableDepartments = getAvailableDepartments();

  // Get available submarkets based on selected market
  const availableSubmarkets = getSubmarketsByMarket(selectedMarket);
  
  // ONLY disable if filter is LOCKED (single option) - NEVER disable based on parent selection
  const isRegionDisabled = lockedFilters.region;
  const isMarketDisabled = lockedFilters.market;
  const isFacilityDisabled = lockedFilters.facility;
  const isDepartmentDisabled = lockedFilters.department;

  // Check if any filters are active (not in default state)
  const hasActiveFilters = 
    selectedRegion !== "all-regions" ||
    selectedMarket !== "all-markets" ||
    selectedFacility !== "all-facilities" ||
    selectedSubmarket !== "all-submarkets" ||
    selectedPstat !== "all-pstat" ||
    selectedLevel2 !== "all-level2" ||
    selectedDepartment !== "all-departments";

  return (
    <div className="flex items-center justify-center overflow-x-auto flex-nowrap gap-2 xl:gap-0 scrollbar-thin">
      {/* LEFT GROUP: Main Hierarchy Filters + Clear Button */}
      <div className={`flex flex-wrap xl:flex-nowrap gap-2 xl:gap-3 items-center ${className}`}>
        {/* Region Filter - only show if user has permission */}
        {filterPermissions.region && (
          <div className="relative">
            <Select value={selectedRegion} onValueChange={onRegionChange} disabled={isRegionDisabled}>
              <SelectTrigger className={`${isCompact ? 'min-w-[120px] flex-shrink' : 'w-[150px]'} bg-background border-border ${isRegionDisabled ? 'pr-8' : ''}`}>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {regionsLoading ? (
                  <div className="py-3 px-2 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    {(shouldShowAllOption('region') || selectedRegion === 'all-regions') && (
                      <SelectItem value="all-regions">All Regions</SelectItem>
                    )}
                    {(hasRestrictionAt('region') ? restrictedOptions.availableRegions : regions.map(r => r.region)).map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {isRegionDisabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Assigned by administrator</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Market Filter - only show if user has permission */}
        {filterPermissions.market && (
          <div className="relative">
            <Select value={selectedMarket} onValueChange={onMarketChange} disabled={isMarketDisabled}>
              <SelectTrigger className={`${isCompact ? 'min-w-[120px] flex-shrink' : 'w-[150px]'} bg-background border-border ${isMarketDisabled ? 'pr-8' : ''}`}>
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {marketsLoading ? (
                  <div className="py-3 px-2 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    {(shouldShowAllOption('market') || selectedMarket === 'all-markets') && (
                      <SelectItem value="all-markets">All Markets</SelectItem>
                    )}
                    {availableMarkets.map(market => (
                      <SelectItem key={market.id} value={market.market}>{market.market}</SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {isMarketDisabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Assigned by administrator</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Facility Filter - only show if user has permission */}
        {filterPermissions.facility && (
          <div className="relative">
            <Select 
              value={selectedFacility} 
              onValueChange={onFacilityChange}
              disabled={isFacilityDisabled}
            >
              <SelectTrigger className={`${isCompact ? 'min-w-[160px] flex-shrink' : 'w-[250px]'} bg-background border-border ${isFacilityDisabled ? 'pr-8' : ''}`}>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50 min-w-[350px]">
                {facilitiesLoading ? (
                  <div className="py-3 px-2 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    {(shouldShowAllOption('facility') || selectedFacility === 'all-facilities') && (
                      <SelectItem value="all-facilities">All Facilities</SelectItem>
                    )}
                    {availableFacilities.map(facility => (
                      <SelectItem key={facility.facility_id || facility.id} value={facility.facility_id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="truncate">{facility.facility_name}</span>
                          <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {facility.facility_id}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {isFacilityDisabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Assigned by administrator</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Department Filter - only show if user has permission */}
        {filterPermissions.department && (
          <div className="relative">
            <Select 
              value={selectedDepartment} 
              onValueChange={onDepartmentChange}
              disabled={isDepartmentDisabled}
            >
              <SelectTrigger className={`${isCompact ? 'min-w-[140px] flex-shrink' : 'w-[180px]'} bg-background border-border ${isDepartmentDisabled ? 'pr-8' : ''}`}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50 min-w-[280px]">
                {departmentsLoading ? (
                  <div className="py-3 px-2 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    {(shouldShowAllOption('department') || selectedDepartment === 'all-departments') && (
                      <SelectItem value="all-departments">All Departments</SelectItem>
                    )}
                    {availableDepartments.map(dept => (
                      <SelectItem key={dept.department_id} value={dept.department_id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="truncate">{dept.department_name}</span>
                          <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {dept.department_id}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {isDepartmentDisabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Assigned by administrator</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Clear Filters Button - always visible, disabled when no filters active */}
        <Button
          variant="ascension"
          size="icon"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="h-9 w-9 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Clear all filters"
          aria-label="Clear all filters"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* SEPARATOR - hidden on compact screens, only show if any sub-filter is accessible */}
      {(subfilterPermissions.submarket || subfilterPermissions.level2 || subfilterPermissions.pstat) && (
        <div className="hidden xl:block h-10 w-[2px] bg-border/60 mx-6" />
      )}

      {/* RIGHT GROUP: Optional Filters - only show filters user has permission for */}
      {(subfilterPermissions.submarket || subfilterPermissions.level2 || subfilterPermissions.pstat) && (
        isCompact ? (
          <CombinedOptionalFilters
            selectedSubmarket={selectedSubmarket}
            selectedLevel2={selectedLevel2}
            selectedPstat={selectedPstat}
            onSubmarketChange={onSubmarketChange}
            onLevel2Change={onLevel2Change}
            onPstatChange={onPstatChange}
            submarketOptions={availableSubmarkets}
            level2Options={level2Options}
            pstatOptions={pstatOptions}
            submarketDisabled={selectedMarket === "all-markets" || availableSubmarkets.length === 0}
          />
        ) : (
          <div className="flex flex-nowrap gap-3 items-center">
            {/* Submarket Filter */}
            {subfilterPermissions.submarket && (
              <Select 
                value={selectedSubmarket} 
                onValueChange={onSubmarketChange}
                disabled={selectedMarket === "all-markets" || availableSubmarkets.length === 0}
              >
                <SelectTrigger className="w-[150px] bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Submarket" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50 max-h-[300px]">
                  <SelectItem value="all-submarkets">All Submarkets</SelectItem>
                  {availableSubmarkets.map(submarket => (
                    <SelectItem key={submarket} value={submarket}>{submarket}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Level 2 Filter - Static options, no loading needed */}
            {subfilterPermissions.level2 && (
              <Select 
                value={selectedLevel2} 
                onValueChange={onLevel2Change}
              >
                <SelectTrigger className="w-[200px] bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                  <SelectValue placeholder="Level 2" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50 max-h-[300px]">
                  <SelectItem value="all-level2">All Level 2</SelectItem>
                  {level2Options.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* PSTAT Filter - Static options, no loading needed */}
            {subfilterPermissions.pstat && (
              <Select 
                value={selectedPstat} 
                onValueChange={onPstatChange}
              >
                <SelectTrigger className="w-[200px] bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                  <SelectValue placeholder="PSTAT" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50 max-h-[300px]">
                  <SelectItem value="all-pstat">All PSTAT</SelectItem>
                  {pstatOptions.map(pstat => (
                    <SelectItem key={pstat} value={pstat}>{pstat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )
      )}
    </div>
  );
}
