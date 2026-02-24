
## Fix Forecast Filter Dropdown Items Not Showing

### What I found

The dropdown menu is opening correctly, but each option label is hidden by CSS in `ForecastTab.tsx`:

- `SelectItem` currently includes `className="... [&>span:first-child]:hidden"`
- In this Select implementation, the first span is the item text (`SelectPrimitive.ItemText`)
- So the text is being explicitly hidden, which matches your screenshot (blank rows in open menu)

The z-index change was fine, but this separate class is the real reason the list appears “not there”.

### Planned changes

| File | Change |
|---|---|
| `src/pages/staffing/ForecastTab.tsx` | Remove `"[&>span:first-child]:hidden"` from all Skill and Shift `SelectItem` entries |
| `src/pages/staffing/ForecastTab.tsx` | Keep `bg-background` on `SelectContent` and keep current placement between shortage/surplus cards |
| `src/pages/staffing/ForecastTab.tsx` | (Optional cleanup) switch from `SelectItem` to `SelectItemNoCheck` for explicit “no checkmark” behavior without hiding text |

### Exact implementation approach

1. Update both dropdown blocks (Skill and Shift):
   - `All Skills`, mapped `skill` items
   - `All Shifts`, mapped `shift` items
2. Keep only valid selection styling:
   - `data-[state=checked]:bg-primary/15`
3. Remove the text-hiding utility from each `SelectItem`.
4. Verify the currently selected label still appears in the trigger and list items are readable.

### Why this will fix it

- The blank list is not a data issue and not a portal issue.
- Items exist, and rows render (you can see hover/highlight area).
- Text is hidden by a utility selector targeting the first child span.
- Removing that selector restores item labels immediately.

### Validation checklist

1. Open Forecast tab.
2. Click **Skill** dropdown:
   - Confirm “All Skills” plus skill options are visible.
3. Click **Shift** dropdown:
   - Confirm “All Shifts”, “Day”, “Night” (or available values) are visible.
4. Select values and verify table rows filter correctly.
5. Reset with the X button and verify both filters return to “all”.

### Technical notes

- This aligns with your shared `Select` component (`src/components/ui/select.tsx`) where `SelectItem` has no indicator/check icon node.
- If you want truly standardized no-check behavior project-wide, `SelectItemNoCheck` is the safer semantic option than CSS child-hiding hacks.
