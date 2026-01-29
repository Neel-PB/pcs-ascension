import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserAccessScope } from "@/hooks/useUserOrgAccess";

// Valid FTE values per employment type
const FT_VALUES = [1.0, 0.9, 0.8, 0.75];
const PT_VALUES = [0.6, 0.5, 0.3];
const PRN_VALUE = 0.2;

// Target split percentages
const TARGET_FT_PERCENT = 0.70;
const TARGET_PT_PERCENT = 0.20;
const TARGET_PRN_PERCENT = 0.10;

// Valid skill types for 70/20/10 analysis (from Position Planning)
const CLINICAL_STAFF = ['Clinical Lead', 'Registered Nurse'];
const SUPPORT_STAFF = ['Patient Care Technician', 'CLERK'];
const VALID_SKILL_TYPES = [...CLINICAL_STAFF, ...SUPPORT_STAFF];

// Overhead types - EXCLUDED from 70/20/10 analysis (fixed FT-only roles)
const OVERHEAD_SKILL_TYPES = ['Director', 'Manager', 'Assistant Manager', 'Coordinator', 'SPEC'];

export interface FTEBreakdown {
  ft: number;
  pt: number;
  prn: number;
  total: number;
  ftPercent: number;
  ptPercent: number;
  prnPercent: number;
}

export interface OpenReqsBreakdown {
  ft: number;
  pt: number;
  prn: number;
  total: number;
}

export interface PositionChange {
  fteValue: number;
  count: number;
  action: 'open' | 'close';
}

export interface ClosureRecommendation {
  fromReqs: PositionChange[];
  fromEmployed: PositionChange[];
  totalFromReqs: number;
  totalFromEmployed: number;
}

export interface RecommendedChanges {
  ft: PositionChange[];
  pt: PositionChange[];
  prn: PositionChange[];
  totalFTChange: number;
  totalPTChange: number;
  totalPRNChange: number;
  // New: Split closure recommendations
  ftClosure: ClosureRecommendation;
  ptClosure: ClosureRecommendation;
  prnClosure: ClosureRecommendation;
}

