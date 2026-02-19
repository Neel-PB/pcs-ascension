

## Fix: Override Vol Preview Should Use Default Card Style (Not Orange)

### What's Wrong

The Override Vol tour preview currently shows an orange border, but per the real UI (see the uploaded screenshot), the Override Vol card should appear with the **default neutral border** when it's not active. Only the Target Vol card gets the green highlight when it's the active source.

The tour should teach: "Green border = active source. No highlight = inactive." The Override Vol preview should look like a normal KPI card with no color emphasis.

### Change

**File: `src/components/tour/TourDemoPreview.tsx`**

Update the `OverrideVolPreview` component:
- Remove orange border styling (`border-orange-500/40`, `bg-orange-500/5`, `border-l-orange-500`)
- Use default neutral border (`border-border`, `bg-background/50`)
- Change the "Manual" badge from orange to neutral/muted styling
- Update the footer text from "Orange border = manual override is active" to something like "Default border = override is not active"

The result will be two side-by-side previews showing the contrast: Target Vol with green (active) vs Override Vol with neutral (inactive default).

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Update `OverrideVolPreview` to use neutral/default card styling instead of orange |

