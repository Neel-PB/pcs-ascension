

## Make Volume Settings and NP Settings Table Cards Shrink-Wrap Content

### Problem
Same issue as the other tabs: the table cards in Volume Settings and NP Settings stretch to fill remaining viewport space even with few rows. They should shrink-wrap to content height instead.

### Files to Change

**1. SettingsTab.tsx (line 238)**
- Outer wrapper: change `h-[calc(100vh-var(--header-height)-220px)] overflow-hidden` to `h-full overflow-hidden`
- This lets the parent (StaffingSummary's `overflow-auto` content area) control max height naturally

**2. SettingsTab.tsx (line 280)**
- Table wrapper: change `flex-1 min-h-0 overflow-hidden` to `min-h-0 max-h-full overflow-hidden`
- Card sizes to content, capped at available space

**3. NPSettingsTab.tsx (line 242)**
- Outer wrapper: same change -- `h-[calc(100vh-var(--header-height)-220px)] overflow-hidden` to `h-full overflow-hidden`

**4. NPSettingsTab.tsx (line 277)**
- Table wrapper: change `flex-1 min-h-0 overflow-hidden` to `min-h-0 max-h-full overflow-hidden`

### Result
- Few rows: card is short, page background visible below
- Many rows: card fills available space and scrolls internally
- Consistent with the pattern applied to Position Planning, Variance Analysis, and Forecasts tabs
