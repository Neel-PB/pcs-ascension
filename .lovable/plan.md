

## Style Target NP % Column to Match Target Volume (Value Only, No Badge)

### Problem
The "Target NP %" column in NP Settings uses plain text styling. It should match the Target Volume column's value styling — right-aligned, same font treatment — but without the colored badge (since there's no historical data to display).

### Changes

**File: `src/config/npOverrideColumns.tsx`** — Update `np_target_volume` renderCell

Current:
```tsx
<div className="flex items-center justify-between w-full h-full px-4">
  <span className="text-sm font-medium text-foreground">
    {row.np_target_volume != null ? row.np_target_volume.toLocaleString() : '—'}
  </span>
</div>
```

Updated to match Target Volume's right-aligned value style:
```tsx
<div className="flex items-center justify-between gap-2 px-4 py-2 w-full">
  <div className="text-sm font-medium text-right ml-auto">
    {row.np_target_volume != null
      ? row.np_target_volume.toLocaleString(undefined, { maximumFractionDigits: 1 })
      : '—'}
  </div>
</div>
```

This gives the same container layout (`flex items-center justify-between gap-2 px-4 py-2 w-full`) and right-aligned value treatment as the Target Volume column, just without the badge on the left.

