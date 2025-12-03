import { useState, useMemo } from "react";
import { LayoutDashboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DraggableSectionsContainer } from "./DraggableSectionsContainer";
import { useKPIOrderStore } from "@/stores/useKPIOrderStore";
import { generateLast12MonthLabels } from "@/lib/utils";

// Chart data generators
const generateGrowthTrend = (start: number, end: number, points: number = 24) => 
  Array.from({ length: points }, (_, i) => ({
    value: start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));

const generateDeclineTrend = (start: number, end: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: start - ((start - end) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));

const generateVolatileTrend = (base: number, variance: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: base + Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * (variance * 0.3)
  }));

const generateSeasonalTrend = (base: number, amplitude: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: base + Math.sin((i / points) * Math.PI * 2) * amplitude + (Math.random() - 0.5) * 2
  }));

export function KPISummaryModal() {
  const [open, setOpen] = useState(false);
  
  const { 
    fte: fteOrder, 
    volume: volumeOrder, 
    productivity: productivityOrder, 
    sectionOrder,
    setOrder,
    setSectionOrder 
  } = useKPIOrderStore();

  // FTE KPIs Configuration
  const fteKPIs = useMemo(() => {
    const kpis = [
      {
        id: 'vacancy-rate',
        title: "Vacancy Rate",
        value: "13.9%",
        chartData: generateDeclineTrend(16, 13.9),
        chartType: "bar" as const,
        delay: 0,
        definition: "Vacancy Rate measures the percentage of Approved budgeted positions that are currently unfilled.",
        calculation: `Vacancy Rate = (Vacant Positions / Total Authorized Positions) × 100`,
      },
      {
        id: 'hired-ftes',
        title: "Hired FTEs",
        value: "40.9",
        chartData: generateGrowthTrend(37, 40.9),
        chartType: "bar" as const,
        delay: 0.05,
        definition: "Total Full-time, Part-Time and PRNs equivalent labor resources currently employed.",
        calculation: `Hired FTEs = Sum of all active employee FTEs`,
      },
      {
        id: 'target-ftes',
        title: "Target FTEs",
        value: "43.4",
        chartData: generateSeasonalTrend(43.4, 2),
        chartType: "area" as const,
        delay: 0.1,
        definition: "The number of resources needed to meet budgeted staffing levels.",
        calculation: `Target FTEs = (Expected Volume × Hours per Unit) / (Standard Hours per FTE × Expected Productivity %)`,
      },
      {
        id: 'fte-variance',
        title: "FTE Variance",
        value: "2.5",
        chartData: generateGrowthTrend(1.7, 2.5),
        chartType: "area" as const,
        delay: 0.15,
        definition: "Variance between Hired FTEs and Target FTEs.",
        calculation: `FTE Variance = Target FTEs - Hired FTEs`,
      },
      {
        id: 'open-reqs',
        title: "Open Reqs",
        value: "5",
        chartData: generateVolatileTrend(5, 2),
        chartType: "bar" as const,
        delay: 0.2,
        definition: "The number of approved requisitions that have not yet been filled.",
        calculation: `Open Requisitions = Count of all active job postings`,
      },
      {
        id: 'req-variance',
        title: "Req Variance",
        value: "2.5",
        chartData: generateGrowthTrend(1.3, 2.5),
        chartType: "line" as const,
        delay: 0.25,
        definition: "Variance between Hire FTEs plus Open Requisition and Target FTEs.",
        calculation: `Requisition Variance = FTE Variance - Open Requisitions`,
      },
    ];

    return kpis.sort((a, b) => {
      const aIndex = fteOrder.indexOf(a.id);
      const bIndex = fteOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [fteOrder]);

  // Volume KPIs Configuration
  const volumeKPIs = useMemo(() => {
    const monthLabels = generateLast12MonthLabels();
    
    const kpis = [
      {
        id: '12m-monthly',
        title: "12M Average",
        value: "633.5",
        chartData: generateGrowthTrend(565, 633.5, 30),
        chartType: "area" as const,
        delay: 0,
        xAxisLabels: monthLabels,
        definition: "Rolling 12-Month Average Monthly Volume.",
        calculation: `12M Avg Monthly = Sum of monthly volumes over 12 months / 12`,
      },
      {
        id: '12m-daily',
        title: "12M Daily Average",
        value: "20.8",
        chartData: generateGrowthTrend(19.8, 20.8, 30),
        chartType: "area" as const,
        delay: 0.05,
        xAxisLabels: monthLabels,
        definition: "12-Month Average Daily Volume.",
        calculation: `12M Avg Daily = Total volume over 12 months / Total working days`,
      },
      {
        id: '3m-low',
        title: "3M Low",
        value: "14.2",
        chartData: generateVolatileTrend(14.2, 3),
        chartType: "area" as const,
        delay: 0.1,
        xAxisLabels: monthLabels,
        definition: "3-Month Average Lowest Volume for minimum staffing requirements.",
        calculation: `3M Avg Lowest = Average daily volume during the 3 lowest-volume months`,
      },
      {
        id: '3m-high',
        title: "3M High",
        value: "28.4",
        chartData: generateVolatileTrend(28.4, 5),
        chartType: "bar" as const,
        delay: 0.15,
        xAxisLabels: monthLabels,
        definition: "3-Month Average Highest Volume for peak staffing requirements.",
        calculation: `3M Avg Highest = Average daily volume during the 3 highest-volume months`,
      },
      {
        id: 'target-vol',
        title: "Target Vol",
        value: "20.8",
        isHighlighted: true,
        chartData: generateSeasonalTrend(20.8, 3),
        chartType: "area" as const,
        delay: 0.2,
        xAxisLabels: monthLabels,
        definition: "Target Volume for staffing calculations and planning.",
        calculation: `Target Volume = Forecasted daily volume based on historical data`,
      },
      {
        id: 'override-vol',
        title: "Override Vol",
        value: "24.7",
        chartData: generateVolatileTrend(24.7, 4),
        chartType: "bar" as const,
        delay: 0.25,
        xAxisLabels: monthLabels,
        definition: "Manually adjusted volume target that supersedes calculated target.",
        calculation: `Override Volume = Manually entered volume target`,
      },
    ];

    return kpis.sort((a, b) => {
      const aIndex = volumeOrder.indexOf(a.id);
      const bIndex = volumeOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [volumeOrder]);

  // Productivity KPIs Configuration
  const productivityKPIs = useMemo(() => {
    const kpis = [
      {
        id: 'paid-ftes',
        title: "Paid FTEs",
        value: "38.2",
        chartData: generateGrowthTrend(35.8, 38.2),
        chartType: "bar" as const,
        delay: 0,
        definition: "Total labor resources the organization actually pays for.",
        calculation: `Total Paid Actual FTEs = Total paid hours / Standard FTE hours`,
      },
      {
        id: 'contract-ftes',
        title: "Contract FTEs",
        value: "5.7",
        chartData: generateSeasonalTrend(5.7, 1.2),
        chartType: "bar" as const,
        delay: 0.05,
        definition: "Total equivalent labor resources supplied by contract entities.",
        calculation: `Total Contract Actual FTEs = Contract hours worked / Standard FTE hours`,
      },
      {
        id: 'overtime-ftes',
        title: "Overtime FTEs",
        value: "2.1",
        chartData: generateDeclineTrend(2.4, 2.1),
        chartType: "area" as const,
        delay: 0.1,
        definition: "Total worked hours above regular commitment the organization pays for.",
        calculation: `Total Overtime FTEs = Total overtime hours / Standard FTE hours`,
      },
      {
        id: 'total-prn',
        title: "Total PRN",
        value: "12.4",
        chartData: generateGrowthTrend(10.6, 12.4),
        chartType: "bar" as const,
        delay: 0.15,
        definition: "Total PRNs productive equivalent labor resources.",
        calculation: `Total PRN = PRN hours worked / Standard FTE hours`,
      },
      {
        id: 'total-np',
        title: "Total NP%",
        value: "9.7%",
        chartData: generateGrowthTrend(8.1, 9.7),
        chartType: "area" as const,
        delay: 0.2,
        definition: "Percentage of paid hours not spent on patient care.",
        calculation: `Total NP% = Total non-productive Man hours / Total Paid hours × 100`,
      },
      {
        id: 'total-fullpart-ftes',
        title: "EMPLOYED PRODUCTIVE FTES",
        value: "35.3 / 5.6",
        chartData: generateGrowthTrend(33.8, 40.9),
        chartType: "bar" as const,
        delay: 0.25,
        definition: "Total Full-time, Part-Time and PRNs productive equivalent labor resources.",
        calculation: `Full Time FTEs + Part Time FTEs = Total Employed Productive FTEs`,
      },
    ];

    return kpis.sort((a, b) => {
      const aIndex = productivityOrder.indexOf(a.id);
      const bIndex = productivityOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [productivityOrder]);

  const sections = useMemo(() => [
    { id: 'fte', title: 'FTE', kpis: fteKPIs },
    { id: 'volume', title: 'Volume', kpis: volumeKPIs },
    { id: 'productivity', title: 'Productive Resources', kpis: productivityKPIs },
  ], [fteKPIs, volumeKPIs, productivityKPIs]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ascension"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="KPI Summary"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>KPI Summary</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-none w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Staffing KPI Summary</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(95vh-80px)]">
            <div className="p-6">
              <DraggableSectionsContainer
                sections={sections}
                sectionOrder={sectionOrder}
                onSectionReorder={setSectionOrder}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
