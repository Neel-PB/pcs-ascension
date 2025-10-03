import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
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
import { EmployeesFilterSheet } from "@/components/positions/EmployeesFilterSheet";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    status: "all",
    employmentType: "all",
    skillType: "",
    shift: "all",
    fteMin: "",
    fteMax: "",
  });

  const handleRowClick = (employee: any) => {
    setSelectedEmployee(employee);
    setSheetOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      employmentType: "all",
      skillType: "",
      shift: "all",
      fteMin: "",
      fteMax: "",
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.employmentType !== "all") count++;
    if (filters.skillType) count++;
    if (filters.shift !== "all") count++;
    if (filters.fteMin) count++;
    if (filters.fteMax) count++;
    return count;
  }, [filters]);

  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return [];

    let filtered = [...employees];

    // Apply filters
    if (filters.status !== "all") {
      filtered = filtered.filter((e) => e.positionLifecycle === filters.status);
    }
    if (filters.employmentType !== "all") {
      filtered = filtered.filter((e) => e.employmentType === filters.employmentType);
    }
    if (filters.skillType) {
      filtered = filtered.filter((e) => 
        e.jobFamily?.toLowerCase().includes(filters.skillType.toLowerCase())
      );
    }
    if (filters.shift !== "all") {
      filtered = filtered.filter((e) => e.shift === filters.shift);
    }
    if (filters.fteMin) {
      const minFte = parseFloat(filters.fteMin);
      filtered = filtered.filter((e) => {
        const fte = typeof e.FTE === 'string' ? parseFloat(e.FTE) : (e.FTE || 0);
        return fte >= minFte;
      });
    }
    if (filters.fteMax) {
      const maxFte = parseFloat(filters.fteMax);
      filtered = filtered.filter((e) => {
        const fte = typeof e.FTE === 'string' ? parseFloat(e.FTE) : (e.FTE || 0);
        return fte <= maxFte;
      });
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle numeric values
        if (sortColumn === "FTE") {
          aVal = parseFloat(aVal || "0");
          bVal = parseFloat(bVal || "0");
        }

        // Handle null/undefined
        if (!aVal) return 1;
        if (!bVal) return -1;

        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return filtered;
  }, [employees, filters, sortColumn, sortDirection]);

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
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-330px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("employeeName")}
              >
                <div className="flex items-center gap-2">
                  Employee Name
                  {getSortIcon("employeeName")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("positionNum")}
              >
                <div className="flex items-center gap-2">
                  Position #
                  {getSortIcon("positionNum")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("jobTitle")}
              >
                <div className="flex items-center gap-2">
                  Job Title
                  {getSortIcon("jobTitle")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("jobFamily")}
              >
                <div className="flex items-center gap-2">
                  Skill Type
                  {getSortIcon("jobFamily")}
                </div>
              </TableHead>
              <TableHead 
                className="text-center cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("FTE")}
              >
                <div className="flex items-center justify-center gap-2">
                  Actual FTE
                  {getSortIcon("FTE")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("shift")}
              >
                <div className="flex items-center gap-2">
                  Shift
                  {getSortIcon("shift")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("positionLifecycle")}
              >
                <div className="flex items-center gap-2">
                  Status
                  {getSortIcon("positionLifecycle")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("employmentFlag")}
              >
                <div className="flex items-center gap-2">
                  Staff Type
                  {getSortIcon("employmentFlag")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("employmentType")}
              >
                <div className="flex items-center gap-2">
                  Full/Part Time
                  {getSortIcon("employmentType")}
                </div>
              </TableHead>
              <TableHead className="text-center">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedEmployees.map((employee) => (
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

      <EmployeesFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
    </motion.div>
  );
}