export interface ForecastBalanceRow {
  id: string;
  region: string;
  market: string;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  skillType: string;
  shift: 'Day' | 'Night';
  hiredFTE: FTEBreakdown;
  openReqsFTE: OpenReqsBreakdown;
  targetFTE: number;
  fteGap: number;
  gapType: 'shortage' | 'surplus' | 'balanced' | 'split-imbalanced';
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

// Normalize skill type from jobTitle to standardized names
function normalizeSkillType(jobTitle: string | null): string | null {
  if (!jobTitle) return null;
  const normalized = jobTitle.toLowerCase().trim();
  
  // OVERHEAD - Check these FIRST (Supervisors, Managers, Directors, Coordinators, Specialists)
  if (normalized.includes(' spv') || normalized.includes('spv-')) return 'Supervisor';
  if (normalized.includes(' mgr') || normalized.includes('mgr-')) return 'Manager';
  if (normalized.includes(' dir') || normalized.includes('dir-')) return 'Director';
  if (normalized.includes('coord-') || normalized.includes('coordinator')) return 'Coordinator';
  if (normalized.includes('specialist')) return 'SPEC';
  if (normalized.includes('physician') || normalized.includes('practitioner')) return 'SPEC';
  if (normalized.includes('pharmacist')) return 'SPEC';
  
  // CLINICAL LEAD - Must check before general RN
  if (normalized.includes('clinical lead')) return 'Clinical Lead';
  
  // REGISTERED NURSE - Starts with "rn-" or "rn " or contains nurse/lpn/lvn
  if (normalized.startsWith('rn-') || normalized.startsWith('rn ')) return 'Registered Nurse';
  if (normalized.includes('lpn') || normalized.includes('lvn')) return 'Registered Nurse';
  if (normalized.includes('nurse') && !normalized.includes('practitioner')) return 'Registered Nurse';
  
  // PATIENT CARE TECHNICIAN - Contains PCT or Patient Care
  if (normalized.includes('pct') || normalized.includes('patient care')) return 'Patient Care Technician';
  if (normalized.includes('patient attendant')) return 'Patient Care Technician';
  
  // CLERK - Contains Clerk, Secretary, Unit Assistant
  if (normalized.includes('clerk')) return 'CLERK';
  if (normalized.includes('secretary')) return 'CLERK';
  if (normalized === 'asst-unit') return 'CLERK';
  
  return null; // Skip unknown types
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

// Calculate closure recommendation with open reqs priority
function calculateClosureWithPriority(
  closureNeeded: number,
  openReqsAvailable: number,
  validValues: number[]
): ClosureRecommendation {
  if (closureNeeded <= 0) {
    return {
      fromReqs: [],
      fromEmployed: [],
      totalFromReqs: 0,
      totalFromEmployed: 0,
    };
  }

  // First, allocate from open requisitions
  const fromReqsAmount = Math.min(closureNeeded, openReqsAvailable);
  const remainingAfterReqs = closureNeeded - fromReqsAmount;

  const fromReqs = fromReqsAmount > 0.05 
    ? mapToValidPositions(fromReqsAmount, validValues, 'close')
    : [];

  // Then, if still needed, allocate from employed positions
  const fromEmployed = remainingAfterReqs > 0.05
    ? mapToValidPositions(remainingAfterReqs, validValues, 'close')
    : [];

  return {
    fromReqs,
    fromEmployed,
    totalFromReqs: fromReqs.reduce((sum, c) => sum + c.fteValue * c.count, 0),
    totalFromEmployed: fromEmployed.reduce((sum, c) => sum + c.fteValue * c.count, 0),
  };
}

// Calculate recommended changes to reach 70/20/10 split
function calculateBalancedRecommendation(
  currentFT: number,
  currentPT: number,
  currentPRN: number,
  targetFTE: number,
  openReqsFT: number,
  openReqsPT: number,
  openReqsPRN: number
): RecommendedChanges {
  // Target splits for the END state
  const targetFT = targetFTE * TARGET_FT_PERCENT;
  const targetPT = targetFTE * TARGET_PT_PERCENT;
  const targetPRN = targetFTE * TARGET_PRN_PERCENT;
  
  // Changes needed
  const ftChange = targetFT - currentFT;
  const ptChange = targetPT - currentPT;
  const prnChange = targetPRN - currentPRN;
  
  // Calculate closure recommendations with open reqs priority
  const ftClosure = calculateClosureWithPriority(
    ftChange < 0 ? Math.abs(ftChange) : 0,
    openReqsFT,
    FT_VALUES
  );
  const ptClosure = calculateClosureWithPriority(
    ptChange < 0 ? Math.abs(ptChange) : 0,
    openReqsPT,
    PT_VALUES
  );
  const prnClosure = calculateClosureWithPriority(
    prnChange < 0 ? Math.abs(prnChange) : 0,
    openReqsPRN,
    [PRN_VALUE]
  );

  // For openings, use standard mapping
  const ftOpenings = ftChange > 0 ? mapToValidPositions(ftChange, FT_VALUES, 'open') : [];
  const ptOpenings = ptChange > 0 ? mapToValidPositions(ptChange, PT_VALUES, 'open') : [];
  const prnOpenings = prnChange > 0 ? mapToValidPositions(prnChange, [PRN_VALUE], 'open') : [];

  // Combine all closures for backward compatibility
  const ftClosures = [...ftClosure.fromReqs, ...ftClosure.fromEmployed];
  const ptClosures = [...ptClosure.fromReqs, ...ptClosure.fromEmployed];
  const prnClosures = [...prnClosure.fromReqs, ...prnClosure.fromEmployed];

  return {
    ft: ftChange >= 0 ? ftOpenings : ftClosures,
    pt: ptChange >= 0 ? ptOpenings : ptClosures,
    prn: prnChange >= 0 ? prnOpenings : prnClosures,
    totalFTChange: ftChange,
    totalPTChange: ptChange,
    totalPRNChange: prnChange,
    ftClosure,
    ptClosure,
    prnClosure,
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
  
  // Check if there are any closures
  const totalReqClosures = recommendation.ftClosure.totalFromReqs + 
    recommendation.ptClosure.totalFromReqs + 
    recommendation.prnClosure.totalFromReqs;
  const totalEmployedClosures = recommendation.ftClosure.totalFromEmployed + 
    recommendation.ptClosure.totalFromEmployed + 
    recommendation.prnClosure.totalFromEmployed;

  const actions: string[] = [];
  
  // Opening actions
  if (recommendation.totalFTChange > 0.05) {
    actions.push(`opening ${recommendation.totalFTChange.toFixed(1)} FTE in Full-Time positions`);
  }
  if (recommendation.totalPTChange > 0.05) {
    actions.push(`opening ${recommendation.totalPTChange.toFixed(1)} FTE in Part-Time positions`);
  }
  if (recommendation.totalPRNChange > 0.05) {
    actions.push(`opening ${recommendation.totalPRNChange.toFixed(1)} FTE in PRN positions`);
  }

  // Closure actions with priority explanation
  if (totalReqClosures > 0.05) {
    actions.push(`canceling ${totalReqClosures.toFixed(1)} FTE in open requisitions`);
  }
  if (totalEmployedClosures > 0.05) {
    actions.push(`additionally closing ${totalEmployedClosures.toFixed(1)} FTE from employed positions`);
  }
  
  if (actions.length === 0) {
    return `Your ${skillType} ${shift} shift is currently at optimal staffing levels with a balanced 70/20/10 employment mix.`;
  }
  
  const actionText = actions.join(', ');
  
  let priorityNote = '';
  if (totalReqClosures > 0.05 && totalEmployedClosures > 0.05) {
    priorityNote = ' We recommend first canceling open requisitions before considering any employed position changes.';
  } else if (totalReqClosures > 0.05) {
    priorityNote = ' This can be achieved entirely by canceling open requisitions without affecting employed staff.';
  }
  
  return `Based on your current mix of ${currentSplit}, we recommend ${actionText}.${priorityNote} This will ${isShortage ? 'fill' : 'reduce'} the ${gapAmount} FTE ${isShortage ? 'shortage' : 'surplus'} while achieving the optimal 70/20/10 split for your ${skillType} ${shift} shift workforce.`;
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

export interface ForecastBalanceFilters {
  departmentId?: string | null;
  region?: string | null;
  market?: string | null;
  facilityId?: string | null;
  level2?: string | null;
  pstat?: string | null;
}

export function useForecastBalance(filters?: ForecastBalanceFilters) {
  const { departmentId, region, market, facilityId, level2, pstat } = filters || {};
  
  // Get current user and their access scope
  const { user } = useAuth();
  const { accessScope, hasUnrestrictedAccess } = useUserAccessScope(user?.id);
  
  // Extract allowed values from access scope
  const allowedRegions = accessScope?.regions || [];
  const allowedMarkets = accessScope?.markets || [];
  const allowedFacilities = accessScope?.facilities?.map(f => f.facilityId) || [];
  const allowedDepartments = accessScope?.departments?.map(d => d.departmentId) || [];
  
  return useQuery({
    queryKey: ['forecast-balance', user?.id, { departmentId, region, market, facilityId, level2, pstat }],
    queryFn: async (): Promise<ForecastBalanceSummary> => {
      // Fetch facilities for region lookup
      const { data: facilities, error: facError } = await supabase
        .from('facilities')
        .select('facility_id, region');
      if (facError) throw facError;
      
      // Create region lookup map
      const regionLookup = new Map<string, string>();
      for (const fac of facilities || []) {
        regionLookup.set(fac.facility_id, fac.region || 'Unknown');
      }
      
      // Build query for filled positions (employees)
      let employedQuery = supabase
        .from('positions')
        .select('*')
        .not('employeeName', 'is', null);
      
      // Apply UI filters first, then fall back to access scope restrictions
      // PRIORITY: Facility > Market > Region (more specific takes precedence)
      
      // Facility filter - most specific, takes full precedence
      if (facilityId) {
        employedQuery = employedQuery.eq('facilityId', facilityId);
      } else if (!hasUnrestrictedAccess && allowedFacilities.length > 0) {
        // User has facility restrictions - apply them
        employedQuery = employedQuery.in('facilityId', allowedFacilities);
      } else {
        // No facility filter - check market filter
        if (market) {
          employedQuery = employedQuery.ilike('market', market);
        } else if (!hasUnrestrictedAccess && allowedMarkets.length > 0) {
          // Use case-insensitive OR filter for markets
          const marketFilter = allowedMarkets.map(m => `market.ilike.${m}`).join(',');
          employedQuery = employedQuery.or(marketFilter);
        }
      }
      
      // Department filter - could be ID (numeric) or name (string)
      if (departmentId) {
        if (/^\d+$/.test(departmentId)) {
          employedQuery = employedQuery.eq('departmentId', departmentId);
        } else {
          employedQuery = employedQuery.ilike('departmentName', departmentId);
        }
      } else if (!hasUnrestrictedAccess && allowedDepartments.length > 0) {
        employedQuery = employedQuery.in('departmentId', allowedDepartments);
      }
      
      const { data: employedPositions, error: empError } = await employedQuery;
      if (empError) throw empError;

      // Build query for open requisitions (unfilled positions)
      let openReqsQuery = supabase
        .from('positions')
        .select('*')
        .is('employeeName', null);
      
      // Apply same filters to open reqs query (same priority: Facility > Market > Region)
      
      // Facility filter - most specific, takes full precedence
      if (facilityId) {
        openReqsQuery = openReqsQuery.eq('facilityId', facilityId);
      } else if (!hasUnrestrictedAccess && allowedFacilities.length > 0) {
        openReqsQuery = openReqsQuery.in('facilityId', allowedFacilities);
      } else {
        // No facility filter - check market filter
        if (market) {
          openReqsQuery = openReqsQuery.ilike('market', market);
        } else if (!hasUnrestrictedAccess && allowedMarkets.length > 0) {
          // Use case-insensitive OR filter for markets
          const marketFilter = allowedMarkets.map(m => `market.ilike.${m}`).join(',');
          openReqsQuery = openReqsQuery.or(marketFilter);
        }
      }
      
      // Department filter - could be ID (numeric) or name (string)
      if (departmentId) {
        if (/^\d+$/.test(departmentId)) {
          openReqsQuery = openReqsQuery.eq('departmentId', departmentId);
        } else {
          openReqsQuery = openReqsQuery.ilike('departmentName', departmentId);
        }
      } else if (!hasUnrestrictedAccess && allowedDepartments.length > 0) {
        openReqsQuery = openReqsQuery.in('departmentId', allowedDepartments);
      }
      
      const { data: openReqs, error: reqError } = await openReqsQuery;
      if (reqError) throw reqError;
      
      // Group employed positions by market/facility/department/skillType/shift
      const groupedData = new Map<string, {
        region: string;
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
        // Open requisitions FTE available for closure
        openReqsFT: number;
        openReqsPT: number;
        openReqsPRN: number;
      }>();
      
      // Process employed positions
      for (const pos of employedPositions || []) {
        // Filter by region if specified OR if user has region restrictions
        const posRegion = regionLookup.get(pos.facilityId);
        if (region) {
          if (posRegion !== region) continue;
        } else if (!hasUnrestrictedAccess && allowedRegions.length > 0) {
          if (!posRegion || !allowedRegions.includes(posRegion)) continue;
        }
        
        const shift = normalizeShift(pos.shift_override || pos.shift);
        if (!shift) continue;
        
        const skillType = normalizeSkillType(pos.jobTitle);
        if (!skillType) continue;
        if (OVERHEAD_SKILL_TYPES.includes(skillType)) continue;
        
        const empType = categorizeEmploymentType(pos.employmentType, pos.employmentFlag);
        if (!empType) continue;
        
        const key = `${pos.market}|${pos.facilityId}|${pos.departmentId}|${skillType}|${shift}`;
        
        if (!groupedData.has(key)) {
          groupedData.set(key, {
            region: regionLookup.get(pos.facilityId) || 'Unknown',
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
            openReqsFT: 0,
            openReqsPT: 0,
            openReqsPRN: 0,
          });
        }
        
        const group = groupedData.get(key)!;
        
        if (empType === 'PRN') {
          group.prnFTE += PRN_VALUE;
        } else {
          const fte = pos.FTE || 0;
          if (empType === 'FT') group.ftFTE += fte;
          else if (empType === 'PT') group.ptFTE += fte;
        }
      }

      // Process open requisitions
      for (const req of openReqs || []) {
        // Filter by region if specified OR if user has region restrictions
        const reqRegion = regionLookup.get(req.facilityId);
        if (region) {
          if (reqRegion !== region) continue;
        } else if (!hasUnrestrictedAccess && allowedRegions.length > 0) {
          if (!reqRegion || !allowedRegions.includes(reqRegion)) continue;
        }
        
        const shift = normalizeShift(req.shift_override || req.shift);
        if (!shift) continue;
        
        const skillType = normalizeSkillType(req.jobTitle);
        if (!skillType) continue;
        if (OVERHEAD_SKILL_TYPES.includes(skillType)) continue;
        
        const empType = categorizeEmploymentType(req.employmentType, req.employmentFlag);
        if (!empType) continue;
        
        const key = `${req.market}|${req.facilityId}|${req.departmentId}|${skillType}|${shift}`;
        
        // Only add to existing groups (we need employed positions to have a baseline)
        if (groupedData.has(key)) {
          const group = groupedData.get(key)!;
          
          if (empType === 'PRN') {
            group.openReqsPRN += PRN_VALUE;
          } else {
            const fte = req.FTE || 0;
            if (empType === 'FT') group.openReqsFT += fte;
            else if (empType === 'PT') group.openReqsPT += fte;
          }
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
        if (total < 0.5) continue;
        
        const hiredFTE: FTEBreakdown = {
          ft: group.ftFTE,
          pt: group.ptFTE,
          prn: group.prnFTE,
          total,
          ftPercent: total > 0 ? (group.ftFTE / total) * 100 : 0,
          ptPercent: total > 0 ? (group.ptFTE / total) * 100 : 0,
          prnPercent: total > 0 ? (group.prnFTE / total) * 100 : 0,
        };

        const openReqsFTE: OpenReqsBreakdown = {
          ft: group.openReqsFT,
          pt: group.openReqsPT,
          prn: group.openReqsPRN,
          total: group.openReqsFT + group.openReqsPT + group.openReqsPRN,
        };
        
        // Demo: Create realistic variety using deterministic hash
        const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variation = (hash % 9) - 4;
        
        let targetFTE: number;
        if (variation >= 2) {
          targetFTE = Math.ceil(total * (1.10 + (variation - 2) * 0.05) * 10) / 10;
        } else if (variation <= -2) {
          targetFTE = Math.ceil(total * (0.85 + (Math.abs(variation) - 2) * 0.05) * 10) / 10;
        } else {
          targetFTE = Math.ceil(total * 10) / 10;
        }
        
        const fteGap = targetFTE - total;
        
        const ftDiff = Math.abs(hiredFTE.ftPercent - 70);
        const ptDiff = Math.abs(hiredFTE.ptPercent - 20);
        const prnDiff = Math.abs(hiredFTE.prnPercent - 10);
        const currentSplitStatus: 'balanced' | 'imbalanced' = 
          (ftDiff <= 5 && ptDiff <= 5 && prnDiff <= 5) ? 'balanced' : 'imbalanced';
        
        let gapType: 'shortage' | 'surplus' | 'balanced' | 'split-imbalanced';
        if (fteGap > 0.1) {
          gapType = 'shortage';
        } else if (fteGap < -0.1) {
          gapType = 'surplus';
        } else if (currentSplitStatus === 'imbalanced') {
          gapType = 'split-imbalanced';
        } else {
          gapType = 'balanced';
        }
        
        const recommendation = calculateBalancedRecommendation(
          group.ftFTE,
          group.ptFTE,
          group.prnFTE,
          targetFTE,
          group.openReqsFT,
          group.openReqsPT,
          group.openReqsPRN
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
          region: group.region,
          market: group.market,
          facilityId: group.facilityId,
          facilityName: group.facilityName,
          departmentId: group.departmentId,
          departmentName: group.departmentName,
          skillType: group.skillType,
          shift: group.shift,
          hiredFTE,
          openReqsFTE,
          targetFTE,
          fteGap,
          gapType,
          currentSplitStatus,
          recommendation,
          aiSummary,
        });
      }
      
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
