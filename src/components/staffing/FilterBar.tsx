import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface FilterBarProps {
  className?: string;
  onRegionChange?: (value: string) => void;
  onMarketChange?: (value: string) => void;
  onFacilityChange?: (value: string) => void;
  onDepartmentChange?: (value: string) => void;
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedDepartment?: string;
}

export function FilterBar({ 
  className,
  onRegionChange,
  onMarketChange,
  onFacilityChange,
  onDepartmentChange,
  selectedRegion = "all-regions",
  selectedMarket = "all-markets",
  selectedFacility = "all-facilities",
  selectedDepartment = "all-departments",
}: FilterBarProps) {
  // Get available markets based on selected region
  const getAvailableMarkets = () => {
    if (selectedRegion === "all-regions") return [];
    if (selectedRegion === "northeast") return [
      { value: "boston", label: "Boston" },
      { value: "new-york", label: "New York" },
    ];
    if (selectedRegion === "southeast") return [
      { value: "atlanta", label: "Atlanta" },
      { value: "pensacola", label: "Pensacola" },
    ];
    if (selectedRegion === "midwest") return [
      { value: "chicago", label: "Chicago" },
      { value: "minneapolis", label: "Minneapolis" },
    ];
    if (selectedRegion === "west") return [
      { value: "los-angeles", label: "Los Angeles" },
      { value: "seattle", label: "Seattle" },
    ];
    return [];
  };

  // Get available facilities based on selected market
  const getAvailableFacilities = () => {
    if (selectedMarket === "all-markets") return [];
    if (selectedMarket === "pensacola") return [
      { value: "sacred-heart", label: "Sacred Heart Pensacola" },
      { value: "st-vincents", label: "St. Vincent's" },
    ];
    if (selectedMarket === "atlanta") return [
      { value: "atlanta-medical", label: "Atlanta Medical Center" },
      { value: "northside", label: "Northside Hospital" },
    ];
    return [];
  };

  const availableMarkets = getAvailableMarkets();
  const availableFacilities = getAvailableFacilities();

  return (
    <motion.div
      className={`flex flex-wrap gap-3 justify-center ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select value={selectedRegion} onValueChange={onRegionChange}>
        <SelectTrigger className="w-[180px] bg-background border-border">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-regions">All Regions</SelectItem>
          <SelectItem value="northeast">Northeast</SelectItem>
          <SelectItem value="southeast">Southeast</SelectItem>
          <SelectItem value="midwest">Midwest</SelectItem>
          <SelectItem value="west">West</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={selectedMarket} 
        onValueChange={onMarketChange}
        disabled={selectedRegion === "all-regions"}
      >
        <SelectTrigger className="w-[180px] bg-background border-border">
          <SelectValue placeholder="Select market" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-markets">All Markets</SelectItem>
          {availableMarkets.map(market => (
            <SelectItem key={market.value} value={market.value}>{market.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={selectedFacility} 
        onValueChange={onFacilityChange}
        disabled={selectedMarket === "all-markets"}
      >
        <SelectTrigger className="w-[180px] bg-background border-border">
          <SelectValue placeholder="Select facility" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-facilities">All Facilities</SelectItem>
          {availableFacilities.map(facility => (
            <SelectItem key={facility.value} value={facility.value}>{facility.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

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
    </motion.div>
  );
}
