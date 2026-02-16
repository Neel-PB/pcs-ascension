

## Add Tour Guides for Positions Checklist, AI Hub, and Feedback

### Overview
These three features are global overlay panels (not page-specific tabs), so they need standalone tour components that run when their respective panels are open. Each tour will highlight key UI elements within the panel itself.

### 1. Positions Checklist Tour (4 steps)

Targets elements inside the WorkforceDrawer panel:

1. **Header & Close** -- "This is the Positions Checklist. It provides a real-time summary of FTE gaps for your selected facility. Press Ctrl+Shift+W or click the edge trigger to toggle."
2. **KPI Tab Bar** -- "Switch between KPIs, Shortage, and Surplus tabs. KPIs show summary cards; Shortage and Surplus tabs show detailed checklist tables."
3. **KPI Cards** -- "These cards summarize key workforce metrics like total shortages, surpluses, and open requisitions for your current filter scope."
4. **Checklist Table** -- "The checklist groups positions by Location, then by Department/Skill/Shift. Click any group to expand and see individual position details."

### 2. AI Hub Tour (4 steps)

Targets elements inside the AIHubPanel:

1. **Welcome Screen** -- "This is PCS AI, your staffing assistant. Ask questions about headcount, forecasts, variance analysis, or request recommendations."
2. **Chat Input Bar** -- "Type your question here. You can also attach files (images, PDFs, spreadsheets) for analysis. Use the microphone for voice input."
3. **Keyboard Shortcut** -- "Press Ctrl+Shift+K to toggle the AI Hub from anywhere in the app."
4. **Clear & Minimize** -- "Use the menu to clear the conversation history or minimize the panel back to the edge trigger."

### 3. Feedback Tour (3 steps)

Targets elements inside the FeedbackPanel:

1. **Screenshot Capture** -- "Optionally capture a screenshot before submitting. Click the trigger button to draw a selection area on your screen."
2. **Feedback Form** -- "Fill in the title, select a type (Bug, Feature, Improvement, Question), set priority, and provide a detailed description."
3. **Submit & Shortcut** -- "Submit your feedback with the button below. You can also press Cmd+Shift+F to toggle this panel from anywhere."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add three new exported arrays:
  - `checklistTourSteps: Step[]` (4 steps)
  - `aiHubTourSteps: Step[]` (4 steps)
  - `feedbackTourSteps: Step[]` (3 steps)

#### New: `src/components/tour/OverlayTour.tsx`
- A generic reusable tour component for overlay panels
- Accepts `tourKey` and `steps` props
- Uses `useTour` hook with the given key
- Renders Joyride with the same styling/tooltip as StaffingTour
- The tour only runs when the parent panel is mounted (which already gates on `isOpen`)

#### `src/components/workforce/WorkforceDrawer.tsx`
- Add `data-tour` attributes to: header row, tabs list, KPI cards section, checklist table
- Render `<OverlayTour tourKey="checklist" steps={checklistTourSteps} />` inside the drawer (only rendered when open)

#### `src/components/ai/AIHubPanel.tsx`
- Add `data-tour` attributes to: welcome/content area, PillChatBar wrapper, panel header area
- Render `<OverlayTour tourKey="ai-hub" steps={aiHubTourSteps} />` inside the panel

#### `src/components/feedback/FeedbackPanel.tsx`
- Add `data-tour` attributes to: screenshot section, form area, footer/submit area
- Render `<OverlayTour tourKey="feedback" steps={feedbackTourSteps} />` inside the panel

#### `src/hooks/useTour.ts`
- No changes needed -- the existing hook already supports any `pageKey` string and the "Take a Tour" trigger via `activeTour` matching

### Tour Trigger Behavior
- Each tour auto-starts on first open of its respective panel (tracked via localStorage `helix-tour-[key]-completed`)
- Can be re-triggered via the "Take a Tour" dropdown using keys: `checklist`, `ai-hub`, `feedback`
- The Joyride z-index will be set to 10001 (above the panel's z-[80]) to ensure spotlight visibility

### Important Consideration
Since these panels use `z-[80]`, the Joyride overlay must use `z-index: 10001` to appear above them. The existing `zIndex: 10000` in StaffingTour options will be bumped to `10001` in the OverlayTour component.
