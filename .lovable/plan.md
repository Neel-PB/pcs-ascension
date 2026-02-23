

## Fix: Allow Facility Filter Dropdown to Open Above Tour Overlay

### Problem
The tour correctly shows the "Select a Facility" prompt with `spotlightClicks: true`, which allows clicking the filter trigger. However, when the facility dropdown opens, its popover content has `z-index: 50` while the Joyride overlay sits at `z-index: 10000`. The dropdown renders behind the overlay, making it impossible to interact with.

### Solution
When the tour is running on a settings tab and needs a facility selection, temporarily boost the z-index of the facility filter's popover so it renders above the Joyride overlay.

### Technical Details

**File: `src/components/staffing/FilterBar.tsx` (line 365)**

The `PopoverContent` for the facility filter currently has `z-50`. We need to conditionally raise it to `z-[10001]` when the tour is actively prompting for a facility selection.

- Accept a new optional prop `tourHighlightFacility?: boolean` on `FilterBar`
- When `true`, apply `z-[10001]` instead of `z-50` on the facility PopoverContent

**File: `src/components/tour/StaffingTour.tsx`**

No changes needed here -- the `spotlightClicks: true` already allows clicking through the spotlight.

**File: `src/pages/staffing/SettingsTab.tsx` (or wherever FilterBar is rendered for settings tabs)**

Pass the `tourHighlightFacility` prop to FilterBar based on whether the tour is active and needs a facility. This can be derived from the tour store's running state and the filter store's facility value.

**Alternative (simpler) approach -- modify FilterBar only:**

Inside `FilterBar.tsx`, directly read the tour state to detect if a facility-selection tour step is active, and self-boost the z-index. This avoids prop-drilling:

1. Import `useTourStore` in FilterBar
2. Check if a tour with key `staffing-volume-settings` or `staffing-np-settings` is running
3. Check if `selectedFacility` is still `all-facilities`
4. If both true, use `z-[10001]` on the facility PopoverContent

```tsx
// In FilterBar.tsx
import { useTourStore } from '@/stores/useTourStore';

// Inside component:
const activeTourKey = useTourStore(s => s.activeTourKey);
const isTourNeedingFacility = 
  (activeTourKey === 'staffing-volume-settings' || activeTourKey === 'staffing-np-settings')
  && selectedFacility === 'all-facilities';

// On PopoverContent (line 365):
// Change z-50 to: z-${isTourNeedingFacility ? '[10001]' : '50'}
```

If `useTourStore` doesn't expose `activeTourKey`, we'll check what state is available and use the appropriate selector.

### Scope
- `src/components/staffing/FilterBar.tsx` -- Conditionally boost facility popover z-index when tour needs facility selection (1 line change + 2 lines of state)

### User Experience
1. Tour highlights "Select a Facility" on the filter
2. User clicks the facility filter -- dropdown opens **above** the tour overlay
3. User selects a facility
4. Tour automatically continues with the settings steps

