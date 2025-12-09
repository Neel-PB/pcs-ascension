import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

// Region groupings
const regions = {
  "Southeast": ["Florida", "Tennessee", "Maryland"],
  "Midwest": ["Illinois", "Indiana", "Wisconsin"],
  "South Central": ["Kansas", "Oklahoma", "Texas"],
};

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
  // Facilities mapped by market (state) - using numeric facility IDs from labor_performance
  const facilitiesByMarket: Record<string, Array<{ value: string; label: string }>> = {
    "Florida": [
      { value: "26012", label: "Sacred Heart Pensacola" },
      { value: "52009", label: "St. Vincent's Riverside" },
      { value: "52005", label: "St. Vincent's Southside" },
    ],
    "Illinois": [],
    "Indiana": [],
    "Kansas": [],
    "Maryland": [],
    "Oklahoma": [],
    "Tennessee": [],
    "Texas": [
      { value: "30049", label: "Dell Seton" },
      { value: "30024", label: "Seton Hays" },
    ],
    "Wisconsin": [],
  };

  // Get available markets based on selected region
  const getAvailableMarkets = () => {
    if (selectedRegion === "all-regions") return Object.keys(facilitiesByMarket);
    return regions[selectedRegion as keyof typeof regions] || [];
  };

  // Get available facilities based on selected market
  const getAvailableFacilities = () => {
    if (selectedMarket === "all-markets") return [];
    return facilitiesByMarket[selectedMarket] || [];
  };

  const availableMarkets = getAvailableMarkets();
  const availableFacilities = getAvailableFacilities();

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
            <SelectItem value="Southeast">Southeast</SelectItem>
            <SelectItem value="Midwest">Midwest</SelectItem>
            <SelectItem value="South Central">South Central</SelectItem>
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
              <SelectItem key={market} value={market}>{market}</SelectItem>
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
              <SelectItem key={facility.value} value={facility.value}>{facility.label}</SelectItem>
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
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="icu">ICU</SelectItem>
            <SelectItem value="surgery">Surgery</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
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
          <X className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* SEPARATOR */}
      <div className="h-8 w-px bg-border" />

      {/* RIGHT GROUP: Independent Department Family Filter */}
      <Select 
        value={selectedDepartmentFamily} 
        onValueChange={onDepartmentFamilyChange}
      >
        <SelectTrigger className="w-[220px] bg-background border-border">
          <SelectValue placeholder="Select dept family" />
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