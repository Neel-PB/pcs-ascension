

## Fix: Ensure FT + PT + PRN always equals exactly 100%

### Problem
`Math.round` can overshoot (101%), `Math.floor` can undershoot (99%). Neither guarantees an exact 100% total.

### Solution — Largest Remainder Method
A standard algorithm used in proportional representation:

1. Compute raw percentages (e.g. 88.7, 5.8, 5.5)
2. Floor each → 88, 5, 5 = 98
3. Remainder = 100 − 98 = 2
4. Sort by largest fractional part (0.8, 0.7, 0.5)
5. Add +1 to the top 2 → 89, 6, 5 = 100 ✓

### File: `src/hooks/useEmploymentSplit.ts`
Replace the three `Math.floor` lines with a largest-remainder helper:

```typescript
function toPercents(values: number[], total: number): number[] {
  if (total === 0) return values.map(() => 0);
  const raw = values.map(v => (v / total) * 100);
  const floored = raw.map(Math.floor);
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const fractions = raw.map((v, i) => ({ i, frac: v - floored[i] }));
  fractions.sort((a, b) => b.frac - a.frac);
  for (const { i } of fractions) {
    if (remainder <= 0) break;
    floored[i]++;
    remainder--;
  }
  return floored;
}

// Usage:
const [ft, pt, prn] = toPercents([ftSum, ptSum, prnSum], total);
return { ft, pt, prn };
```

Single file, ~15 lines added. Always sums to exactly 100%.

