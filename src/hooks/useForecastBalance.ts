import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Valid FTE values per employment type
const FT_VALUES = [1.0, 0.9, 0.8, 0.75];
const PT_VALUES = [0.6, 0.5, 0.3];
const PRN_VALUE = 0.2;

// Target split percentages
const TARGET_FT_PERCENT = 0.70;
const TARGET_PT_PERCENT = 0.20;
const TARGET_PRN_PERCENT = 0.10;

export interface FTEBreakdown {
  ft: number;
  pt: number;
  prn: number;
  total: number;
  ftPercent: number;
  ptPercent: number;
  prnPercent: number;
}

export interface PositionChange {
  fteValue: number;
  count: number;
  action: 'open' | 'close';
}

export interface RecommendedChanges {
  ft: PositionChange[];
  pt: PositionChange[];
  prn: PositionChange[];
  totalFTChange: number;
  totalPTChange: number;
  totalPRNChange: number;
}

export interface ForecastBalanceRow {
  id: string;
  market: string;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  skillType: string;
  shift: 'Day' | 'Night';
  hiredFTE: FTEBreakdown;
  targetFTE: number;
  fteGap: number;
  gapType: 'shortage' | 'surplus' | 'balanced';
  currentSplitStatus: 'balanced' | 'imbalanced';
  recommendation: RecommendedChanges;
  aiSummary: string;
}

export interface ForecastBalanceSummary {
  totalShortage: number;
  totalSurplus: number;
  shortageCount: number;
  surplusCount: number;
  rows: ForecastBalanceRow[];
}

// Map FTE change to valid position values
function mapToValidPositions(
  change: number,
  validValues: number[],
  action: 'open' | 'close'
): PositionChange[] {
  const positions: PositionChange[] = [];
  let remaining = Math.abs(change);
  
  // Sort values descending to fill with largest first
  const sortedValues = [...validValues].sort((a, b) => b - a);
  
  for (const fteValue of sortedValues) {
    if (remaining >= fteValue - 0.05) { // Small tolerance for floating point
      const count = Math.floor(remaining / fteValue);
      if (count > 0) {
        positions.push({ fteValue, count, action });
        remaining -= count * fteValue;
      }
    }
  }
  
  // Handle small remaining amounts with smallest value
  if (remaining > 0.1 && sortedValues.length > 0) {
    const smallestValue = sortedValues[sortedValues.length - 1];
    positions.push({ fteValue: smallestValue, count: 1, action });
  }
  
  return positions;
}

// Calculate recommended changes to reach 70/20/10 split
function calculateBalancedRecommendation(
  currentFT: number,
  currentPT: number,
  currentPRN: number,
  targetFTE: number
): RecommendedChanges {
  // Target splits for the END state
  const targetFT = targetFTE * TARGET_FT_PERCENT;
  const targetPT = targetFTE * TARGET_PT_PERCENT;
  const targetPRN = targetFTE * TARGET_PRN_PERCENT;
  
  // Changes needed
  const ftChange = targetFT - currentFT;
  const ptChange = targetPT - currentPT;
  const prnChange = targetPRN - currentPRN;
  
  // Map to valid FTE values
  const ftAction = ftChange >= 0 ? 'open' : 'close';
  const ptAction = ptChange >= 0 ? 'open' : 'close';
  const prnAction = prnChange >= 0 ? 'open' : 'close';
  
  return {
    ft: mapToValidPositions(ftChange, FT_VALUES, ftAction as 'open' | 'close'),
    pt: mapToValidPositions(ptChange, PT_VALUES, ptAction as 'open' | 'close'),
    prn: mapToValidPositions(prnChange, [PRN_VALUE], prnAction as 'open' | 'close'),
    totalFTChange: ftChange,
    totalPTChange: ptChange,
    totalPRNChange: prnChange,
  };
}

