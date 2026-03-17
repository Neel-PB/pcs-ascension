

## Fix: Rounding causes percentages to exceed 100%

### Problem
`Math.round` on each percentage independently can produce totals like 89+6+6=101%. 

### Fix — `src/hooks/useEmploymentSplit.ts`
Use `Math.floor` instead of `Math.round` to truncate to the first digit. This guarantees the sum never exceeds 100% (it may sum to 99% in edge cases, which is standard practice for floor-based rounding).

Replace lines 108-112:
```typescript
return {
  ft: Math.floor((ftSum / total) * 100),
  pt: Math.floor((ptSum / total) * 100),
  prn: Math.floor((prnSum / total) * 100),
};
```

One line change per value. Single file.

