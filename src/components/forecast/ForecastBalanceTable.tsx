import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ForecastBalanceRow } from "@/hooks/useForecastBalance";
import { ForecastBalanceTableRow } from "./ForecastBalanceTableRow";
import { LogoLoader } from "@/components/ui/LogoLoader";

interface ForecastBalanceTableProps {
  rows: ForecastBalanceRow[];
  isLoading?: boolean;
}

export function ForecastBalanceTable({ rows, isLoading }: ForecastBalanceTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleToggle = (rowId: string) => {
    setExpandedRowId(prev => prev === rowId ? null : rowId);
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-center items-center py-12">
          <LogoLoader size="md" />
        </div>
      </Card>
    );
  }
  
  if (rows.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          No forecast data available. Ensure positions data exists with employment type information.
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="border rounded-md max-h-[600px] overflow-y-auto">
        {/* Sticky Header */}
        <div
          className="grid h-10 items-center bg-muted font-medium text-sm border-b sticky top-0 z-10"
          data-tour="forecast-table-header"
          style={{
            gridTemplateColumns: "40px minmax(80px, 1fr) minmax(140px, 1.5fr) minmax(140px, 1.5fr) minmax(80px, 1fr) 80px 100px 120px",
          }}
        >
          <div />
          <div className="px-2">Market</div>
          <div className="px-2">Facility</div>
          <div className="px-2">Department</div>
          <div className="px-2">Skill Type</div>
          <div className="px-2">Shift</div>
          <div className="px-2">FTE Gap</div>
          <div className="px-2">Status</div>
        </div>
        
        <div data-tour="forecast-table-body">
          {rows.map((row) => (
            <ForecastBalanceTableRow 
              key={row.id} 
              row={row}
              isExpanded={expandedRowId === row.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
