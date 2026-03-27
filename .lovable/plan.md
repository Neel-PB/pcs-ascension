

## Show Position IDs as Badges in Recommended Actions

### Change

**File: `src/components/forecast/BalanceTwoPanel.tsx`** — lines 196-200

Replace the plain text `Position IDs: 578293, 578284` with a flex-wrapped row of `Badge` components.

```tsx
// Current (line 197-199):
<div className="ml-4 text-[10px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
  Position IDs: {data.posIds.join(', ')}
</div>

// New:
<div className="ml-4 flex flex-wrap gap-1.5 py-1.5">
  {data.posIds.map((id) => (
    <Badge key={String(id)} variant="outline" className="text-[10px] px-2 py-0.5 font-mono">
      {String(id)}
    </Badge>
  ))}
</div>
```

Add `Badge` to the existing imports from `@/components/ui/badge`.

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — render position IDs as Badge components instead of comma-separated text

