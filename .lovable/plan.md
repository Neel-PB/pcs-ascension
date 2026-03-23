

## Fix: Reduce KPI Card Padding from 16px to 8px

### Change: `src/components/staffing/KPICard.tsx`

**Line 96** — Change `p-4` to `p-2` on CardContent:
```tsx
// Before
<CardContent className="p-4 relative flex flex-col justify-center min-h-[90px]">

// After
<CardContent className="p-2 relative flex flex-col justify-center min-h-[90px]">
```

This reduces padding from 16px to 8px on all sides, making the KPI cards more compact.

