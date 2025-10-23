import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EmployeeDetailsSheet } from "@/components/workforce/EmployeeDetailsSheet";
import { EmployeesFilterSheet } from "@/components/positions/EmployeesFilterSheet";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnVisibilityPanel } from "@/components/editable-table/ColumnVisibilityPanel";
import { employeeColumns } from "@/config/employeeColumns";
import { useUpdateActualFte } from "@/hooks/useUpdateActualFte";
import { EditableNumberCell } from "@/components/editable-table/cells/EditableNumberCell";

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

  const updateActualFte = useUpdateActualFte();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    setSortColumn(columnId);
    setSortDirection(direction);
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

  const handleActualFteUpdate = (id: string, newValue: number | null) => {
    updateActualFte.mutate({ id, actual_fte: newValue });
  };

  const columnsWithHandlers = useMemo(() => {
    return employeeColumns.map(col => {
      if (col.id === 'actual_fte') {
        return {
          ...col,
          renderCell: (row: any) => (
            <EditableNumberCell
              value={row.actual_fte}
              originalValue={row.FTE}
              onSave={(newValue) => handleActualFteUpdate(row.id, newValue)}
              showModified={true}
            />
          ),
        };
      }
      return col;
    });
  }, []);

  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return [];

    let filtered = [...employees];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => {
        const searchFields = [
          e.employeeName,
          e.positionNum,
          e.jobTitle,
          e.jobFamily,
          e.departmentName,
          e.employmentType,
          e.shift,
        ];
        return searchFields.some((field) => 
          field?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filters.status !== "all") {
      filtered = filtered.filter((e) => e.payrollStatus === filters.status);
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
  }, [employees, searchQuery, filters, sortColumn, sortDirection]);

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
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <ColumnVisibilityPanel
            columns={employeeColumns}
            storeNamespace="employees-columns"
          />
          
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
      </div>

      <EditableTable
        columns={columnsWithHandlers}
        data={filteredAndSortedEmployees}
        getRowId={(row) => row.id}
        sortField={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleRowClick}
        storeNamespace="employees-columns"
        className="h-[calc(100vh-280px)]"
      />

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
