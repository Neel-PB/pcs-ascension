import { Card } from "@/components/ui/card";
import { ForecastBalanceRow } from "@/hooks/useForecastBalance";
import { ForecastBalanceTableRow } from "./ForecastBalanceTableRow";
import { LogoLoader } from "@/components/ui/LogoLoader";

interface ForecastBalanceTableProps {
  rows: ForecastBalanceRow[];
  isLoading?: boolean;
}

export function ForecastBalanceTable({ rows, isLoading }: ForecastBalanceTableProps) {
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
      <div className="border rounded-md">
        {/* Header */}
        <div
          className="grid h-10 items-center bg-muted font-medium text-sm border-b"
          style={{
            gridTemplateColumns: "40px 100px 160px 160px 100px 80px 100px 120px",
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
        
        {/* Rows */}
        {rows.map((row) => (
          <ForecastBalanceTableRow key={row.id} row={row} />
        ))}
      </div>
    </Card>
  );
}
