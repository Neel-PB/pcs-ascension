import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";

import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { FilterBar } from "@/components/staffing/FilterBar";
import PositionPlanning from "./PositionPlanning";
import { VarianceAnalysis } from "./VarianceAnalysis";
import { ForecastTab } from "./ForecastTab";
import { SettingsTab } from "./SettingsTab";
import { NPSettingsTab } from "./NPSettingsTab";
import { DraggableSectionsContainer } from "@/components/staffing/DraggableSectionsContainer";
import { useKPIOrderStore } from "@/stores/useKPIOrderStore";
import { generateLast12MonthLabels } from "@/lib/utils";

import { WorkforceDrawer } from "@/components/workforce/WorkforceDrawer";
import { WorkforceDrawerTrigger } from "@/components/workforce/WorkforceDrawerTrigger";
import { useRBAC } from "@/hooks/useRBAC";
import { isKpiVisible } from "@/config/kpiVisibility";
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { useFilterStore } from "@/stores/useFilterStore";
import { StaffingTour } from "@/components/tour/StaffingTour";
import { useVolumeOverrides } from "@/hooks/useVolumeOverrides";
import { usePatientVolume } from "@/hooks/usePatientVolume";
import { useProductiveResourcesKpi } from "@/hooks/useProductiveResourcesKpi";
import { useSkillShift } from "@/hooks/useSkillShift";
import { useEmploymentSplit } from "@/hooks/useEmploymentSplit";

const validTabs = ["summary", "planning", "variance", "forecasts", "volume-settings", "np-settings"];

