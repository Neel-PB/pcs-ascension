

## Add Real-Data Previews to Variance Analysis Tour

### What We're Doing

Enhance the 5 Variance Analysis tour steps with rich visual previews using the same pattern as Position Planning. Each tooltip will include a compact visual mockup of the actual UI element being described.

### Current Steps and Planned Previews

| # | Step | Current | New Preview |
|---|------|---------|-------------|
| 1 | Variance Analysis (Header) | Plain text | `variance-table-preview`: Compact table wireframe with real skill columns (CL, RN, PCT, HUC, Overhead) and sample variance data |
| 2 | FTE Legend | `legend` variant | Keep as-is -- already has a good preview |
| 3 | Skill Column Headers | Plain text | `variance-skill-columns`: Visual breakdown showing the 5 skill groups with D/N/T sub-headers |
| 4 | Expandable Groups | `expandable-row` | `variance-groups`: Expandable group wireframe showing Region > Market hierarchy with real region/market names |
| 5 | Action Buttons | Plain text | Reuse existing `planning-actions` from PlanningDemoPreview (same Refresh/Download/Fullscreen pattern) |

### New Components in a `VarianceDemoPreview.tsx` File

Following the same pattern as `PlanningDemoPreview.tsx`:

#### 1. `variance-table-preview` -- Compact Variance Table

A miniature replica of the actual variance table with:
- Column groups: CL | RN | PCT | HUC | Overhead
- Sub-headers: D | N | T under each
- 3 sample rows using realistic region names (Region 1, Region 2, Region 3)
- Color-coded values: emerald for surplus (positive), orange for shortage (negative)
- TOTAL row at bottom
- Sample data with a mix of positive and negative values

```text
+----------+-------------+--------------+-----------+----------+----------+
| Regions  | CL          | RN           | PCT       | HUC      | Overhead |
|          | D    N    T | D    N    T  | D   N   T | D   N  T | D   N  T |
+----------+-------------+--------------+-----------+----------+----------+
| Region 1 | +1.2 +0.8   | -2.1 -1.5   | +0.5 +0.3 | ...      | ...      |
| Region 2 | -0.4 +0.2   | +1.3 +0.9   | -0.8 -0.4 | ...      | ...      |
+----------+-------------+--------------+-----------+----------+----------+
```

#### 2. `variance-skill-columns` -- Skill Group Breakdown

Visual showing the 5 skill type columns as labeled blocks with D/N/T sub-columns:
- CL: Clinical Lead
- RN: Registered Nurse
- PCT: Patient Care Technician
- HUC: Health Unit Coordinator
- Overhead: Management/Admin

Each block shows the full skill name, abbreviation badge, and D/N/T sub-header indicators.

#### 3. `variance-groups` -- Expandable Hierarchy

Uses real data from the app's region/market/submarket structure:
```text
[v] Region 1                    +2.4
    Baltimore                   +1.2
    Florida                     +1.2
[>] Region 2                    -1.8
[>] Region 3                    +0.6
--- TOTAL                       +1.2
```

Includes interactive expand/collapse on the first group (same pattern as `PlanningGroups`).

### Changes to `tourSteps.ts`

Import `VarianceDemoPreview` and create a `varianceDemoContent` helper (same pattern as `planningDemoContent`). Update 3 of the 5 steps:

- Step 1 (header): Use `variance-table-preview`
- Step 3 (skill headers): Use `variance-skill-columns`
- Step 4 (table): Use `variance-groups`
- Step 5 (actions): Reuse `planning-actions` from `PlanningDemoPreview`

Steps 2 (legend) stays as-is.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/VarianceDemoPreview.tsx` | New file with 3 variants: `variance-table-preview`, `variance-skill-columns`, `variance-groups` |
| `src/components/tour/tourSteps.ts` | Import VarianceDemoPreview, add `varianceDemoContent` helper, update 4 of the 5 variance steps to use rich previews |

