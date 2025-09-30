import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface EmployeesTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function EmployeesTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: EmployeesTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 p-12"
    >
      <Users className="w-20 h-20 text-muted-foreground/40 mb-6" />
      <h2 className="text-3xl font-bold text-foreground mb-3">Employees</h2>
      <p className="text-xl text-muted-foreground">Coming Soon</p>
    </motion.div>
  );
}
