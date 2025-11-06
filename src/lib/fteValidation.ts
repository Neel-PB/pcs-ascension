import { FTE_TOLERANCE } from "@/hooks/useForecastPositions";

export function validateFteAllocation(parentFte: number, childrenFteSum: number): {
  isValid: boolean;
  difference: number;
  status: 'complete' | 'under' | 'over' | 'empty';
} {
  if (childrenFteSum === 0) {
    return { isValid: false, difference: parentFte, status: 'empty' };
  }
  
  const difference = childrenFteSum - parentFte;
  const isValid = Math.abs(difference) <= FTE_TOLERANCE;
  
  let status: 'complete' | 'under' | 'over';
  if (isValid) status = 'complete';
  else if (difference < 0) status = 'under';
  else status = 'over';
  
  return { isValid, difference, status };
}
