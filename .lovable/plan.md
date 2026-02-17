

## Fix: Overlay Guide Tours (Checklist, AI Hub, Feedback)

### Problem
The three overlay tours (Checklist, AI Hub, Feedback Panel) can't run from the Support page because their panels must be **open** for the tour targets to exist in the DOM. Currently, clicking "Start Tour" only sets the tour key in the store but never opens the corresponding panel.

### Solution
Update `handleStartTour` in `UserGuidesTab.tsx` to **programmatically open the overlay panel** before triggering the tour. Each overlay has its own Zustand store with a `setOpen` method:

- **Checklist** -> `useWorkforceDrawerStore().setOpen(true)`
- **AI Hub** -> `useAIHub().setOpen(true)`  
- **Feedback** -> `useFeedbackStore().setOpen(true)`

### Changes (1 file)

**`src/components/support/UserGuidesTab.tsx`**

1. Import the three overlay stores:
   - `useWorkforceDrawerStore`
   - `useAIHub`
   - `useFeedbackStore`

2. Update `handleStartTour` to check if the guide is an overlay, and if so, open the corresponding panel before starting the tour:

```text
handleStartTour(guide):
  if guide.tourKey === "checklist"  -> open WorkforceDrawer
  if guide.tourKey === "ai-hub"    -> open AIHub
  if guide.tourKey === "feedback"  -> open FeedbackPanel
  then after a 300ms delay, call startTour(guide.tourKey)
```

This ensures the panel is mounted and its `data-tour` targets are in the DOM before Joyride tries to spotlight them. The existing `OverlayTour` component inside each panel already listens to `activeTour` from the tour store, so once the panel is open and the tour key is set, the tour will run normally.