export default function StaffingSummary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && validTabs.includes(tabParam) ? tabParam : "summary"
  );

  // Clear the search param once consumed so it doesn't get stale
  useEffect(() => {
    if (tabParam) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('tab');
        return next;
      }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { hasPermission, loading: rbacLoading, roles } = useRBAC();
  const { defaultFilters, isLoading: orgScopedLoading, isReady: orgScopedReady } = useOrgScopedFilters();
  
  // Shared filter store
  const {
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedSubmarket,
    selectedPstat,
    selectedLevel2,
    selectedDepartment,
    filtersInitialized,
    setRegion,
    setMarket,
    setFacility,
    setSubmarket,
    setPstat,
    setLevel2,
    setDepartment,
    initializeFromDefaults,
    clearFilters,
  } = useFilterStore();
  
  // Get filter visibility permissions from RBAC
  const { getFilterPermissions } = useRBAC();
  
  // Initialize filters from org-scoped defaults once READY (one-shot via store)
  useEffect(() => {
    if (orgScopedReady && !rbacLoading && !filtersInitialized && defaultFilters) {
      const filterPerms = getFilterPermissions();
      initializeFromDefaults(defaultFilters, {
        region: filterPerms.region,
        market: filterPerms.market,
      });
    }
  }, [orgScopedReady, rbacLoading, filtersInitialized, defaultFilters, getFilterPermissions, initializeFromDefaults]);

  // Build tabs based on permissions
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "summary", label: "Summary" },
      { id: "planning", label: "Planned/Active Resources" },
      { id: "variance", label: "Variance Analysis" },
      { id: "forecasts", label: "Forecasts" },
    ];
    
    if (hasPermission("settings.volume_override")) {
      baseTabs.push({ id: "volume-settings", label: "Volume Settings" });
    }
    
    if (hasPermission("settings.np_override")) {
      baseTabs.push({ id: "np-settings", label: "NP Settings" });
    }
    
    return baseTabs;
  }, [hasPermission]);

  // Realistic chart data generators
  const generateGrowthTrend = (start: number, end: number, points: number = 24) => 
    Array.from({ length: points }, (_, i) => ({
      value: i === points - 1 ? end : start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2
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

  // KPI Order Store
  const { 
    fte: fteOrder, 
    volume: volumeOrder, 
    productivity: productivityOrder, 
    sectionOrder,
    setOrder,
    setSectionOrder 
  } = useKPIOrderStore();

  // Fetch volume overrides for the selected facility
  const facilityForOverrides = selectedFacility === "all-facilities" ? null : selectedFacility;
  const { data: volumeOverrides } = useVolumeOverrides(facilityForOverrides);

  // Fetch patient volume data from API
  const { data: patientVolumeData, isLoading: pvLoading } = usePatientVolume({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
    department: selectedDepartment,
    submarket: selectedSubmarket,
    level2: selectedLevel2,
    pstat: selectedPstat,
    enabled: filtersInitialized,
  });
  // Fetch productive resources KPI data from API
  const { data: prKpiData, isLoading: prLoading } = useProductiveResourcesKpi({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
    department: selectedDepartment,
    submarket: selectedSubmarket,
    level2: selectedLevel2,
    pstat: selectedPstat,
    enabled: filtersInitialized,
  });

  // Fetch skill-shift data for FTE KPIs
  const { data: skillShiftData, isLoading: ssLoading } = useSkillShift({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
    department: selectedDepartment,
    submarket: selectedSubmarket,
    level2: selectedLevel2,
    pstat: selectedPstat,
    enabled: filtersInitialized,
  });

  // Fetch employment split for Hired FTEs breakdown
  const { breakdown: hiredSplitBreakdown } = useEmploymentSplit({
    region: selectedRegion,
    market: selectedMarket,
    facility: selectedFacility,
    department: selectedDepartment,
    submarket: selectedSubmarket,
    level2: selectedLevel2,
    pstat: selectedPstat,
    enabled: filtersInitialized,
  });

  const prAgg = useMemo(() => {
    if (!prKpiData?.length) return null;
    return prKpiData.reduce(
      (acc, r) => ({
        paid_fte: acc.paid_fte + Number(r.paid_fte ?? 0),
        contractor_fte: acc.contractor_fte + Number(r.contractor_fte ?? 0),
        overtime_fte: acc.overtime_fte + Number(r.overtime_fte ?? 0),
        total_prn: acc.total_prn + Number(r.total_prn ?? 0),
        employed_productive_fte: acc.employed_productive_fte + Number(r.employed_productive_fte ?? 0),
        np_weighted_sum: acc.np_weighted_sum + Number(r.non_productive_percentage ?? 0) * Number(r.paid_fte ?? 0),
        total_paid_for_weight: acc.total_paid_for_weight + Number(r.paid_fte ?? 0),
      }),
      { paid_fte: 0, contractor_fte: 0, overtime_fte: 0, total_prn: 0, employed_productive_fte: 0, np_weighted_sum: 0, total_paid_for_weight: 0 },
    );
  }, [prKpiData]);

  // Aggregate skill-shift data for FTE KPIs
  const ssAgg = useMemo(() => {
    if (!skillShiftData?.length) return null;
    return skillShiftData.reduce(
      (acc, r) => {
        const nf = String(r.nursing_flag).toLowerCase();
        const isNursing = nf === 'y' || nf === 'true' || nf === '1';
        return {
          hired_total_fte: acc.hired_total_fte + Number(r.hired_total_fte ?? 0),
          open_reqs_total_fte: acc.open_reqs_total_fte + Number(r.open_reqs_total_fte ?? 0),
          nursing_target_fte: acc.nursing_target_fte + (isNursing ? Number(r.target_fte_total ?? 0) : 0),
        };
      },
      { hired_total_fte: 0, open_reqs_total_fte: 0, nursing_target_fte: 0 },
    );
  }, [skillShiftData]);

  // Aggregate skill-shift data by skill_mix for pie charts (including day/night and nursing splits)
  const skillMixPieData = useMemo(() => {
    if (!skillShiftData?.length) return {
      hired: [], openReqs: [], target: [],
      hiredDay: [], hiredNight: [], targetDay: [], targetNight: [],
      hiredDayNursing: [], hiredNightNursing: [], hiredDayNonNursing: [], hiredNightNonNursing: [],
      openReqsDayNursing: [], openReqsNightNursing: [], openReqsDayNonNursing: [], openReqsNightNonNursing: [],
    };
    
    const bySkill: Record<string, {
      hired: number; openReqs: number; target: number;
      hiredDay: number; hiredNight: number; targetDay: number; targetNight: number;
      hiredDayNursing: number; hiredNightNursing: number; hiredDayNonNursing: number; hiredNightNonNursing: number;
      openReqsDayNursing: number; openReqsNightNursing: number; openReqsDayNonNursing: number; openReqsNightNonNursing: number;
    }> = {};
    
    skillShiftData.forEach(r => {
      const key = r.skill_mix || r.broader_skill_mix_category || 'Other';
      if (!bySkill[key]) bySkill[key] = {
        hired: 0, openReqs: 0, target: 0, hiredDay: 0, hiredNight: 0, targetDay: 0, targetNight: 0,
        hiredDayNursing: 0, hiredNightNursing: 0, hiredDayNonNursing: 0, hiredNightNonNursing: 0,
        openReqsDayNursing: 0, openReqsNightNursing: 0, openReqsDayNonNursing: 0, openReqsNightNonNursing: 0,
      };
      bySkill[key].hired += Number(r.hired_total_fte ?? 0);
      bySkill[key].hiredDay += Number(r.hired_day_fte ?? 0);
      bySkill[key].hiredNight += Number(r.hired_night_fte ?? 0);
      bySkill[key].openReqs += Number(r.open_reqs_total_fte ?? 0);
      
      const nf = String(r.nursing_flag).toLowerCase();
      const isNursing = nf === 'y' || nf === 'true' || nf === '1';
      if (isNursing) {
        bySkill[key].target += Number(r.target_fte_total ?? 0);
        bySkill[key].targetDay += Number(r.target_fte_day ?? 0);
        bySkill[key].targetNight += Number(r.target_fte_night ?? 0);
        bySkill[key].hiredDayNursing += Number(r.hired_day_fte ?? 0);
        bySkill[key].hiredNightNursing += Number(r.hired_night_fte ?? 0);
        bySkill[key].openReqsDayNursing += Number(r.open_reqs_day_fte ?? 0);
        bySkill[key].openReqsNightNursing += Number(r.open_reqs_night_fte ?? 0);
      } else {
        bySkill[key].hiredDayNonNursing += Number(r.hired_day_fte ?? 0);
        bySkill[key].hiredNightNonNursing += Number(r.hired_night_fte ?? 0);
        bySkill[key].openReqsDayNonNursing += Number(r.open_reqs_day_fte ?? 0);
        bySkill[key].openReqsNightNonNursing += Number(r.open_reqs_night_fte ?? 0);
      }
    });

    const toSorted = (field: keyof typeof bySkill[string]) =>
      Object.entries(bySkill)
        .map(([name, v]) => ({ name, value: Math.round(v[field] * 10) / 10 }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);

    return {
      hired: toSorted('hired'),
      openReqs: toSorted('openReqs'),
      target: toSorted('target'),
      hiredDay: toSorted('hiredDay'),
      hiredNight: toSorted('hiredNight'),
      targetDay: toSorted('targetDay'),
      targetNight: toSorted('targetNight'),
      hiredDayNursing: toSorted('hiredDayNursing'),
      hiredNightNursing: toSorted('hiredNightNursing'),
      hiredDayNonNursing: toSorted('hiredDayNonNursing'),
      hiredNightNonNursing: toSorted('hiredNightNonNursing'),
      openReqsDayNursing: toSorted('openReqsDayNursing'),
      openReqsNightNursing: toSorted('openReqsNightNursing'),
      openReqsDayNonNursing: toSorted('openReqsDayNonNursing'),
      openReqsNightNonNursing: toSorted('openReqsNightNonNursing'),
    };
  }, [skillShiftData]);

  // Vacancy rate by skill mix for chart options
  const vacancyBySkillMix = useMemo(() => {
    if (!skillShiftData?.length) return [];
    const bySkill: Record<string, { hired: number; target: number }> = {};
    skillShiftData.forEach(r => {
      const skill = r.skill_mix || r.broader_skill_mix_category || 'Other';
      if (!bySkill[skill]) bySkill[skill] = { hired: 0, target: 0 };
      bySkill[skill].hired += Number(r.hired_total_fte ?? 0);
      bySkill[skill].target += Number(r.target_fte_total ?? 0);
    });
    return Object.entries(bySkill)
      .map(([name, v]) => ({
        name,
        hired: Math.round(v.hired * 10) / 10,
        target: Math.round(v.target * 10) / 10,
        gap: Math.round(Math.max(0, v.target - v.hired) * 10) / 10,
        vacancyRate: v.target > 0 ? Math.round(Math.abs((v.hired - v.target) / v.target) * 1000) / 10 : 0,
        value: v.target > 0 ? Math.round(Math.abs((v.hired - v.target) / v.target) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.vacancyRate - a.vacancyRate);
  }, [skillShiftData]);

  // Paid FTEs by department for chart options
  const paidByDept = useMemo(() => {
    if (!prKpiData?.length) return [];
    const byDept: Record<string, { paid: number; employed: number; contractor: number; overtime: number; prn: number }> = {};
    prKpiData.forEach(r => {
      const dept = r.department_description || 'Unknown';
      if (!byDept[dept]) byDept[dept] = { paid: 0, employed: 0, contractor: 0, overtime: 0, prn: 0 };
      byDept[dept].paid += Number(r.paid_fte ?? 0);
      byDept[dept].employed += Number(r.employed_productive_fte ?? 0);
      byDept[dept].contractor += Number(r.contractor_fte ?? 0);
      byDept[dept].overtime += Number(r.overtime_fte ?? 0);
      byDept[dept].prn += Number(r.total_prn ?? 0);
    });
    return Object.entries(byDept)
      .map(([name, v]) => ({
        name,
        paid: Math.round(v.paid * 10) / 10,
        employed: Math.round(v.employed * 10) / 10,
        contractor: Math.round(v.contractor * 10) / 10,
        overtime: Math.round(v.overtime * 10) / 10,
        prn: Math.round(v.prn * 10) / 10,
        value: Math.round(v.paid * 10) / 10,
      }))
      .sort((a, b) => b.paid - a.paid);
  }, [prKpiData]);

  // NP% by department for Total NP% chart options
  const npByDept = useMemo(() => {
    if (!prKpiData?.length) return [];
    const byDept: Record<string, { weightedNp: number; totalPaid: number }> = {};
    prKpiData.forEach(r => {
      const dept = r.department_description || 'Unknown';
      if (!byDept[dept]) byDept[dept] = { weightedNp: 0, totalPaid: 0 };
      const paid = Number(r.paid_fte ?? 0);
      byDept[dept].weightedNp += Number(r.non_productive_percentage ?? 0) * paid;
      byDept[dept].totalPaid += paid;
    });
    return Object.entries(byDept)
      .filter(([, v]) => v.totalPaid > 0)
      .map(([name, v]) => ({
        name,
        npPercent: Math.round((v.weightedNp / v.totalPaid) * 10) / 10,
        paidHours: Math.round(v.totalPaid * 10) / 10,
        npHours: Math.round((v.weightedNp / v.totalPaid / 100) * v.totalPaid * 10) / 10,
        productiveHours: Math.round((1 - v.weightedNp / v.totalPaid / 100) * v.totalPaid * 10) / 10,
        value: Math.round((v.weightedNp / v.totalPaid) * 10) / 10,
      }))
      .sort((a, b) => b.npPercent - a.npPercent);
  }, [prKpiData]);

  // 28-day daily trend aggregation for Productive Resources area charts
  const { dailyTrendData, dailyTrendLabels } = useMemo(() => {
    if (!prKpiData?.length) return { dailyTrendData: [], dailyTrendLabels: [] as string[] };

    // Group by date
    const byDate: Record<string, { paid: number; contractor: number; overtime: number; prn: number; employed: number; npWeighted: number; totalPaid: number }> = {};
    prKpiData.forEach(r => {
      const dateKey = String(r.date ?? '').trim();
      if (!dateKey) return;
      if (!byDate[dateKey]) byDate[dateKey] = { paid: 0, contractor: 0, overtime: 0, prn: 0, employed: 0, npWeighted: 0, totalPaid: 0 };
      const paid = Number(r.paid_fte ?? 0);
      byDate[dateKey].paid += paid;
      byDate[dateKey].contractor += Number(r.contractor_fte ?? 0);
      byDate[dateKey].overtime += Number(r.overtime_fte ?? 0);
      byDate[dateKey].prn += Number(r.total_prn ?? 0);
      byDate[dateKey].employed += Number(r.employed_productive_fte ?? 0);
      byDate[dateKey].npWeighted += Number(r.non_productive_percentage ?? 0) * paid;
      byDate[dateKey].totalPaid += paid;
    });

    // Sort chronologically
    const sortedDates = Object.keys(byDate).sort((a, b) => a.localeCompare(b));

    const labels = sortedDates.map(d => {
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) ? format(parsed, 'MM/dd') : d;
    });

    const data = sortedDates.map(dateKey => {
      const d = byDate[dateKey];
      return {
        day: dateKey,
        paid_fte: Math.round(d.paid * 10) / 10,
        contractor_fte: Math.round(d.contractor * 10) / 10,
        overtime_fte: Math.round(d.overtime * 10) / 10,
        total_prn: Math.round(d.prn * 10) / 10,
        employed_productive_fte: Math.round(d.employed * 10) / 10,
        npPercent: d.totalPaid > 0 ? Math.round((d.npWeighted / d.totalPaid) * 10) / 10 : 0,
      };
    });

    return { dailyTrendData: data, dailyTrendLabels: labels };
  }, [prKpiData]);

  // Non-nursing target from productive-resources-kpi
  const nonNursingTarget = useMemo(() => {
    if (!prKpiData?.length) return 0;
    return prKpiData
      .filter(r => {
        const nf = String(r.nursing_flag).toLowerCase();
        return nf === 'false' || nf === 'n' || nf === '0';
      })
      .reduce((sum, r) => sum + Number(r.target_fte ?? 0), 0);
  }, [prKpiData]);

  const hasNursingData = useMemo(() => {
    if (!skillShiftData?.length) return false;
    return skillShiftData.some(r => {
      const nf = String(r.nursing_flag).toLowerCase();
      return nf === 'y' || nf === 'true' || nf === '1';
    });
  }, [skillShiftData]);

  // Derived FTE KPI values
  const fteKpiValues = useMemo(() => {
    const hiredFtes = ssAgg?.hired_total_fte ?? null;
    const targetFtes = ssAgg != null ? ssAgg.nursing_target_fte + nonNursingTarget : null;
    const openReqs = ssAgg?.open_reqs_total_fte ?? null;
    const fteVariance = targetFtes != null && hiredFtes != null ? hiredFtes - targetFtes : null;
    const reqVariance = fteVariance != null && openReqs != null ? fteVariance + openReqs : null;
    const vacancyRate = fteVariance != null && targetFtes != null && targetFtes !== 0
      ? (fteVariance / targetFtes) * 100
      : null;
    return { hiredFtes, targetFtes, openReqs, fteVariance, reqVariance, vacancyRate };
  }, [ssAgg, nonNursingTarget]);

  const prNpPercent = useMemo(() => {
    if (!prAgg || prAgg.total_paid_for_weight === 0) return null;
    return prAgg.np_weighted_sum / prAgg.total_paid_for_weight;
  }, [prAgg]);

  const ROLLUP_PSTATS = useMemo(() => new Set([
    'Pat Days + Obs',
    'Total Pat Days + Obs',
    'Pat Days + Obs + Newborn Days',
  ]), []);

  const pvFilteredRecords = useMemo(() => {
    if (!patientVolumeData?.length) return [];
    const noDept = !selectedDepartment || selectedDepartment === 'all-departments';
    return noDept
      ? patientVolumeData.filter(r => ROLLUP_PSTATS.has(r.unit_of_service))
      : patientVolumeData;
  }, [patientVolumeData, selectedDepartment, ROLLUP_PSTATS]);

  // Volume breakdown by unit_of_service for badge display
  const volumeBreakdown = useMemo(() => {
    if (!pvFilteredRecords.length) return undefined;
    const byUos: Record<string, number> = {};
    pvFilteredRecords.forEach(r => {
      const uos = r.unit_of_service || 'Unknown';
      byUos[uos] = (byUos[uos] || 0) + Number(r.target_volume ?? 0);
    });
    return Object.entries(byUos)
      .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [pvFilteredRecords]);

  const pvAgg = useMemo(() => {
    if (!pvFilteredRecords.length) return null;
    return {
      mthly_avg_volume_12mth: pvFilteredRecords.reduce((s, r) => s + Number(r.mthly_avg_volume_12mth ?? 0), 0),
      dly_avg_volume_12mth: pvFilteredRecords.reduce((s, r) => s + Number(r.dly_avg_volume_12mth ?? 0), 0),
      dly_avg_volume_3mth_low: pvFilteredRecords.reduce((s, r) => s + Number(r.dly_avg_volume_3mth_low ?? 0), 0),
      dly_avg_volume_3mth_high: pvFilteredRecords.reduce((s, r) => s + Number(r.dly_avg_volume_3mth_high ?? 0), 0),
      target_volume: pvFilteredRecords.reduce((s, r) => s + Number(r.target_volume ?? 0), 0),
    };
  }, [pvFilteredRecords]);

  // Aggregate last_12_month_volume_stats into real trend data
  const { monthlyTrend, dailyTrend, lowHighTrend, trendLabels } = useMemo(() => {
    const empty = { monthlyTrend: [] as { value: number }[], dailyTrend: [] as { value: number }[], lowHighTrend: [] as { value: number }[], trendLabels: [] as string[] };
    if (!pvFilteredRecords.length) return empty;

    // Collect all stats across records, keyed by year_month
    const byMonth: Record<string, { mthly: number; dly: number; lowHigh: number }> = {};

    pvFilteredRecords.forEach(r => {
      let stats = r.last_12_month_volume_stats;
      if (!stats) return;
      if (typeof stats === 'string') {
        try { stats = JSON.parse(stats); } catch { return; }
      }
      if (!Array.isArray(stats)) return;
      stats.forEach((s: { year_month: string; patient_volume_dly: number; patient_volume_mthly: number; patient_volume_low_high: number }) => {
        if (!s.year_month) return;
        if (!byMonth[s.year_month]) byMonth[s.year_month] = { mthly: 0, dly: 0, lowHigh: 0 };
        byMonth[s.year_month].mthly += Number(s.patient_volume_mthly ?? 0);
        byMonth[s.year_month].dly += Number(s.patient_volume_dly ?? 0);
        byMonth[s.year_month].lowHigh += Number(s.patient_volume_low_high ?? 0);
      });
    });

    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    if (!sorted.length) return empty;

    return {
      monthlyTrend: sorted.map(([, v]) => ({ value: Math.round(v.mthly * 100) / 100 })),
      dailyTrend: sorted.map(([, v]) => ({ value: Math.round(v.dly * 100) / 100 })),
      lowHighTrend: sorted.map(([, v]) => ({ value: Math.round(v.lowHigh * 100) / 100 })),
      trendLabels: sorted.map(([ym]) => format(new Date(ym), "MMM''yy")),
    };
  }, [pvFilteredRecords]);



  const overrideKpiData = useMemo(() => {
    if (selectedDepartment === "all-departments") {
      return { value: "Select Department", hasData: false, isActive: false };
    }
    
    const match = volumeOverrides?.find(o => o.department_id === selectedDepartment);
    if (!match) {
      return { value: "No Override Found", hasData: false, isActive: false };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(match.expiry_date);
    if (expiry < today) {
      return { value: "No Override Found", hasData: false, isActive: false };
    }
    
    return { value: String(match.override_volume), hasData: true, isActive: true };
  }, [selectedDepartment, volumeOverrides]);

  // FTE KPIs Configuration – wired to skill-shift + productive-resources-kpi APIs
  const fteKPIs = useMemo(() => {
    const fmt = (v: number | null) =>
      v != null ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—";
    const fmtPct = (v: number | null) =>
      v != null ? `${v.toFixed(1)}%` : "—";

    const { hiredFtes, targetFtes, openReqs, fteVariance, reqVariance, vacancyRate } = fteKpiValues;

    const kpis = [
      {
        id: 'vacancy-rate',
        title: "Vacancy Rate",
        value: fmtPct(vacancyRate),
        chartData: hasNursingData && skillMixPieData.hiredDay.length > 0
          ? [
              { shift: 'Day', slices: skillMixPieData.hiredDay, total: Math.round(skillMixPieData.hiredDay.reduce((s, d) => s + d.value, 0) * 10) / 10 },
              { shift: 'Night', slices: skillMixPieData.hiredNight, total: Math.round(skillMixPieData.hiredNight.reduce((s, d) => s + d.value, 0) * 10) / 10 },
            ]
          : (hasNursingData && vacancyBySkillMix.length > 0 ? vacancyBySkillMix.map(d => ({ name: d.name, value: d.hired })) : []),
        chartType: (hasNursingData && skillMixPieData.hiredDay.length > 0 ? "dual-pie" : "pie") as any,
        delay: 0,
        definition: "Vacancy Rate measures the percentage of Approved budgeted positions that are currently unfilled.",
        calculation: `Vacancy Rate = (FTE Variance / Target FTEs) × 100

Example: If FTE Variance is ${fmt(fteVariance)} and Target is ${fmt(targetFtes)}:
(${fmt(fteVariance)} / ${fmt(targetFtes)}) × 100 = ${fmtPct(vacancyRate)}`,
      },
      {
        id: 'hired-ftes',
        title: "Hired FTEs",
        value: fmt(hiredFtes),
        chartData: (skillMixPieData.hiredDayNursing.length > 0 || skillMixPieData.hiredDayNonNursing.length > 0)
          ? [
              {
                category: 'Nursing',
                inner: { shift: 'Night', slices: skillMixPieData.hiredNightNursing, total: Math.round(skillMixPieData.hiredNightNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
                outer: { shift: 'Day', slices: skillMixPieData.hiredDayNursing, total: Math.round(skillMixPieData.hiredDayNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
              },
              {
                category: 'Non-Nursing',
                inner: { shift: 'Night', slices: skillMixPieData.hiredNightNonNursing, total: Math.round(skillMixPieData.hiredNightNonNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
                outer: { shift: 'Day', slices: skillMixPieData.hiredDayNonNursing, total: Math.round(skillMixPieData.hiredDayNonNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
              },
            ]
          : (skillMixPieData.hired.length > 0 ? skillMixPieData.hired : (hiredFtes != null ? generateGrowthTrend(hiredFtes * 0.9, hiredFtes) : [])),
        chartType: (skillMixPieData.hiredDayNursing.length > 0 || skillMixPieData.hiredDayNonNursing.length > 0)
          ? "nested-pie" as any
          : (skillMixPieData.hired.length > 0 ? "pie" as const : "bar" as const),
        delay: 0.05,
        definition: "Total Full-time, Part-Time and PRNs equivalent labor resources currently employed by the organization (PRNs counted as 0.2 FTEs commitment).",
        calculation: `Hired FTEs = Sum of all active employee FTEs from Skill-Shift data

Includes:
• Full-time staff (1.0 FTE each)
• Part-time staff (0.5, 0.8, etc.)
• Active employees only (excludes open positions)`,
        employmentBreakdown: hiredSplitBreakdown ?? { ft: 0, pt: 0, prn: 0 },
        breakdownVariant: 'orange' as const,
      },
      {
        id: 'target-ftes',
        title: "Target FTEs",
        value: fmt(targetFtes),
        chartData: hasNursingData && skillMixPieData.targetDay.length > 0
          ? [
              { shift: 'Day', slices: skillMixPieData.targetDay, total: Math.round(skillMixPieData.targetDay.reduce((s, d) => s + d.value, 0) * 10) / 10 },
              { shift: 'Night', slices: skillMixPieData.targetNight, total: Math.round(skillMixPieData.targetNight.reduce((s, d) => s + d.value, 0) * 10) / 10 },
            ]
          : (hasNursingData && skillMixPieData.target.length > 0 ? skillMixPieData.target : []),
        chartType: (hasNursingData && skillMixPieData.targetDay.length > 0 ? "dual-pie" : (skillMixPieData.target.length > 0 ? "pie" : "area")) as any,
        delay: 0.1,
        definition: "The number of resources needed to meet budgeted staffing levels based on specific type and amount of Unit of Service. Combines nursing targets from Skill-Shift and non-nursing targets from Productive Resources.",
        calculation: `Target FTEs = Nursing Target (Skill-Shift) + Non-Nursing Target (Productive Resources)

Nursing Target: ${fmt(ssAgg?.nursing_target_fte ?? null)}
Non-Nursing Target: ${fmt(nonNursingTarget)}
Combined: ${fmt(targetFtes)}`,
        employmentBreakdown: { ft: 70, pt: 20, prn: 10 },
        breakdownVariant: 'green' as const,
      },
      {
        id: 'fte-variance',
        title: "FTE Variance",
        value: fmt(fteVariance),
        chartData: [],
        chartType: "area" as const,
        delay: 0.15,
        definition: "The difference between Hired FTEs and Target FTEs (Hired FTEs − Target FTEs). A negative value indicates understaffing.",
        calculation: `FTE Variance = Hired FTEs - Target FTEs

Example: If hired is ${fmt(hiredFtes)} and target is ${fmt(targetFtes)}:
${fmt(hiredFtes)} - ${fmt(targetFtes)} = ${fmt(fteVariance)}`,
      },
      {
        id: 'open-reqs',
        title: "Open Reqs",
        value: fmt(openReqs),
        chartData: (skillMixPieData.openReqsDayNursing.length > 0 || skillMixPieData.openReqsDayNonNursing.length > 0)
          ? [
              {
                category: 'Nursing',
                inner: { shift: 'Night', slices: skillMixPieData.openReqsNightNursing, total: Math.round(skillMixPieData.openReqsNightNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
                outer: { shift: 'Day', slices: skillMixPieData.openReqsDayNursing, total: Math.round(skillMixPieData.openReqsDayNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
              },
              {
                category: 'Non-Nursing',
                inner: { shift: 'Night', slices: skillMixPieData.openReqsNightNonNursing, total: Math.round(skillMixPieData.openReqsNightNonNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
                outer: { shift: 'Day', slices: skillMixPieData.openReqsDayNonNursing, total: Math.round(skillMixPieData.openReqsDayNonNursing.reduce((s, d) => s + d.value, 0) * 10) / 10 },
              },
            ]
          : (skillMixPieData.openReqs.length > 0 ? skillMixPieData.openReqs : (openReqs != null ? generateVolatileTrend(openReqs, 2) : [])),
        chartType: (skillMixPieData.openReqsDayNursing.length > 0 || skillMixPieData.openReqsDayNonNursing.length > 0)
          ? "nested-pie" as any
          : (skillMixPieData.openReqs.length > 0 ? "pie" as const : "bar" as const),
        delay: 0.2,
        decimalPlaces: 0,
        definition: "The number of approved requisitions that have not yet been successfully filled.",
        calculation: `Open Requisitions = Sum of open_reqs_total_fte from Skill-Shift data

Includes:
• Approved requisitions in recruiting
• Positions being screened/interviewed
• Offers extended but not yet accepted
Excludes: Filled positions, withdrawn postings`,
      },
      {
        id: 'req-variance',
        title: "Req Variance",
        value: fmt(reqVariance),
        chartData: [],
        chartType: "line" as const,
        delay: 0.25,
        definition: "The remaining staffing gap after accounting for open requisitions. Calculated as Hired FTEs − Target FTEs + Open Requisitions. A negative value indicates understaffing even after considering active recruitment.",
        calculation: `Requisition Variance = Hired FTEs - Target FTEs + Open Requisitions

Example: ${fmt(hiredFtes)} - ${fmt(targetFtes)} + ${fmt(openReqs)} = ${fmt(reqVariance)}`,
      },
    ];

    return kpis.sort((a, b) => {
      const aIndex = fteOrder.indexOf(a.id);
      const bIndex = fteOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [fteOrder, fteKpiValues, ssAgg, nonNursingTarget, hiredSplitBreakdown, skillMixPieData]);

  // Volume KPIs Configuration – wired to patient-volume API
  const volumeKPIs = useMemo(() => {
    const monthLabels = generateLast12MonthLabels();
    const volLabels = trendLabels.length > 0 ? trendLabels : monthLabels;
    const fmt = (v: number | null | undefined) =>
      v != null ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";

    const mthly12 = pvAgg?.mthly_avg_volume_12mth ?? null;
    const dly12 = pvAgg?.dly_avg_volume_12mth ?? null;
    const low3 = pvAgg?.dly_avg_volume_3mth_low ?? null;
    const high3 = pvAgg?.dly_avg_volume_3mth_high ?? null;
    const targetVol = pvAgg?.target_volume ?? null;

    const kpis = [
      {
        id: '12m-monthly',
        title: "12M Average",
        value: fmt(mthly12),
        chartData: monthlyTrend.length > 0 ? monthlyTrend : (mthly12 != null ? generateGrowthTrend(mthly12 * 0.9, mthly12, 12) : []),
        chartType: "area" as const,
        delay: 0,
        xAxisLabels: volLabels,
        definition: "Rolling 12-Month Average Monthly Volume represents the average number of patient encounters, procedures, or units of service delivered per month over the immediately preceding 12 months.",
        calculation: `12M Avg Monthly = Sum of monthly volumes over 12 months / 12

Example: If total volume over 12 months is 7,602:
7,602 / 12 = 633.5 average per month`,
      },
      {
        id: '12m-daily',
        title: "12M Daily Average",
        value: fmt(dly12),
        chartData: dailyTrend.length > 0 ? dailyTrend : (dly12 != null ? generateGrowthTrend(dly12 * 0.9, dly12, 12) : []),
        chartType: "area" as const,
        delay: 0.05,
        xAxisLabels: volLabels,
        definition: "12-Month Average Daily Volume represents the average number of patient encounters, procedures, or units of service delivered per day over the past 12 months.",
        calculation: `12M Avg Daily = Total volume over 12 months / Total working days

Example: If total volume is 7,602 over 365 days:
7,602 / 365 = 20.8 average per day`,
      },
      {
        id: '3m-low',
        title: "3M Low",
        value: fmt(low3),
        chartData: lowHighTrend.length > 0 ? lowHighTrend : (low3 != null ? generateVolatileTrend(low3, 3, 12) : []),
        chartType: "area" as const,
        delay: 0.1,
        xAxisLabels: volLabels,
        definition: "3-Month Average Lowest Volume shows the average daily volume recorded during the three months with the lowest total volume in the immediately preceding 12 months. This value is used to determine minimum staffing requirements.",
        calculation: `3M Avg Lowest = Average daily volume during the 3 lowest-volume months in past 12 months

Calculated by:
• Identifying the 3 consecutive months with lowest total volume in past 12 months
• Calculating average daily volume across those 3 months
• Used for minimum staffing level planning`,
        highlightPoints: 'lowest-3' as const,
      },
      {
        id: '3m-high',
        title: "3M High",
        value: fmt(high3),
        chartData: lowHighTrend.length > 0 ? lowHighTrend : (high3 != null ? generateVolatileTrend(high3, 5, 12) : []),
        chartType: "area" as const,
        delay: 0.15,
        xAxisLabels: volLabels,
        definition: "3-Month Average Highest Volume shows the average daily volume recorded during the three months with the highest total volume in the immediately preceding 12 months. This value is used to determine maximum capacity or peak staffing requirements.",
        calculation: `3M Avg Highest = Average daily volume during the 3 highest-volume months in past 12 months

Calculated by:
• Identifying the 3 consecutive months with highest total volume in past 12 months
• Calculating average daily volume across those 3 months
• Used for peak staffing level planning`,
        highlightPoints: 'highest-3' as const,
      },
      {
        id: 'target-vol',
        title: "Target Vol",
        value: fmt(targetVol),
        isHighlighted: !overrideKpiData.isActive,
        chartData: dailyTrend.length > 0 ? dailyTrend : (targetVol != null ? generateSeasonalTrend(targetVol, targetVol * 0.15, 12) : []),
        chartType: "area" as const,
        delay: 0.2,
        xAxisLabels: volLabels,
        definition: "Target Volume represents the expected daily volume used for staffing calculations and planning. This is typically based on historical trends and projected growth.",
        calculation: `Target Volume = Forecasted daily volume based on historical data and growth projections

Determined by:
• 12-month historical average
• Seasonal adjustment factors
• Strategic growth targets
• Market conditions`,
        customChartContent: targetVolChartContent,
      },
      {
        id: 'override-vol',
        title: "Override Vol",
        value: overrideKpiData.value,
        isHighlighted: overrideKpiData.isActive,
        chartData: overrideKpiData.hasData ? generateVolatileTrend(Number(overrideKpiData.value), 4, 12) : [],
        chartType: "bar" as const,
        delay: 0.25,
        xAxisLabels: monthLabels,
        definition: overrideKpiData.isActive
          ? "Override Volume is a manually adjusted volume target that supersedes the calculated target volume. This override is currently active."
          : selectedDepartment === "all-departments"
            ? "Select a specific department to view its override volume."
            : "No active override volume exists for this department. Override Volume is a manually adjusted volume target that supersedes the calculated target volume.",
        calculation: `Override Volume = Manually entered volume target

Used when:
• Known upcoming service changes
• Special projects or initiatives
• Temporary capacity adjustments
• Market-specific factors not in historical data`,
      },
    ];

    return kpis.sort((a, b) => {
      const aIndex = volumeOrder.indexOf(a.id);
      const bIndex = volumeOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [volumeOrder, overrideKpiData, pvAgg, selectedDepartment, monthlyTrend, dailyTrend, trendLabels, targetVolChartContent]);

  // Productivity KPIs Configuration – wired to productive-resources-kpi API
  const productivityKPIs = useMemo(() => {
    const fmt = (v: number | null | undefined) =>
      v != null ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—";
    const fmtPct = (v: number | null | undefined) =>
      v != null ? `${v.toFixed(1)}%` : "—";

    const dowPaidChart = dailyTrendData.length > 0 ? dailyTrendData.map((d, i) => ({ value: d.paid_fte, name: dailyTrendLabels[i] ?? d.day })) : [];
    const dowContractChart = dailyTrendData.length > 0 ? dailyTrendData.map((d, i) => ({ value: d.contractor_fte, name: dailyTrendLabels[i] ?? d.day })) : [];
    const dowOvertimeChart = dailyTrendData.length > 0 ? dailyTrendData.map((d, i) => ({ value: d.overtime_fte, name: dailyTrendLabels[i] ?? d.day })) : [];
    const dowPrnChart = dailyTrendData.length > 0 ? dailyTrendData.map((d, i) => ({ value: d.total_prn, name: dailyTrendLabels[i] ?? d.day })) : [];
    const dowNpChart = dailyTrendData.length > 0 ? dailyTrendData.map((d, i) => ({ value: d.npPercent, name: dailyTrendLabels[i] ?? d.day })) : [];
    const dowEmployedChart = dailyTrendData.length > 0 ? dailyTrendData.map((d, i) => ({ value: d.employed_productive_fte, name: dailyTrendLabels[i] ?? d.day })) : [];

    const kpis = [
      {
        id: 'paid-ftes',
        title: "Paid FTEs",
        value: fmt(prAgg?.paid_fte ?? null),
        chartData: dowPaidChart.length > 0 ? dowPaidChart : [],
        chartType: "area" as const,
        xAxisLabels: dailyTrendLabels,
        delay: 0,
        definition: "Total labor resources the organization actually pays for, regardless of whether those hours are productive or non-productive.",
        calculation: `Total Paid Actual FTEs = Total paid hours / Standard FTE hours

Example: If 7,928 hours were paid in a 2-week period:
7,928 / (40 hours × 2 weeks × 52 periods) = 38.2 FTEs`,
      },
      {
        id: 'contract-ftes',
        title: "Contract FTEs",
        value: fmt(prAgg?.contractor_fte ?? null),
        chartData: dowContractChart.length > 0 ? dowContractChart : [],
        chartType: "area" as const,
        xAxisLabels: dailyTrendLabels,
        delay: 0.05,
        definition: "Total equivalent labor resources supplied by entities that are not Acute Ascension Hospitals, that are paid for and used by the organization.",
        calculation: `Total Contract Actual FTEs = Contract hours worked / Standard FTE hours

Includes:
• Travel nurses
• Agency staff
• Temporary contractors
Excludes: Regular staff, PRN staff`,
      },
      {
        id: 'overtime-ftes',
        title: "Overtime FTEs",
        value: fmt(prAgg?.overtime_fte ?? null),
        chartData: dowOvertimeChart.length > 0 ? dowOvertimeChart : [],
        chartType: "area" as const,
        xAxisLabels: dailyTrendLabels,
        delay: 0.1,
        definition: "Total worked hours above regular (FT) commitment the organization actually pays for.",
        calculation: `Total Overtime FTEs = Total overtime hours / Standard FTE hours

Example: If 436 overtime hours worked in 2 weeks:
436 / (40 × 2) = 5.45 overtime FTE equivalent
Note: This is the volume equivalent, not cost equivalent`,
      },
      {
        id: 'total-prn',
        title: "Total PRN",
        value: fmt(prAgg?.total_prn ?? null),
        chartData: dowPrnChart.length > 0 ? dowPrnChart : [],
        chartType: "area" as const,
        xAxisLabels: dailyTrendLabels,
        delay: 0.15,
        definition: "Total PRNs productive equivalent labor resources the organization actually pays for.",
        calculation: `Total PRN = PRN hours worked / Standard FTE hours

PRN staff characteristics:
• No guaranteed hours
• Work as needed/on-call
• Typically higher hourly rate
• Used for volume fluctuations and coverage`,
      },
      {
        id: 'total-np',
        title: "Total NP%",
        value: fmtPct(prNpPercent ?? null),
        chartData: dowNpChart.length > 0 ? dowNpChart : [],
        chartType: "area" as const,
        xAxisLabels: dailyTrendLabels,
        delay: 0.2,
        definition: "The percentage of all paid hours that were not spent directly delivering patient care or performing operational work tied to Patient Volume (e.g., PTO, Holiday Pay, sick leave, education, admin or committee time, Training or onboarding).",
        calculation: `Total NP% = Total non-productive Man hours/ Total Paid hours *100

Example: If 776 Non productive hours and 7,928 total paid hours:
(776 / 7,928) × 100 = 9.7%

Lower NP% indicates better labor efficiency`,
      },
      {
        id: 'total-fullpart-ftes',
        title: "EMPLOYED PRODUCTIVE FTES",
        value: fmt(prAgg?.employed_productive_fte ?? null),
        chartData: dowEmployedChart.length > 0 ? dowEmployedChart : [],
        chartType: "area" as const,
        xAxisLabels: dailyTrendLabels,
        delay: 0.25,
        definition: "Total Full-time, Part-Time and PRNs productive equivalent labor resources the organization actually pays for.",
        calculation: `Employed Productive FTEs = Sum of all employed productive FTEs

This metric helps:
• Understand workforce composition
• Plan for benefits and scheduling
• Analyze labor cost structure`,
      },
    ];

    return kpis.sort((a, b) => {
      const aIndex = productivityOrder.indexOf(a.id);
      const bIndex = productivityOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [productivityOrder, prAgg, prNpPercent, dailyTrendData, dailyTrendLabels]);

  // Page-level loading guard
  const isInitializing = rbacLoading || (orgScopedLoading && !filtersInitialized);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height)-2rem)]">
        <LogoLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      <StaffingTour key={activeTab} activeTab={activeTab} onTabChange={setActiveTab} />
      <WorkforceDrawerTrigger />
      <WorkforceDrawer 
        activeTab={activeTab} 
        selectedDepartment={selectedDepartment === "all-departments" ? null : selectedDepartment}
        selectedRegion={selectedRegion === "all-regions" ? null : selectedRegion}
        selectedMarket={selectedMarket === "all-markets" ? null : selectedMarket}
        selectedFacility={selectedFacility === "all-facilities" ? null : selectedFacility}
        selectedLevel2={selectedLevel2 === "all-level2" ? null : selectedLevel2}
        selectedPstat={selectedPstat === "all-pstat" ? null : selectedPstat}
      />
      
      <div className="flex flex-col gap-4 h-full overflow-hidden">
        {/* Filters */}
        <div data-tour="filter-bar">
        <FilterBar 
          onRegionChange={setRegion}
          onMarketChange={setMarket}
          onFacilityChange={setFacility}
          onSubmarketChange={setSubmarket}
          onPstatChange={setPstat}
          onLevel2Change={setLevel2}
          onDepartmentChange={setDepartment}
          selectedRegion={selectedRegion}
          selectedMarket={selectedMarket}
          selectedFacility={selectedFacility}
          selectedSubmarket={selectedSubmarket}
          selectedPstat={selectedPstat}
          selectedLevel2={selectedLevel2}
          selectedDepartment={selectedDepartment}
          onClearFilters={() => clearFilters(defaultFilters)}
        />
      </div>

      <div className="flex justify-center" data-tour="tab-navigation">
        <ToggleButtonGroup
          items={tabs}
          activeId={activeTab}
          onSelect={setActiveTab}
          layoutId="staffingToggle"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "summary" && (
            <div className="space-y-6">
              <DraggableSectionsContainer
                sections={[
                  {
                    id: 'fte',
                    title: 'FTE',
                    kpis: fteKPIs.filter(k => isKpiVisible(k.id, roles)),
                  },
                  {
                    id: 'volume',
                    title: 'Volume',
                    kpis: volumeKPIs.filter(k => isKpiVisible(k.id, roles)),
                    volumeBreakdown,
                  },
                  ...(productivityKPIs.some(k => isKpiVisible(k.id, roles))
                    ? [{
                        id: 'productivity',
                        title: 'Productive Resources',
                        kpis: productivityKPIs.filter(k => isKpiVisible(k.id, roles)),
                      }]
                    : []),
                ]}
                sectionOrder={sectionOrder}
                onSectionReorder={setSectionOrder}
              />
            </div>
          )}
          
          {activeTab === "planning" && (
            <PositionPlanning
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
              selectedSubmarket={selectedSubmarket}
              selectedLevel2={selectedLevel2}
              selectedPstat={selectedPstat}
            />
          )}
          
          {activeTab === "variance" && (
            <VarianceAnalysis 
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
              selectedSubmarket={selectedSubmarket}
              selectedLevel2={selectedLevel2}
              selectedPstat={selectedPstat}
            />
          )}
          
          {activeTab === "forecasts" && (
            <ForecastTab 
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
              selectedLevel2={selectedLevel2}
              selectedPstat={selectedPstat}
            />
          )}
          
          {activeTab === "volume-settings" && (
            <SettingsTab 
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
            />
          )}
          
        {activeTab === "np-settings" && (
          <NPSettingsTab 
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
          />
        )}
      </div>
      </div>
    </>
  );
}
