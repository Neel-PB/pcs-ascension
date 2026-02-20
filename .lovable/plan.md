

## Add Demo Previews to Notification and Theme Toggle Tour Steps

### What Changes

Add two new high-fidelity miniature wireframe previews to the header tour guide steps for **Notifications** and **Theme Toggle**, matching the existing demo preview pattern used throughout the tour system.

### New File: `src/components/tour/HeaderDemoPreview.tsx`

A new component with two preview variants:

**1. `notification-panel` variant**
- Miniature wireframe of the notification panel showing:
  - A tab bar with "Feed" and "Notifications" tabs
  - 2-3 mock notification items with icon, title, timestamp, and unread dot
  - A red badge showing unread count
  - "Mark all read" action hint
- Uses design-system tokens (`bg-muted/50`, `border-primary/20`, etc.)

**2. `theme-cycle` variant**
- Shows the three theme states side by side:
  - Sun icon with "Light" label
  - Moon icon with "Dark" label
  - Monitor icon with "System" label
- An arrow or cycle indicator showing the click-to-cycle behavior
- Active state highlighted with primary color

### Modified File: `src/components/tour/headerTourSteps.ts`

- Import `createElement` and `HeaderDemoPreview`
- Create a helper `headerDemoContent(text, variant)` similar to the existing `demoContent` helper
- Update the **Notifications** step (line 26-30) to use `headerDemoContent(...)` with the `notification-panel` variant instead of plain text
- Update the **Theme Toggle** step (line 32-37) to use `headerDemoContent(...)` with the `theme-cycle` variant instead of plain text

### Technical Details

- Follows the exact same pattern as `TourDemoPreview.tsx`: a switch-based component with named variants
- Uses `createElement` in the tour steps file (not JSX) to match existing convention
- Previews are self-contained with no external data dependencies
- Icons rendered as simple SVG shapes or unicode symbols to keep it lightweight

### Result
- When users reach the Notifications or Theme Toggle steps in the header tour, they see a visual preview of what the feature looks like and how it works
- Consistent with the high-fidelity demo preview pattern used in staffing, planning, and settings tours
