import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, format, parseISO, getDaysInMonth } from 'date-fns';
import { 
  calculateMaxOverrideExpiry, 
  determineOverrideCategory, 
  isOverrideMandatory,
  type VolumeOverrideConfig,
  type OverrideCategory
} from '@/lib/volumeOverrideRules';

export interface HistoricalMonthData {
  month: string;
  volume: number;
  daysInMonth: number;
}

export interface DepartmentVolumeAnalysis {
  department_id: string;
  department_name: string;
  facility_id: string;
  facility_name: string;
  market: string;
  historical_months_count: number;
  historical_months_data: HistoricalMonthData[];
  target_volume: number | null;
  override_mandatory: boolean;
  override_optional: boolean;
  max_allowed_expiry_date: Date;
  category: OverrideCategory;
}

export function useVolumeOverrideConfig() {
  return useQuery({
    queryKey: ['volume-override-config', 'global'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volume_override_config')
        .select('*')
        .eq('is_global', true)
        .maybeSingle();

      if (error) throw error;
      return data as VolumeOverrideConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useHistoricalVolumeAnalysis() {
  const { data: config } = useVolumeOverrideConfig();

  return useQuery({
    queryKey: ['historical-volume-analysis', config],
    queryFn: async () => {
      if (!config) return [];

      const currentDate = new Date();
      const twelveMonthsAgo = subMonths(currentDate, 12);
      const twentyFourMonthsAgo = subMonths(currentDate, config.backfill_lookback_months);

      // Fetch last 24 months of labor performance data
      const { data: laborData, error } = await supabase
        .from('labor_performance')
        .select('*')
        .gte('month', format(twentyFourMonthsAgo, 'yyyy-MM-dd'))
        .order('month', { ascending: false });

      if (error) throw error;

      // Get unique departments
      const departmentMap = new Map<string, any>();
      
      laborData?.forEach((record) => {
        const key = `${record.facilityId}-${record.departmentId}`;
        if (!departmentMap.has(key)) {
          departmentMap.set(key, {
            department_id: record.departmentId,
            department_name: record.departmentName,
            facility_id: record.facilityId,
            facility_name: record.facilityName,
            market: record.market,
            records: [],
          });
        }
        departmentMap.get(key)?.records.push(record);
      });

      // Analyze each department
      const analyses: DepartmentVolumeAnalysis[] = [];

      for (const [, dept] of departmentMap) {
        const analysis = await analyzeDepartmentHistory(dept, config, currentDate, twelveMonthsAgo);
        analyses.push(analysis);
      }

      return analyses;
    },
    enabled: !!config,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

async function analyzeDepartmentHistory(
  dept: any,
  config: VolumeOverrideConfig,
  currentDate: Date,
  twelveMonthsAgo: Date
): Promise<DepartmentVolumeAnalysis> {
  // Step 1: Get last 12 months of data
  let validMonths = dept.records
    .filter((record: any) => {
      const recordDate = parseISO(record.month);
      return recordDate >= twelveMonthsAgo && 
             record.volume !== null && 
             record.volume > config.min_volume_threshold;
    })
    .map((record: any) => {
      const recordDate = parseISO(record.month);
      return {
        month: format(recordDate, 'yyyy-MM'),
        volume: record.volume,
        daysInMonth: getDaysInMonth(recordDate),
      };
    });

  // Step 2: If less than 12 months, perform backfill
  if (validMonths.length < 12 && config.enable_backfill) {
    const backfillMonths = dept.records
      .filter((record: any) => {
        const recordDate = parseISO(record.month);
        return recordDate < twelveMonthsAgo && 
               record.volume !== null && 
               record.volume > config.min_volume_threshold;
      })
      .map((record: any) => {
        const recordDate = parseISO(record.month);
        return {
          month: format(recordDate, 'yyyy-MM'),
          volume: record.volume,
          daysInMonth: getDaysInMonth(recordDate),
        };
      });

    validMonths = [...validMonths, ...backfillMonths]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);
  }

  // Step 3: Calculate target volume (average daily volume)
  // Sum total volume and total days across all valid months
  const totalVolume = validMonths.reduce((sum, m) => sum + m.volume, 0);
  const totalDays = validMonths.reduce((sum, m) => sum + m.daysInMonth, 0);
  
  const targetVolume = validMonths.length >= config.min_months_for_target && totalDays > 0
    ? totalVolume / totalDays
    : null;

  // Step 4: Determine override requirements
  const overrideMandatory = isOverrideMandatory(validMonths.length, config);
  const maxAllowedExpiry = calculateMaxOverrideExpiry(validMonths.length, config, currentDate);
  const category = determineOverrideCategory(validMonths.length, config);

  return {
    department_id: dept.department_id,
    department_name: dept.department_name,
    facility_id: dept.facility_id,
    facility_name: dept.facility_name,
    market: dept.market,
    historical_months_count: validMonths.length,
    historical_months_data: validMonths,
    target_volume: targetVolume,
    override_mandatory: overrideMandatory,
    override_optional: !overrideMandatory,
    max_allowed_expiry_date: maxAllowedExpiry,
    category,
  };
}
