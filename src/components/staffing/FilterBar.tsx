import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className }: FilterBarProps) {
  return (
    <motion.div
      className={`flex flex-wrap gap-3 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select defaultValue="all-regions">
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

      <Select defaultValue="all-markets">
        <SelectTrigger className="w-[180px] bg-background border-border">
          <SelectValue placeholder="Select market" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-markets">All Markets</SelectItem>
          <SelectItem value="chicago">Chicago</SelectItem>
          <SelectItem value="atlanta">Atlanta</SelectItem>
          <SelectItem value="boston">Boston</SelectItem>
          <SelectItem value="dallas">Dallas</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-facilities">
        <SelectTrigger className="w-[180px] bg-background border-border">
          <SelectValue placeholder="Select facility" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-facilities">All Facilities</SelectItem>
          <SelectItem value="main-campus">Main Campus</SelectItem>
          <SelectItem value="north-clinic">North Clinic</SelectItem>
          <SelectItem value="south-hospital">South Hospital</SelectItem>
          <SelectItem value="east-medical">East Medical Center</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-departments">
        <SelectTrigger className="w-[180px] bg-background border-border">
          <SelectValue placeholder="Select department" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="all-departments">All Departments</SelectItem>
          <SelectItem value="emergency">Emergency</SelectItem>
          <SelectItem value="icu">ICU</SelectItem>
          <SelectItem value="surgery">Surgery</SelectItem>
          <SelectItem value="pediatrics">Pediatrics</SelectItem>
          <SelectItem value="cardiology">Cardiology</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
}
