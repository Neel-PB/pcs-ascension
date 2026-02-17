

## Fix Admin Tour Key Mismatches and Add UI Settings Tour Steps

### Problem 1: Tour Key Mismatches (RBAC and Audit Log tours won't start from User Guides)
The `UserGuidesTab` catalog uses `admin-rbac` and `admin-audit`, but `AdminTour` registers these tours under `admin-access-control` and `admin-audit-log`. Since `useTour` checks `activeTour === pageKey`, clicking "Go & Start" from User Guides for these two tours silently fails.

### Problem 2: Outdated Step Count
Admin Settings shows "3 steps" in User Guides but actually has 7 steps now.

### Problem 3: Missing UI Settings Tour Steps
The Settings tour has no steps for the default UI Settings sub-tab (feedback visibility toggles). Users land on UI Settings but the tour immediately references Volume Config elements that aren't visible.

---

### Technical Changes

#### 1. `src/components/support/UserGuidesTab.tsx` (line 48-50)
Fix tour keys and step count to match `AdminTour`:

| Current | Fixed |
|---------|-------|
| `tourKey: "admin-rbac"` | `tourKey: "admin-access-control"` |
| `tourKey: "admin-audit"` | `tourKey: "admin-audit-log"` |
| `stepCount: 3` (admin-settings) | `stepCount: 10` (after adding UI Settings steps) |

#### 2. `src/components/admin/UISettings.tsx`
Add `data-tour` attributes to key UI elements:
- `data-tour="ui-settings-card"` on the Feedback System Visibility card
- `data-tour="ui-settings-save"` on the Save Settings button

#### 3. `src/components/tour/tourSteps.ts`
Insert 3 new steps into `adminSettingsTourSteps` after the existing "Settings Content" step (step 3) and before the Volume Config steps (step 4+):

| New Step | Target | Title | Content |
|----------|--------|-------|---------|
| 4 | `ui-settings-card` | Feedback Visibility | Toggle the floating feedback button, screenshot capture, and sidebar navigation link on or off for all users. |
| 5 | `ui-settings-save` | Save UI Settings | Click Save to apply your visibility changes. The button activates when you modify a toggle. |
| 6 | `admin-settings-tabs` | Switch to Volume Config | Click the Volume Config tab to configure target volume calculation rules. The following steps cover that section. |

The existing Volume Config steps (Scope Mode, Rule Matrix, Config Fields, Save) shift to positions 7-10.

### Summary of Final `adminSettingsTourSteps` (10 steps)
1. Tab Navigation
2. Settings Sub-Tabs
3. Settings Content
4. Feedback Visibility (NEW)
5. Save UI Settings (NEW)
6. Switch to Volume Config (NEW)
7. Scope Mode
8. Rule Matrix Preview
9. Configuration Fields
10. Save Changes

