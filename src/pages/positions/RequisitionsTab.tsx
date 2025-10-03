import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Eye, Settings, MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, Filter, Search } from "lucide-react";
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
        
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search requisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-330px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
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
                onClick={() => handleSort("positionLifecycle")}
              >
                <div className="flex items-center gap-2">
                  Position Lifecycle
                  {getSortIcon("positionLifecycle")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("vacancyAge")}
              >
                <div className="flex items-center gap-2">
                  Vacancy Age
                  {getSortIcon("vacancyAge")}
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
                onClick={() => handleSort("employmentType")}
              >
                <div className="flex items-center gap-2">
                  Employment Type
                  {getSortIcon("employmentType")}
                </div>
              </TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequisitions.map((requisition) => {
              const vacancyBadge = getVacancyBadge(requisition.vacancyAge);

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
