

## Update Forecast Panel Split to 45/55

### Change

**File: `src/components/forecast/BalanceTwoPanel.tsx`**

Update the grid template from `35% 65%` to `45% 55%`:

```tsx
// Line ~137: Current
style={{ gridTemplateColumns: '35% 65%' }}

// Updated
style={{ gridTemplateColumns: '45% 55%' }}
```

**File: `src/components/forecast/BalanceTwoPanel.tsx`** (left panel additions)

Add an **Open Requisitions** section below the Hired FTE bars. The `openReqsFTE` data is already available on each `ForecastBalanceRow` — just needs to be passed through and rendered.

- Add `openReqsFTE: OpenReqsBreakdown` to `BalanceTwoPanelProps`
- Below the FT/PT/PRN percentage bars, render a compact "Open Reqs" summary showing FT, PT, PRN counts and total

**File: `src/components/forecast/ForecastBalanceTableRow.tsx`**

Pass `openReqsFTE={row.openReqsFTE}` to `BalanceTwoPanel`.

