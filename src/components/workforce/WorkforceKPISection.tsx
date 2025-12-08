import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getKPIsForTab, WorkforceKPIConfig } from "@/config/workforceKPIs";
import { useEmployees } from "@/hooks/useEmployees";
import { useContractors } from "@/hooks/useContractors";
import { useRequisitions } from "@/hooks/useRequisitions";
import { Eye } from "lucide-react";

interface WorkforceKPISectionProps {
  activeTab: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function WorkforceKPISection({
  activeTab,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: WorkforceKPISectionProps) {
  const kpis = getKPIsForTab(activeTab);
  
  // Fetch data for calculations - pass required filter props
  const filterProps = {
    selectedRegion: "all-regions",
    selectedMarket,
    selectedFacility,
    selectedDepartment,
  };

  const { data: employees = [] } = useEmployees(filterProps);
  const { data: contractors = [] } = useContractors(filterProps);
  const { data: requisitions = [] } = useRequisitions(filterProps);

  // Calculate KPI values
  const getKPIValue = (kpiId: string): string | number => {
    switch (kpiId) {
      case "hired_fte":
        return employees.reduce((sum, e) => sum + (e.FTE || 0), 0).toFixed(1);
      case "vacancy_rate": {
        const total = employees.length + requisitions.length;
        if (total === 0) return "0%";
        return `${((requisitions.length / total) * 100).toFixed(1)}%`;
      }
      case "fte_variance":
        return "-";
      case "open_reqs":
        return requisitions.length;
      case "target_fte":
        return "-";
      case "contract_fte":
        return contractors.reduce((sum, c) => sum + (c.FTE || 0), 0).toFixed(1);
      case "contractor_pct": {
        const empFte = employees.reduce((sum, e) => sum + (e.FTE || 0), 0);
        const conFte = contractors.reduce((sum, c) => sum + (c.FTE || 0), 0);
        const total = empFte + conFte;
        if (total === 0) return "0%";
        return `${((conFte / total) * 100).toFixed(1)}%`;
      }
      case "active_contracts":
        return contractors.length;
      case "contract_variance":
        return "-";
      case "pending_approval":
        return "-";
      case "avg_days_open":
        return "-";
      case "req_variance":
        return "-";
      default:
        return "-";
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
        KPIs
      </h3>
      <div className="space-y-2">
        {kpis.map((kpi) => (
          <KPICompactCard key={kpi.id} kpi={kpi} value={getKPIValue(kpi.id)} />
        ))}
      </div>
    </div>
  );
}

interface KPICompactCardProps {
  kpi: WorkforceKPIConfig;
  value: string | number;
}

function KPICompactCard({ kpi, value }: KPICompactCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{kpi.title}</p>
            <p className="text-lg font-semibold leading-none">{value}</p>
          </div>
          <button
            className="p-1.5 rounded hover:bg-accent transition-colors flex-shrink-0"
            title={kpi.definition}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
