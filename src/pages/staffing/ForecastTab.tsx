import { useState, useMemo } from "react";
import { useForecastBalance } from "@/hooks/useForecastBalance";
import { ForecastKPICards } from "@/components/forecast/ForecastKPICards";
import { ForecastBalanceTable } from "@/components/forecast/ForecastBalanceTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "@/lib/icons";

interface ForecastTabProps {
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedDepartment?: string;
  selectedLevel2?: string;
  selectedPstat?: string;
}

export function ForecastTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
  selectedLevel2,
  selectedPstat,
}: ForecastTabProps) {
  // Transform filter values, handling "all-" prefixes
  const filters = {
    region: selectedRegion !== "all-regions" ? selectedRegion : undefined,
    market: selectedMarket !== "all-markets" ? selectedMarket : undefined,
    facilityId: selectedFacility !== "all-facilities" ? selectedFacility : undefined,
    departmentId: selectedDepartment !== "all-departments" ? selectedDepartment : undefined,
    level2: selectedLevel2 !== "all-level2" ? selectedLevel2 : undefined,
    pstat: selectedPstat !== "all-pstat" ? selectedPstat : undefined,
  };

  const { data, isLoading } = useForecastBalance(filters);
  const [activeFilter, setActiveFilter] = useState<'all' | 'shortage' | 'surplus'>('all');
  const [selectedSkillType, setSelectedSkillType] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");

  const handleFilterClick = (filter: 'shortage' | 'surplus') => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
  };

  const uniqueSkillTypes = useMemo(() => {
    if (!data?.rows) return [];
    const set = new Set(data.rows.map(r => r.skillType).filter(Boolean));
    return Array.from(set).sort();
  }, [data?.rows]);

  const uniqueShifts = useMemo(() => {
    if (!data?.rows) return [];
    const set = new Set(data.rows.map(r => r.shift).filter(Boolean));
    return Array.from(set).sort();
  }, [data?.rows]);

  const hasActiveLocalFilters = selectedSkillType !== "all" || selectedShift !== "all";

  const filteredRows = useMemo(() => {
    return (data?.rows ?? []).filter(row => {
      if (activeFilter === 'shortage' && row.gapType !== 'shortage') return false;
      if (activeFilter === 'surplus' && row.gapType !== 'surplus') return false;
      if (selectedSkillType !== "all" && row.skillType !== selectedSkillType) return false;
      if (selectedShift !== "all" && row.shift !== selectedShift) return false;
      return true;
    });
  }, [data?.rows, activeFilter, selectedSkillType, selectedShift]);

  const resetLocalFilters = () => {
    setSelectedSkillType("all");
    setSelectedShift("all");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Two Large KPIs */}
      <div data-tour="forecast-kpi-cards">
        <ForecastKPICards
          totalShortage={data?.totalShortage ?? 0}
          totalSurplus={data?.totalSurplus ?? 0}
          shortageCount={data?.shortageCount ?? 0}
          surplusCount={data?.surplusCount ?? 0}
          isLoading={isLoading}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
        />
      </div>

      {/* Skill Type & Shift Filters */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Select value={selectedSkillType} onValueChange={setSelectedSkillType}>
          <SelectTrigger className="w-[180px] rounded-lg border-2 border-input px-4 py-3 h-auto [&>svg]:hidden">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder="All Skills" />
              <ChevronDown className="h-4 w-4 text-[#1D69D2] shrink-0 transition-transform duration-200" />
            </div>
          </SelectTrigger>
          <SelectContent className="min-w-[210px] bg-background z-50">
            <SelectItem value="all" className="data-[state=checked]:bg-primary/15 [&>span:first-child]:hidden">All Skills</SelectItem>
            {uniqueSkillTypes.map(skill => (
              <SelectItem key={skill} value={skill} className="data-[state=checked]:bg-primary/15 [&>span:first-child]:hidden">
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedShift} onValueChange={setSelectedShift}>
          <SelectTrigger className="w-[180px] rounded-lg border-2 border-input px-4 py-3 h-auto [&>svg]:hidden">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder="All Shifts" />
              <ChevronDown className="h-4 w-4 text-[#1D69D2] shrink-0 transition-transform duration-200" />
            </div>
          </SelectTrigger>
          <SelectContent className="min-w-[210px] bg-background z-50">
            <SelectItem value="all" className="data-[state=checked]:bg-primary/15 [&>span:first-child]:hidden">All Shifts</SelectItem>
            {uniqueShifts.map(shift => (
              <SelectItem key={shift} value={shift} className="data-[state=checked]:bg-primary/15 [&>span:first-child]:hidden">
                {shift}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveLocalFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLocalFilters}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Smart Table */}
      <div className="min-h-0 max-h-full">
        <ForecastBalanceTable
          rows={filteredRows}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
