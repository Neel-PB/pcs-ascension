import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, subMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateLast12MonthLabels(): string[] {
  const labels: string[] = [];
  const today = new Date();
  
  // Generate labels from 11 months ago to current month
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(today, i);
    labels.push(format(date, "MMM''yy")); // Format: Jan'25, Feb'25, etc.
  }
  
  return labels;
}
