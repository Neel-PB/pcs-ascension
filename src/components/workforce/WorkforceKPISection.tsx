import { getKPIsForTab } from "@/config/workforceKPIs";
import { useEmployees } from "@/hooks/useEmployees";
import { useContractors } from "@/hooks/useContractors";
import { useRequisitions } from "@/hooks/useRequisitions";
import { KPICard } from "@/components/staffing/KPICard";

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
        {kpis.map((kpi, index) => (
          <KPICard
            key={kpi.id}
            title={kpi.title}
            value={getKPIValue(kpi.id)}
            chartData={kpi.chartData}
            chartType={kpi.chartType}
            definition={kpi.definition}
            calculation={kpi.calculation}
            delay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
}
