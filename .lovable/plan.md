

## Fix 3M High Chart Type from Bar to Area

### Problem
The 3M High KPI chart is configured with `chartType: "bar"` instead of `"area"`. This is inconsistent with the 3M Low chart (which uses area) and prevents the highlight dots from rendering properly on an area trend.

### Change

**`src/pages/staffing/StaffingSummary.tsx`** — Line 747

Change `chartType` from `"bar"` to `"area"`:

```typescript
// Before
chartType: "bar" as const,

// After
chartType: "area" as const,
```

Also update the fallback in **`src/config/kpiConfigs.ts`** (~line 207) for the 3M High default config — same change from `"bar"` to `"area"`.

### Files Changed
- `src/pages/staffing/StaffingSummary.tsx`
- `src/config/kpiConfigs.ts`

