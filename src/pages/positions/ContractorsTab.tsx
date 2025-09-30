import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface ContractorsTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function ContractorsTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: ContractorsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 p-12"
    >
      <Briefcase className="w-20 h-20 text-muted-foreground/40 mb-6" />
      <h2 className="text-3xl font-bold text-foreground mb-3">Contractors</h2>
      <p className="text-xl text-muted-foreground">Coming Soon</p>
    </motion.div>
  );
}
