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
  onDepartmentFamilyChange?: (value: string) => void;
  onDepartmentChange?: (value: string) => void;
  onClearFilters?: () => void;
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedDepartmentFamily?: string;
  selectedDepartment?: string;
}

export function FilterBar({ 
  className,
  onRegionChange,
  onMarketChange,
  onFacilityChange,
  onDepartmentFamilyChange,
  onDepartmentChange,
  onClearFilters,
  selectedRegion = "all-regions",
  selectedMarket = "all-markets",
  selectedFacility = "all-facilities",
  selectedDepartmentFamily = "all-dept-families",
  selectedDepartment = "all-departments",
}: FilterBarProps) {
  const { 
    regions, 
    getMarketsByRegion, 
    getFacilitiesByMarket, 
    getDepartmentsByFacility 
  } = useFilterData();

  // Department Families (Job Families)
  const departmentFamilies = [
    "Clinical Nurse",
    "Registered Nurse",
    "Operating Room Nurse",
    "Labor & Delivery Nurse",
    "Nursing",
    "Nursing Support",
    "Patient Care Technician",
    "Allied Health",
    "Respiratory Therapy",
    "Rehabilitation Services",
    "Radiology Tech",
    "Radiology Technician",
    "Lab Tech",
    "Pharmacy",
    "Surgical Services",
    "Patient Services",
    "Physicians",
    "Clinical Support",
    "Administrative Support",
    "Health Information Management",
  ].sort();

  // Get available markets based on selected region
  const availableMarkets = getMarketsByRegion(selectedRegion);

  // Get available facilities based on selected market
  const availableFacilities = getFacilitiesByMarket(selectedMarket);

  // Get available departments based on selected facility
  const availableDepartments = getDepartmentsByFacility(selectedFacility);

  // Check if any filters are active (not in default state)
  const hasActiveFilters = 
    selectedRegion !== "all-regions" ||
    selectedMarket !== "all-markets" ||
    selectedFacility !== "all-facilities" ||
    selectedDepartmentFamily !== "all-dept-families" ||
    selectedDepartment !== "all-departments";

  return (
    <div className="flex items-center justify-center gap-3">
      {/* LEFT GROUP: Main Hierarchy Filters + Clear Button */}
      <motion.div
        className={`flex flex-wrap gap-3 justify-center items-center ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Region Filter */}
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-[200px] bg-background border-border">
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
          <SelectTrigger className="w-[200px] bg-background border-border">
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

      {/* RIGHT GROUP: Secondary Department Family Filter */}
      <Select 
        value={selectedDepartmentFamily} 
        onValueChange={onDepartmentFamilyChange}
      >
        <SelectTrigger className="w-[200px] bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
          <SelectValue placeholder="Dept Family" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50 max-h-[300px]">
          <SelectItem value="all-dept-families">All Dept Families</SelectItem>
          {departmentFamilies.map(family => (
            <SelectItem key={family} value={family}>{family}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}