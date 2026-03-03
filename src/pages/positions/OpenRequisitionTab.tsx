import { useMemo } from "react";
import { Filter } from "@/lib/icons";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { differenceInDays } from "date-fns";

import { TruncatedTextCell } from "@/components/editable-table/cells/TruncatedTextCell";
import { BadgeCell } from "@/components/editable-table/cells/BadgeCell";
import { ShiftCell } from "@/components/editable-table/cells/ShiftCell";
import { SearchField } from "@/components/ui/search-field";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { Button } from "@/components/ui/button";
import { PositionKPICards } from "@/components/positions/PositionKPICards";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePositionsByFlag } from "@/hooks/usePositionsByFlag";
import { useUpdateShiftOverride } from "@/hooks/useUpdateShiftOverride";
import { LogoLoader } from "@/components/ui/LogoLoader";

const getVacancyAge = (statusDate: string | null) => {
  if (!statusDate) return null;
  return differenceInDays(new Date(), new Date(statusDate));
};

const getVacancyBadge = (days: number | null) => {
  if (!days) return { variant: 'secondary' as const, label: '—', className: '' };
  if (days > 60)
    return { variant: 'outline' as const, label: `${days}d - Urgent`, className: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400' };
  if (days > 30)
    return { variant: 'outline' as const, label: `${days}d - Attention`, className: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400' };
  return { variant: 'outline' as const, label: `${days}d - On Track`, className: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' };
};

interface OpenRequisitionTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function OpenRequisitionTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: OpenRequisitionTabProps) {
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);
  const { mutate: updateShiftOverride } = useUpdateShiftOverride();

  const { data: requisitions, isFetching } = usePositionsByFlag('open_requisition_flag', {
    selectedRegion, selectedMarket, selectedFacility, selectedDepartment,
  });

  const handleShiftOverride = (positionId: string, originalShift: string | null, value: string | null) => {
    updateShiftOverride({ id: positionId, shift_override: value, originalShift });
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    { id: "positionNum", label: "Position No", type: "text", width: 160, minWidth: 150, sortable: true, resizable: false, draggable: true, locked: true },
    { id: "jobTitle", label: "Job Title", type: "custom", width: 260, minWidth: 200, sortable: true, resizable: false, draggable: true, renderCell: (row: any) => <TruncatedTextCell value={row.jobTitle} maxLength={30} /> },
    { id: "jobFamily", label: "Skill Mix", type: "custom", width: 180, minWidth: 160, sortable: true, resizable: false, draggable: true, renderCell: (row: any) => <TruncatedTextCell value={row.jobFamily} maxLength={30} /> },
    { id: "vacancyAge", label: "Vacancy Age", type: "custom", width: 180, minWidth: 170, sortable: true, resizable: false, draggable: true,
      getValue: (row: any) => getVacancyAge(row.positionStatusDate),
      renderCell: (row: any) => {
        const days = getVacancyAge(row.positionStatusDate);
        const badge = getVacancyBadge(days);
        return <BadgeCell value={badge.label} variant={badge.variant} className={badge.className} maxLength={30} />;
      },
      sortFn: (a: any, b: any) => {
        const aDays = getVacancyAge(a.positionStatusDate) ?? 0;
        const bDays = getVacancyAge(b.positionStatusDate) ?? 0;
        return aDays - bDays;
      },
    },
    { id: "FTE", label: "Hired FTE", type: "number", width: 120, minWidth: 100, sortable: true, resizable: false, draggable: true },
    { id: "shift", label: "Shift", type: "custom", width: 180, minWidth: 160, sortable: true, resizable: false, draggable: true,
      renderCell: (row: any) => (
        <ShiftCell
          value={row.shift}
          selectedDayNight={row.shift_override}
          onSave={(val) => handleShiftOverride(row.id, row.shift, val)}
        />
      ),
    },
    { id: "employmentType", label: "Staff Type", type: "custom", width: 180, minWidth: 170, sortable: true, resizable: false, draggable: true, renderCell: (row: any) => <TruncatedTextCell value={row.employmentType} maxLength={30} /> },
  ], []);

  const filteredData = useMemo(() => {
    if (!requisitions) return [];
    if (!debouncedSearch) return requisitions;
    const q = debouncedSearch.toLowerCase();
    return requisitions.filter((r: any) => [r.positionNum, r.jobTitle, r.jobFamily, r.shift, r.employmentType].some(f => f?.toLowerCase().includes(q)));
  }, [requisitions, debouncedSearch]);

  const showEmptyState = !isFetching && (!requisitions || requisitions.length === 0);

  return (
    <div className="flex flex-col gap-4 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchField placeholder="Search requisitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[32rem]" />
        <div className="flex gap-2 items-center flex-shrink-0 ml-auto">
          <PositionKPICards items={[{ label: "Open Requisitions", value: filteredData.length }]} />
          <DataRefreshButton dataSources={['positions_data']} />
          <Button variant="ascension" size="icon" aria-label="Filters" title="Filters">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]"><LogoLoader size="lg" /></div>
      ) : showEmptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-muted/20 rounded-xl border border-border/50">
          <p className="text-muted-foreground">No open requisitions found.</p>
        </div>
      ) : (
        <div className="min-h-0 max-h-full flex flex-col">
          <EditableTable data={filteredData} columns={columns} getRowId={(row) => row.id} storeNamespace="open-requisitions" className="min-h-0 max-h-full" />
        </div>
      )}
    </div>
  );
}
