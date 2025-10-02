import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, Settings, MessageSquare } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useRequisitions } from "@/hooks/useRequisitions";
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
import { RequisitionDetailsSheet } from "@/components/workforce/RequisitionDetailsSheet";

interface RequisitionsTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function RequisitionsTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: RequisitionsTabProps) {
  const { data: requisitions, isLoading } = useRequisitions({
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedDepartment,
  });

  const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (requisition: any) => {
    setSelectedRequisition(requisition);
    setSheetOpen(true);
  };

  const getVacancyAge = (statusDate: string | null) => {
    if (!statusDate) return null;
    return differenceInDays(new Date(), new Date(statusDate));
  };

  const getVacancyBadge = (days: number | null) => {
    if (!days) return { variant: "secondary" as const, label: "—" };
    if (days > 60)
      return { variant: "destructive" as const, label: `${days}d - Urgent` };
    if (days > 30)
      return { variant: "secondary" as const, label: `${days}d - Attention` };
    return { variant: "default" as const, label: `${days}d - On Track` };
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

  if (!requisitions || requisitions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-xl border border-border/50 p-12"
      >
        <p className="text-muted-foreground">No open requisitions found matching the filters.</p>
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
              <TableHead>Position #</TableHead>
              <TableHead>Position Lifecycle</TableHead>
              <TableHead>Vacancy Age</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Skill Type</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Employment Type</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.map((requisition) => {
              const vacancyAge = getVacancyAge(requisition.positionStatusDate);
              const vacancyBadge = getVacancyBadge(vacancyAge);

              return (
                <TableRow
                  key={requisition.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(requisition)}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {requisition.positionNum || "—"}
                  </TableCell>
                  <TableCell>{requisition.positionLifecycle || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={vacancyBadge.variant}>{vacancyBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{requisition.jobTitle || "—"}</TableCell>
                  <TableCell>
                    {requisition.jobFamily ? (
                      <Badge variant="outline" className="bg-primary/10">
                        {requisition.jobFamily}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{requisition.shift || "—"}</TableCell>
                  <TableCell>{requisition.employmentType || "—"}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(requisition);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Future: Settings/actions
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Future: Send to Oracle
                        }}
                      >
                        Oracle
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      <RequisitionDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        requisition={selectedRequisition}
      />
    </motion.div>
  );
}
