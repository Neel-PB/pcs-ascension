

## Fix: Use Green as the Active Color for Both Scenarios

### What's Wrong

Currently Scenario 2 uses orange to indicate the Override Vol is active. The user wants **green** to be the universal "active" color -- whichever card is active gets the green border, and the inactive card gets the default neutral border.

### Change

**File: `src/components/tour/TourDemoPreview.tsx`**

Update the `VolumeColors` component:

1. **Scenario 2 label**: Change from `text-orange-600` to `text-emerald-600`, rename to "Scenario 2 -- Override Active"
2. **Override Vol card in Scenario 2**: Change `active="orange"` to `active="green"` and `badgeColor="orange"` to `badgeColor="green"`
3. **MiniVolCard**: Remove the orange active case entirely since it's no longer used. The `active` prop becomes `'green' | 'none'` only.

Result: Both scenarios show the active card with a green border and the inactive card with a neutral border.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Replace orange active styling with green in Scenario 2; simplify `MiniVolCard` to only support green or none |

