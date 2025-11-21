import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
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
  // Facilities mapped by market (state)
  const facilitiesByMarket: Record<string, Array<{ value: string; label: string }>> = {
    "Florida": [
      { value: "ascension-sacred-heart-pensacola", label: "Ascension Sacred Heart Pensacola" },
      { value: "studer-family-childrens-hospital", label: "Studer Family Children's Hospital" },
      { value: "st-vincents-riverside", label: "Ascension St. Vincent's Riverside" },
      { value: "st-vincents-southside", label: "Ascension St. Vincent's Southside" },
      { value: "st-vincents-st-clairs", label: "Ascension St. Vincent's St. Clair's" },
      { value: "st-vincents-clay-county", label: "Ascension St. Vincent's Clay County" },
    ],
    "Illinois": [
      { value: "ascension-illinois", label: "Ascension Illinois" },
    ],
    "Indiana": [
      { value: "peyton-manning-childrens-hospital", label: "Peyton Manning Children's Hospital" },
      { value: "st-vincent-indianapolis", label: "Ascension St. Vincent Indianapolis" },
      { value: "st-vincent-heart-center", label: "Ascension St. Vincent Heart Center" },
      { value: "st-vincent-kokomo", label: "Ascension St. Vincent Kokomo" },
      { value: "st-vincent-anderson", label: "Ascension St. Vincent Anderson" },
      { value: "st-vincent-fishers", label: "Ascension St. Vincent Fishers" },
      { value: "st-vincent-carmel", label: "Ascension St. Vincent Carmel" },
      { value: "st-vincent-warrick", label: "Ascension St. Vincent Warrick" },
      { value: "st-vincent-evansville", label: "Ascension St. Vincent Evansville" },
    ],
    "Kansas": [
      { value: "via-christi-wichita", label: "Ascension Via Christi Wichita" },
      { value: "via-christi-pittsburg", label: "Ascension Via Christi Pittsburg" },
      { value: "via-christi-st-joseph", label: "Ascension Via Christi St. Joseph" },
      { value: "via-christi-manhattan", label: "Ascension Via Christi Manhattan" },
      { value: "via-christi-st-teresa", label: "Ascension Via Christi St. Teresa" },
    ],
    "Maryland": [
      { value: "st-agnes-hospital", label: "Ascension St. Agnes Hospital" },
    ],
    "Oklahoma": [
      { value: "st-john-medical-center", label: "St. John Medical Center" },
      { value: "st-john-sapulpa", label: "St. John Sapulpa" },
      { value: "st-john-owasso", label: "St. John Owasso" },
      { value: "st-john-broken-arrow", label: "St. John Broken Arrow" },
      { value: "jane-phillips-medical-center", label: "Jane Phillips Medical Center" },
    ],
    "Tennessee": [
      { value: "saint-thomas-midtown", label: "Ascension Saint Thomas Midtown" },
      { value: "saint-thomas-west", label: "Ascension Saint Thomas West" },
      { value: "saint-thomas-rutherford", label: "Ascension Saint Thomas Rutherford" },
      { value: "saint-thomas-hickman", label: "Ascension Saint Thomas Hickman" },
      { value: "saint-thomas-dekalb", label: "Ascension Saint Thomas DeKalb" },
      { value: "saint-thomas-highlands", label: "Ascension Saint Thomas Highlands" },
      { value: "saint-thomas-river-park", label: "Ascension Saint Thomas River Park" },
    ],
    "Texas": [
      { value: "seton-medical-center-austin", label: "Ascension Seton Austin" },
      { value: "seton-northwest", label: "Ascension Seton Northwest" },
      { value: "seton-southwest", label: "Ascension Seton Southwest" },
      { value: "dell-childrens-medical-center", label: "Dell Children's Medical Center" },
      { value: "seton-hays", label: "Ascension Seton Hays" },
      { value: "seton-williamson", label: "Ascension Seton Williamson" },
      { value: "seton-harker-heights", label: "Ascension Seton Harker Heights" },
      { value: "ascension-providence", label: "Ascension Providence" },
    ],
    "Wisconsin": [
      { value: "columbia-st-marys-milwaukee", label: "Ascension Columbia St. Mary's Milwaukee" },
      { value: "columbia-st-marys-ozaukee", label: "Ascension Columbia St. Mary's Ozaukee" },
    ],
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
      <motion.div
        className={`flex flex-wrap gap-3 justify-center ${className}`}
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

      {/* Department Family Filter */}
      <Select 
        value={selectedDepartmentFamily} 
        onValueChange={onDepartmentFamilyChange}
        disabled={selectedFacility === "all-facilities"}
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

      {/* Department Filter */}
      <Select 
        value={selectedDepartment} 
        onValueChange={onDepartmentChange}
        disabled={selectedDepartmentFamily === "all-dept-families"}
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
      </motion.div>

      {/* Clear Filters Button - only shows when filters are active */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ascension"
              size="icon"
              onClick={onClearFilters}
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}