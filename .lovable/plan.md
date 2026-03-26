

## Show Hired FTE and Open Reqs Side-by-Side in Left Panel Header

### Current
The left panel has two separate sections stacked vertically:
- "Hired FTE" header with value on the right
- "Open Requisitions" header with value on the right (below the percentage bars)

### Requested
Combine both into a single header row: **Hired FTE value on the left, Open Reqs value on the right**, same styling.

### Change

**File: `src/components/forecast/BalanceTwoPanel.tsx`**

Replace the two separate header sections (lines 160-162 for Hired FTE header, and lines 188-192 for Open Reqs header) with a single combined header row at the top:

```tsx
{/* Combined header: Hired FTE left, Open Reqs right */}
<div className="flex items-center justify-between pb-2 border-b">
  <div>
    <span className="text-xs text-muted-foreground">Hired FTE</span>
    <div className="text-lg font-bold">{hiredFTE.total.toFixed(1)}</div>
  </div>
  <div className="text-right">
    <span className="text-xs text-muted-foreground">Open Reqs</span>
    <div className="text-lg font-bold">{openReqsFTE.total.toFixed(1)}</div>
  </div>
</div>
```

Then remove the separate "Open Requisitions" header (lines 189-192) since the total is now shown in the combined header. Keep the FT/PT/PRN breakdown cards below as they are.