// Generate AI summary placeholder text
function generateAISummary(
  skillType: string,
  shift: string,
  hiredFTE: FTEBreakdown,
  targetFTE: number,
  recommendation: RecommendedChanges
): string {
  const gapAmount = Math.abs(targetFTE - hiredFTE.total).toFixed(1);
  const isShortage = targetFTE > hiredFTE.total;
  
  const currentSplit = `${hiredFTE.ftPercent.toFixed(0)}% FT / ${hiredFTE.ptPercent.toFixed(0)}% PT / ${hiredFTE.prnPercent.toFixed(0)}% PRN`;
  
  const ftAction = recommendation.totalFTChange >= 0 ? 'opening' : 'closing';
  const ptAction = recommendation.totalPTChange >= 0 ? 'opening' : 'closing';
  const prnAction = recommendation.totalPRNChange >= 0 ? 'opening' : 'closing';
  
  const actions: string[] = [];
  if (Math.abs(recommendation.totalFTChange) >= 0.1) {
    actions.push(`${ftAction} ${Math.abs(recommendation.totalFTChange).toFixed(1)} FTE in Full-Time positions`);
  }
  if (Math.abs(recommendation.totalPTChange) >= 0.1) {
    actions.push(`${ptAction} ${Math.abs(recommendation.totalPTChange).toFixed(1)} FTE in Part-Time positions`);
  }
  if (Math.abs(recommendation.totalPRNChange) >= 0.1) {
    actions.push(`${prnAction} ${Math.abs(recommendation.totalPRNChange).toFixed(1)} FTE in PRN positions`);
  }
  
  if (actions.length === 0) {
    return `Your ${skillType} ${shift} shift is currently at optimal staffing levels with a balanced 70/20/10 employment mix.`;
  }
  
  const actionText = actions.join(', ');
  
  return `Based on your current mix of ${currentSplit}, we recommend ${actionText}. This will ${isShortage ? 'fill' : 'reduce'} the ${gapAmount} FTE ${isShortage ? 'shortage' : 'surplus'} while achieving the optimal 70/20/10 split for your ${skillType} ${shift} shift workforce.`;
}

// Determine shift from position shift field
function normalizeShift(shift: string | null): 'Day' | 'Night' | null {
  if (!shift) return null;
  const lower = shift.toLowerCase();
  if (lower.includes('day') || lower === 'd') return 'Day';
  if (lower.includes('night') || lower === 'n') return 'Night';
  // For rotating/weekend/evening, we'd need the shift_override, but for demo default to Day
  if (lower.includes('rotat') || lower.includes('evening') || lower.includes('weekend')) return 'Day';
  return null;
}

// Determine employment type category
function categorizeEmploymentType(employmentType: string | null, employmentFlag: string | null): 'FT' | 'PT' | 'PRN' | null {
  const type = (employmentType || '').toLowerCase();
  const flag = (employmentFlag || '').toLowerCase();
  
  if (type.includes('full') || flag.includes('full') || type === 'ft') return 'FT';
  if (type.includes('part') || flag.includes('part') || type === 'pt') return 'PT';
  if (type.includes('prn') || flag.includes('prn') || type.includes('casual') || type.includes('per diem')) return 'PRN';
  
  return null;
}

