import { motion } from "framer-motion";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useContractors } from "@/hooks/useContractors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContractorDetailsSheet } from "@/components/workforce/ContractorDetailsSheet";

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
  const { data: contractors, isLoading } = useContractors({
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedDepartment,
  });

  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (contractor: any) => {
    setSelectedContractor(contractor);
    setSheetOpen(true);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </motion.div>
    );
  }

  if (!contractors || contractors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-xl border border-border/50 p-12"
      >
        <p className="text-muted-foreground">No contractors found matching the filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="h-[calc(100vh-280px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Contractor Name</TableHead>
              <TableHead>Position #</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Skill Type</TableHead>
              <TableHead className="text-center">Actual FTE</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff Type</TableHead>
              <TableHead>Full/Part Time</TableHead>
              <TableHead className="text-center">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.map((contractor) => (
              <TableRow
                key={contractor.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(contractor)}
              >
                <TableCell className="font-medium">{contractor.employeeName || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{contractor.positionNum || "—"}</TableCell>
                <TableCell>{contractor.jobTitle || "—"}</TableCell>
                <TableCell>
                  {contractor.jobFamily ? (
                    <Badge variant="outline" className="bg-primary/10">
                      {contractor.jobFamily}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {contractor.FTE || "—"}
                </TableCell>
                <TableCell>{contractor.shift || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Contingent</Badge>
                </TableCell>
                <TableCell>{contractor.employmentFlag || "—"}</TableCell>
                <TableCell>{contractor.employmentType || "—"}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Future: Open comments
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <ContractorDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        contractor={selectedContractor}
      />
    </motion.div>
  );
}
