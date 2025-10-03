import { motion } from "framer-motion";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
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
import { EmployeeDetailsSheet } from "@/components/workforce/EmployeeDetailsSheet";

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
  const { data: employees, isLoading } = useEmployees({
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedDepartment,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (employee: any) => {
    setSelectedEmployee(employee);
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

  if (!employees || employees.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-xl border border-border/50 p-12"
      >
        <p className="text-muted-foreground">No employees found matching the filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="h-[calc(100vh-240px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Employee Name</TableHead>
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
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(employee)}
              >
                <TableCell className="font-medium">{employee.employeeName || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{employee.positionNum || "—"}</TableCell>
                <TableCell>{employee.jobTitle || "—"}</TableCell>
                <TableCell>
                  {employee.jobFamily ? (
                    <Badge variant="outline" className="bg-primary/10">
                      {employee.jobFamily}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {employee.FTE || "—"}
                </TableCell>
                <TableCell>{employee.shift || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={employee.payrollStatus === "Active" ? "default" : "secondary"}
                  >
                    {employee.payrollStatus || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>{employee.employmentFlag || "—"}</TableCell>
                <TableCell>{employee.employmentType || "—"}</TableCell>
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

      <EmployeeDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        employee={selectedEmployee}
      />
    </motion.div>
  );
}
