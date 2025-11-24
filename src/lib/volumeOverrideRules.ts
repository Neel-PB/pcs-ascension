import { addMonths } from "date-fns";

export interface VolumeOverrideConfig {
  min_months_for_target: number;
  min_months_mandatory_override: number;
  max_override_months_full_history: number;
  fiscal_year_end_month: number;
  fiscal_year_end_day: number;
  enable_backfill: boolean;
  backfill_lookback_months: number;
  min_volume_threshold: number;
}

export type OverrideCategory = '0-months' | '1-2-months' | '3-11-months' | '12-months';

export function calculateMaxOverrideExpiry(
  historicalMonths: number,
  config: VolumeOverrideConfig,
  currentDate: Date = new Date()
): Date {
  // Rule 1: 0-2 months history → up to 12 months
  if (historicalMonths <= config.min_months_mandatory_override) {
    return addMonths(currentDate, config.max_override_months_full_history);
  }
  
  // Rule 2: 3-11 months history → up to (12 - months of history)
  if (historicalMonths < 12) {
    const allowedMonths = 12 - historicalMonths;
    return addMonths(currentDate, allowedMonths);
  }
  
  // Rule 3: 12+ months history → until next June 30 (or configured fiscal year end)
  const currentYear = currentDate.getFullYear();
  const fiscalYearEnd = new Date(
    currentYear,
    config.fiscal_year_end_month - 1,
    config.fiscal_year_end_day
  );
  
  // If current date is past this fiscal year end, use next year
  if (currentDate > fiscalYearEnd) {
    return new Date(
      currentYear + 1,
      config.fiscal_year_end_month - 1,
      config.fiscal_year_end_day
    );
  }
  
  return fiscalYearEnd;
}

export function determineOverrideCategory(
  historicalMonths: number,
  config: VolumeOverrideConfig
): OverrideCategory {
  if (historicalMonths === 0) return '0-months';
  if (historicalMonths <= config.min_months_mandatory_override) return '1-2-months';
  if (historicalMonths < 12) return '3-11-months';
  return '12-months';
}

export function isOverrideMandatory(
  historicalMonths: number,
  config: VolumeOverrideConfig
): boolean {
  return historicalMonths < config.min_months_for_target;
}

export function getCategoryColor(category: OverrideCategory): string {
  switch (category) {
    case '0-months':
    case '1-2-months':
      return 'bg-red-600 text-white';
    case '3-11-months':
      return 'bg-yellow-500 text-black';
    case '12-months':
      return 'bg-green-600 text-white';
  }
}

export function getCategoryLabel(historicalMonths: number): string {
  if (historicalMonths === 0) return '0 months';
  if (historicalMonths === 1) return '1 month';
  return `${historicalMonths} months`;
}

export function getCategoryTooltip(historicalMonths: number, config: VolumeOverrideConfig): string {
  if (historicalMonths < config.min_months_for_target) {
    return "Insufficient history - override mandatory";
  }
  if (historicalMonths < 12) {
    return `Partial history (${historicalMonths} months) - override optional`;
  }
  return "Full 12-month history - override optional";
}
