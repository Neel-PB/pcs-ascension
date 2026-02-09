
# Set Target NP % to Fixed 10% for All Departments

## Overview

Change the Target NP % column to always display **10%** for all departments instead of pulling from historical volume analysis data.

---

## Current vs. Proposed

```text
CURRENT:
┌──────────────────────┬─────────────┬───────────────┐
│ Department           │ Target NP % │ Override NP % │
├──────────────────────┼─────────────┼───────────────┤
│ Emergency Dept       │     —       │               │  ← Pulls from analysis (may be null)
│ ICU                  │    12       │               │  ← Dynamic value
│ Med/Surg             │     8       │               │  ← Dynamic value
└──────────────────────┴─────────────┴───────────────┘

PROPOSED:
┌──────────────────────┬─────────────┬───────────────┐
│ Department           │ Target NP % │ Override NP % │
├──────────────────────┼─────────────┼───────────────┤
│ Emergency Dept       │    10       │               │  ← Always 10%
│ ICU                  │    10       │               │  ← Always 10%
│ Med/Surg             │    10       │               │  ← Always 10%
└──────────────────────┴─────────────┴───────────────┘
```

---

## Technical Change

### File: `src/pages/staffing/NPSettingsTab.tsx`

**Line 92** - Change from dynamic value to fixed 10:

```typescript
// BEFORE
np_target_volume: analysis?.target_volume ?? null,

// AFTER
np_target_volume: 10,
```

This hardcodes the target NP % to 10 for all departments, removing the dependency on the historical volume analysis data for this specific value.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/staffing/NPSettingsTab.tsx` | Set `np_target_volume` to fixed value of `10` instead of pulling from analysis |
