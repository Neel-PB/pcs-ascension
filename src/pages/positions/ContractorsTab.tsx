import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, Filter, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { ContractorDetailsSheet } from "@/components/workforce/ContractorDetailsSheet";
import { ContractorsFilterSheet } from "@/components/positions/ContractorsFilterSheet";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    employmentType: "all",
    skillType: "",
    shift: "all",
    fteMin: "",
    fteMax: "",
  });

  const handleRowClick = (contractor: any) => {
    setSelectedContractor(contractor);
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
      employmentType: "all",
      skillType: "",
      shift: "all",
      fteMin: "",
      fteMax: "",
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.employmentType !== "all") count++;
    if (filters.skillType) count++;
    if (filters.shift !== "all") count++;
    if (filters.fteMin) count++;
    if (filters.fteMax) count++;
    return count;
  }, [filters]);

  const filteredAndSortedContractors = useMemo(() => {
    if (!contractors) return [];

    let filtered = [...contractors];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const searchFields = [
          c.employeeName,
          c.positionNum,
          c.jobTitle,
          c.jobFamily,
          c.departmentName,
          c.employmentType,
          c.shift,
        ];
        return searchFields.some((field) => 
          field?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filters.employmentType !== "all") {
      filtered = filtered.filter((c) => c.employmentType === filters.employmentType);
    }
    if (filters.skillType) {
      filtered = filtered.filter((c) => 
        c.jobFamily?.toLowerCase().includes(filters.skillType.toLowerCase())
      );
    }
    if (filters.shift !== "all") {
      filtered = filtered.filter((c) => c.shift === filters.shift);
    }
    if (filters.fteMin) {
      const minFte = parseFloat(filters.fteMin);
      filtered = filtered.filter((c) => {
        const fte = typeof c.FTE === 'string' ? parseFloat(c.FTE) : (c.FTE || 0);
        return fte >= minFte;
      });
    }
    if (filters.fteMax) {
      const maxFte = parseFloat(filters.fteMax);
      filtered = filtered.filter((c) => {
        const fte = typeof c.FTE === 'string' ? parseFloat(c.FTE) : (c.FTE || 0);
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
  }, [contractors, searchQuery, filters, sortColumn, sortDirection]);

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
            placeholder="Search contractors..."
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
                onClick={() => handleSort("employeeName")}
              >
                <div className="flex items-center gap-2">
                  Contractor Name
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
              <TableHead>Status</TableHead>
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
            {filteredAndSortedContractors.map((contractor) => (
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

      <ContractorsFilterSheet
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
