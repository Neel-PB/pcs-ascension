import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Filter, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { RequisitionDetailsSheet } from "@/components/workforce/RequisitionDetailsSheet";
import { RequisitionsFilterSheet } from "@/components/positions/RequisitionsFilterSheet";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnVisibilityPanel } from "@/components/editable-table/ColumnVisibilityPanel";
import { requisitionColumns, createRequisitionColumnsWithComments } from "@/config/requisitionColumns";
import { usePositionCommentCounts } from "@/hooks/usePositionCommentCounts";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    vacancyAgeMin: "",
    vacancyAgeMax: "",
    positionLifecycle: "all",
    skillType: "",
    shift: "all",
    employmentType: "all",
  });

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

  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  const clearFilters = () => {
    setFilters({
      vacancyAgeMin: "",
      vacancyAgeMax: "",
      positionLifecycle: "all",
      skillType: "",
      shift: "all",
      employmentType: "all",
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.vacancyAgeMin) count++;
    if (filters.vacancyAgeMax) count++;
    if (filters.positionLifecycle !== "all") count++;
    if (filters.skillType) count++;
    if (filters.shift !== "all") count++;
    if (filters.employmentType !== "all") count++;
    return count;
  }, [filters]);

  const filteredAndSortedRequisitions = useMemo(() => {
    if (!requisitions) return [];

    let filtered = requisitions.map((req) => ({
      ...req,
      vacancyAge: getVacancyAge(req.positionStatusDate),
    }));

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        const searchFields = [
          r.positionNum,
          r.jobTitle,
          r.jobFamily,
          r.departmentName,
          r.positionLifecycle,
          r.employmentType,
          r.shift,
        ];
        return searchFields.some((field) => 
          field?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filters.vacancyAgeMin) {
      const minAge = parseInt(filters.vacancyAgeMin);
      filtered = filtered.filter((r) => (r.vacancyAge ?? 0) >= minAge);
    }
    if (filters.vacancyAgeMax) {
      const maxAge = parseInt(filters.vacancyAgeMax);
      filtered = filtered.filter((r) => (r.vacancyAge ?? 0) <= maxAge);
    }
    if (filters.positionLifecycle !== "all") {
      filtered = filtered.filter((r) => r.positionLifecycle === filters.positionLifecycle);
    }
    if (filters.skillType) {
      filtered = filtered.filter((r) => 
        r.jobFamily?.toLowerCase().includes(filters.skillType.toLowerCase())
      );
    }
    if (filters.shift !== "all") {
      filtered = filtered.filter((r) => r.shift === filters.shift);
    }
    if (filters.employmentType !== "all") {
      filtered = filtered.filter((r) => r.employmentType === filters.employmentType);
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle vacancy age sorting
        if (sortColumn === "vacancyAge") {
          aVal = a.vacancyAge ?? 0;
          bVal = b.vacancyAge ?? 0;
        }

        // Handle null/undefined
        if (!aVal && aVal !== 0) return 1;
        if (!bVal && bVal !== 0) return -1;

        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return filtered;
  }, [requisitions, searchQuery, filters, sortColumn, sortDirection]);

  // Extract position IDs for comment count fetching
  const positionIds = useMemo(() => 
    filteredAndSortedRequisitions.map(r => r.id), 
    [filteredAndSortedRequisitions]
  );

  // Fetch comment counts
  const commentCounts = usePositionCommentCounts(positionIds);

  const columnsWithComments = useMemo(() => 
    createRequisitionColumnsWithComments(commentCounts, handleRowClick),
    [commentCounts]
  );

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
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search requisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <ColumnVisibilityPanel
            columns={requisitionColumns}
            storeNamespace="requisitions-columns"
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
        columns={columnsWithComments}
        data={filteredAndSortedRequisitions}
        getRowId={(row) => row.id}
        sortField={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleRowClick}
        storeNamespace="requisitions-columns"
        className="h-[calc(100vh-280px)]"
      />

      <RequisitionDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        requisition={selectedRequisition}
      />

      <RequisitionsFilterSheet
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
