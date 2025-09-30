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
  // Get available facilities based on selected market (state)
  const getAvailableFacilities = () => {
    if (selectedRegion === "all-regions") return [];
    
    const facilitiesByMarket: Record<string, Array<{ value: string; label: string }>> = {
      florida: [
        { value: "ascension-sacred-heart-pensacola", label: "Ascension Sacred Heart Pensacola" },
        { value: "studer-family-childrens-hospital", label: "Studer Family Children's Hospital at Ascension Sacred Heart" },
        { value: "st-vincents-riverside", label: "Ascension St. Vincent's Riverside" },
        { value: "st-vincents-southside", label: "Ascension St. Vincent's Southside" },
        { value: "st-vincents-st-clairs", label: "Ascension St. Vincent's St. Clair's" },
        { value: "st-vincents-clay-county", label: "Ascension St. Vincent's Clay County" },
      ],
      illinois: [
        { value: "ascension-illinois", label: "Ascension Illinois" },
      ],
      indiana: [
        { value: "peyton-manning-childrens-hospital", label: "Peyton Manning Children's Hospital at Ascension St. Vincent" },
        { value: "st-vincent-indianapolis", label: "Ascension St. Vincent Indianapolis Hospital" },
        { value: "st-vincent-heart-center", label: "Ascension St. Vincent Heart Center of Indiana" },
        { value: "st-vincent-kokomo", label: "Ascension St. Vincent Kokomo" },
        { value: "st-vincent-anderson", label: "Ascension St. Vincent Anderson" },
        { value: "st-vincent-fishers", label: "Ascension St. Vincent Fishers" },
        { value: "st-vincent-carmel", label: "Ascension St. Vincent Carmel Hospital" },
        { value: "st-vincent-warrick", label: "Ascension St. Vincent Warrick" },
        { value: "st-vincent-evansville", label: "Ascension St. Vincent Evansville" },
      ],
      kansas: [
        { value: "via-christi-wichita", label: "Ascension Via Christi Hospital Wichita" },
        { value: "via-christi-pittsburg", label: "Ascension Via Christi Hospital Pittsburg" },
        { value: "via-christi-st-joseph", label: "Ascension Via Christi St. Joseph" },
        { value: "via-christi-manhattan", label: "Ascension Via Christi Hospital Manhattan" },
        { value: "via-christi-st-teresa", label: "Ascension Via Christi St. Teresa" },
      ],
      maryland: [
        { value: "st-agnes-hospital", label: "Ascension St. Agnes Hospital" },
      ],
      oklahoma: [
        { value: "st-john-medical-center", label: "St. John Medical Center" },
        { value: "st-john-sapulpa", label: "St. John Sapulpa" },
        { value: "st-john-owasso", label: "St. John Owasso" },
        { value: "st-john-broken-arrow", label: "St. John Broken Arrow" },
        { value: "jane-phillips-medical-center", label: "Jane Phillips Medical Center" },
      ],
      tennessee: [
        { value: "saint-thomas-midtown", label: "Ascension Saint Thomas Hospital Midtown" },
        { value: "saint-thomas-west", label: "Ascension Saint Thomas West Hospital" },
        { value: "saint-thomas-rutherford", label: "Ascension Saint Thomas Rutherford Hospital" },
        { value: "saint-thomas-hickman", label: "Ascension Saint Thomas Hickman" },
        { value: "saint-thomas-dekalb", label: "Ascension Saint Thomas DeKalb Hospital" },
        { value: "saint-thomas-highlands", label: "Ascension Saint Thomas Highlands Hospital" },
        { value: "saint-thomas-river-park", label: "Ascension Saint Thomas River Park Hospital" },
      ],
      texas: [
        { value: "seton-medical-center-austin", label: "Ascension Seton Medical Center Austin" },
        { value: "seton-northwest", label: "Ascension Seton Northwest" },
        { value: "seton-southwest", label: "Ascension Seton Southwest" },
        { value: "dell-childrens-medical-center", label: "Dell Children's Medical Center" },
        { value: "seton-hays", label: "Ascension Seton Hays" },
        { value: "seton-williamson", label: "Ascension Seton Williamson" },
        { value: "seton-harker-heights", label: "Ascension Seton Medical Center Harker Heights" },
        { value: "ascension-providence", label: "Ascension Providence" },
      ],
      wisconsin: [
        { value: "columbia-st-marys-milwaukee", label: "Ascension Columbia St. Mary's Hospital Milwaukee" },
        { value: "columbia-st-marys-ozaukee", label: "Ascension Columbia St. Mary's Hospital Ozaukee" },
      ],
    };
    
    return facilitiesByMarket[selectedRegion] || [];
  };

  const availableFacilities = getAvailableFacilities();

  return (
    <motion.div
      className={`flex flex-wrap gap-3 justify-center ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select value={selectedRegion} onValueChange={onRegionChange}>
        <SelectTrigger className="w-[200px] bg-background border-border">
          <SelectValue placeholder="Select market" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-regions">All Markets</SelectItem>
          <SelectItem value="florida">Florida</SelectItem>
          <SelectItem value="illinois">Illinois</SelectItem>
          <SelectItem value="indiana">Indiana</SelectItem>
          <SelectItem value="kansas">Kansas</SelectItem>
          <SelectItem value="maryland">Maryland</SelectItem>
          <SelectItem value="oklahoma">Oklahoma</SelectItem>
          <SelectItem value="tennessee">Tennessee</SelectItem>
          <SelectItem value="texas">Texas</SelectItem>
          <SelectItem value="wisconsin">Wisconsin</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={selectedFacility} 
        onValueChange={onFacilityChange}
        disabled={selectedRegion === "all-regions"}
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