export function useForecastBalance() {
  return useQuery({
    queryKey: ['forecast-balance'],
    queryFn: async (): Promise<ForecastBalanceSummary> => {
      // Fetch all filled positions (employees)
      const { data: positions, error } = await supabase
        .from('positions')
        .select('*')
        .not('employeeName', 'is', null);
      
      if (error) throw error;
      
      // Group by market/facility/department/skillType/shift
      const groupedData = new Map<string, {
        market: string;
        facilityId: string;
        facilityName: string;
        departmentId: string;
        departmentName: string;
        skillType: string;
        shift: 'Day' | 'Night';
        ftFTE: number;
        ptFTE: number;
        prnFTE: number;
      }>();
      
      for (const pos of positions || []) {
        const shift = normalizeShift(pos.shift_override || pos.shift);
        if (!shift) continue;
        
        const skillType = pos.jobFamily || 'Other';
        const empType = categorizeEmploymentType(pos.employmentType, pos.employmentFlag);
        if (!empType) continue;
        
        const key = `${pos.market}|${pos.facilityId}|${pos.departmentId}|${skillType}|${shift}`;
        
        if (!groupedData.has(key)) {
          groupedData.set(key, {
            market: pos.market,
            facilityId: pos.facilityId,
            facilityName: pos.facilityName,
            departmentId: pos.departmentId,
            departmentName: pos.departmentName,
            skillType,
            shift,
            ftFTE: 0,
            ptFTE: 0,
            prnFTE: 0,
          });
        }
        
        const group = groupedData.get(key)!;
        
        // PRN positions use flat 0.2 FTE regardless of database value (often stored as 0)
        if (empType === 'PRN') {
          group.prnFTE += PRN_VALUE; // 0.2 FTE per PRN
        } else {
          const fte = pos.FTE || 0;
          if (empType === 'FT') group.ftFTE += fte;
          else if (empType === 'PT') group.ptFTE += fte;
        }
      }
      
      // Convert to forecast rows with calculations
      const rows: ForecastBalanceRow[] = [];
      let totalShortage = 0;
      let totalSurplus = 0;
      let shortageCount = 0;
      let surplusCount = 0;
      
      for (const [key, group] of groupedData) {
        const total = group.ftFTE + group.ptFTE + group.prnFTE;
        if (total < 0.5) continue; // Skip very small groups
        
        const hiredFTE: FTEBreakdown = {
          ft: group.ftFTE,
          pt: group.ptFTE,
          prn: group.prnFTE,
          total,
          ftPercent: total > 0 ? (group.ftFTE / total) * 100 : 0,
          ptPercent: total > 0 ? (group.ptFTE / total) * 100 : 0,
          prnPercent: total > 0 ? (group.prnFTE / total) * 100 : 0,
        };
        
        // For demo: Target FTE is 15% higher than current (simulating growth)
        // In production, this would come from staffing standards
        const targetFTE = Math.ceil(total * 1.15 * 10) / 10;
        
        const fteGap = targetFTE - total;
        const gapType: 'shortage' | 'surplus' | 'balanced' = 
          fteGap > 0.1 ? 'shortage' : fteGap < -0.1 ? 'surplus' : 'balanced';
        
        // Check if current split is within tolerance of 70/20/10
        const ftDiff = Math.abs(hiredFTE.ftPercent - 70);
        const ptDiff = Math.abs(hiredFTE.ptPercent - 20);
        const prnDiff = Math.abs(hiredFTE.prnPercent - 10);
        const currentSplitStatus: 'balanced' | 'imbalanced' = 
          (ftDiff <= 5 && ptDiff <= 5 && prnDiff <= 5) ? 'balanced' : 'imbalanced';
        
        const recommendation = calculateBalancedRecommendation(
          group.ftFTE,
          group.ptFTE,
          group.prnFTE,
          targetFTE
        );
        
        const aiSummary = generateAISummary(
          group.skillType,
          group.shift,
          hiredFTE,
          targetFTE,
          recommendation
        );
        
        if (gapType === 'shortage') {
          totalShortage += fteGap;
          shortageCount++;
        } else if (gapType === 'surplus') {
          totalSurplus += Math.abs(fteGap);
          surplusCount++;
        }
        
        rows.push({
          id: key,
          market: group.market,
          facilityId: group.facilityId,
          facilityName: group.facilityName,
          departmentId: group.departmentId,
          departmentName: group.departmentName,
          skillType: group.skillType,
          shift: group.shift,
          hiredFTE,
          targetFTE,
          fteGap,
          gapType,
          currentSplitStatus,
          recommendation,
          aiSummary,
        });
      }
      
      // Sort by absolute gap descending (most urgent first)
      rows.sort((a, b) => Math.abs(b.fteGap) - Math.abs(a.fteGap));
      
      return {
        totalShortage: Math.round(totalShortage * 10) / 10,
        totalSurplus: Math.round(totalSurplus * 10) / 10,
        shortageCount,
        surplusCount,
        rows,
      };
    },
  });
}
