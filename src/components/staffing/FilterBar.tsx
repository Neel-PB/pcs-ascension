import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Lock } from "lucide-react";
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
    getMarketsByRegion, 
    getFacilitiesByMarket, 
    getDepartmentsByFacility,
    getSubmarketsByMarket,
    isLoading: filterDataLoading,
  } = useFilterData();
  
  const { 
    restrictedOptions, 
    lockedFilters, 
    hasRestrictions, 
    shouldShowAllOption,
    isLoading: orgScopedLoading 
  } = useOrgScopedFilters();

  const isCompact = useIsCompactScreen();
  const { getFilterPermissions, getSubfilterPermissions, loading: rbacLoading } = useRBAC();
  
  // Combined loading state
  const isLoading = rbacLoading || filterDataLoading || orgScopedLoading;
  
  // During loading, show all filters to prevent layout shift
  // Once loaded, respect actual permissions
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

  // Get available markets based on selected region OR org restrictions
  const availableMarkets = hasRestrictions 
    ? restrictedOptions.availableMarkets.map(m => ({ id: m, market: m }))
    : getMarketsByRegion(selectedRegion);

  // Get available facilities based on selected market OR org restrictions
  const availableFacilities = hasRestrictions 
    ? restrictedOptions.availableFacilities
    : getFacilitiesByMarket(selectedMarket);

  // Get available departments based on selected facility OR org restrictions
  const availableDepartments = hasRestrictions && restrictedOptions.availableDepartments.length > 0
    ? restrictedOptions.availableDepartments.filter(d => 
        selectedFacility === "all-facilities" || d.facility_id === selectedFacility
      )
    : getDepartmentsByFacility(selectedFacility);

  // Get available submarkets based on selected market
  const availableSubmarkets = getSubmarketsByMarket(selectedMarket);
  
  // Determine if facility filter should be disabled
  // For restricted users, it's only disabled if locked (single option)
  // For unrestricted users, it's disabled if no market selected
  const isFacilityDisabled = hasRestrictions 
    ? lockedFilters.facility 
    : selectedMarket === "all-markets";
    
  // Determine if department filter should be disabled
  const isDepartmentDisabled = hasRestrictions
    ? lockedFilters.department
    : selectedFacility === "all-facilities";

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
          <Select value={selectedRegion} onValueChange={onRegionChange} disabled={isLoading}>
            <SelectTrigger className={`${isCompact ? 'min-w-[120px] flex-shrink' : 'w-[150px]'} bg-background border-border`}>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="all-regions">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.region}>{region.region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Market Filter - only show if user has permission */}
        {filterPermissions.market && (
          <Select value={selectedMarket} onValueChange={onMarketChange} disabled={isLoading}>
            <SelectTrigger className={`${isCompact ? 'min-w-[120px] flex-shrink' : 'w-[150px]'} bg-background border-border`}>
              <SelectValue placeholder="Select market" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="all-markets">All Markets</SelectItem>
              {availableMarkets.map(market => (
                <SelectItem key={market.id} value={market.market}>{market.market}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Facility Filter - only show if user has permission */}
        {filterPermissions.facility && (
          <div className="relative">
            <Select 
              value={selectedFacility} 
              onValueChange={onFacilityChange}
              disabled={isLoading || isFacilityDisabled}
            >
              <SelectTrigger className={`${isCompact ? 'min-w-[160px] flex-shrink' : 'w-[250px]'} bg-background border-border ${lockedFilters.facility ? 'pr-8' : ''}`}>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {shouldShowAllOption('facility') && (
                  <SelectItem value="all-facilities">All Facilities</SelectItem>
                )}
                {availableFacilities.map(facility => (
                  <SelectItem key={facility.facility_id || facility.id} value={facility.facility_id}>{facility.facility_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lockedFilters.facility && (
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
              disabled={isLoading || isDepartmentDisabled}
            >
              <SelectTrigger className={`${isCompact ? 'min-w-[140px] flex-shrink' : 'w-[180px]'} bg-background border-border ${lockedFilters.department ? 'pr-8' : ''}`}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {shouldShowAllOption('department') && (
                  <SelectItem value="all-departments">All Departments</SelectItem>
                )}
                {availableDepartments.map(dept => (
                  <SelectItem key={dept.department_id || dept.id} value={dept.department_id}>{dept.department_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lockedFilters.department && (
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
                disabled={isLoading || selectedMarket === "all-markets" || availableSubmarkets.length === 0}
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

            {/* Level 2 Filter */}
            {subfilterPermissions.level2 && (
              <Select 
                value={selectedLevel2} 
                onValueChange={onLevel2Change}
                disabled={isLoading}
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

            {/* PSTAT Filter */}
            {subfilterPermissions.pstat && (
              <Select 
                value={selectedPstat} 
                onValueChange={onPstatChange}
                disabled={isLoading}
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
