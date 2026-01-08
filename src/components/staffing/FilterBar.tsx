import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useFilterData } from "@/hooks/useFilterData";

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
  } = useFilterData();

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

  // Get available markets based on selected region
  const availableMarkets = getMarketsByRegion(selectedRegion);

  // Get available facilities based on selected market
  const availableFacilities = getFacilitiesByMarket(selectedMarket);

  // Get available departments based on selected facility
  const availableDepartments = getDepartmentsByFacility(selectedFacility);

  // Get available submarkets based on selected market
  const availableSubmarkets = getSubmarketsByMarket(selectedMarket);

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
    <div className="flex items-center justify-center">
      {/* LEFT GROUP: Main Hierarchy Filters + Clear Button */}
      <motion.div
        className={`flex flex-nowrap gap-3 items-center ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Region Filter */}
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-[150px] bg-background border-border">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all-regions">All Regions</SelectItem>
            {regions.map(region => (
              <SelectItem key={region.id} value={region.region}>{region.region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Market Filter */}
        <Select value={selectedMarket} onValueChange={onMarketChange}>
          <SelectTrigger className="w-[150px] bg-background border-border">
            <SelectValue placeholder="Select market" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all-markets">All Markets</SelectItem>
            {availableMarkets.map(market => (
              <SelectItem key={market.id} value={market.market}>{market.market}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Facility Filter */}
        <Select 
          value={selectedFacility} 
          onValueChange={onFacilityChange}
          disabled={selectedMarket === "all-markets"}
        >
          <SelectTrigger className="w-[250px] bg-background border-border">
            <SelectValue placeholder="Select facility" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all-facilities">All Facilities</SelectItem>
            {availableFacilities.map(facility => (
              <SelectItem key={facility.id} value={facility.facility_id}>{facility.facility_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department Filter - Depends on Facility */}
        <Select 
          value={selectedDepartment} 
          onValueChange={onDepartmentChange}
          disabled={selectedFacility === "all-facilities"}
        >
          <SelectTrigger className="w-[180px] bg-background border-border">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all-departments">All Departments</SelectItem>
            {availableDepartments.map(dept => (
              <SelectItem key={dept.id} value={dept.department_id}>{dept.department_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button - always visible, disabled when no filters active */}
        <Button
          variant="ascension"
          size="icon"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear all filters"
          aria-label="Clear all filters"
        >
          <X className="h-3 w-3" />
        </Button>
      </motion.div>

      {/* SEPARATOR - thicker visual break */}
      <div className="h-10 w-[2px] bg-border/60 mx-6" />

      {/* RIGHT GROUP: Optional Filters - Submarket and Department Family */}
      <div className="flex flex-nowrap gap-3 items-center">
        {/* Submarket Filter */}
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

        {/* Level 2 Filter */}
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

        {/* PSTAT Filter */}
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
      </div>
    </div>
  );
}