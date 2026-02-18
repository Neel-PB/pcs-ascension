

## Expand Staffing Summary Tour with Individual KPI Steps

### Overview

Break down the current "KPI Cards" overview step into granular steps: first show the full KPI sections as an overview, then walk through each individual KPI card explaining what it measures.

### Changes

**1. Add `data-tour` prop to `KPICard` component (`src/components/staffing/KPICard.tsx`)**

Add a new optional `dataTour?: string` prop and apply it as `data-tour={dataTour}` on the outer `motion.div` wrapper.

**2. Pass `data-tour` attributes per KPI in `DraggableKPISection.tsx`**

Map each KPI's `id` to a `data-tour` attribute on the `KPICard`, e.g. `data-tour="kpi-vacancy-rate"`, `data-tour="kpi-hired-ftes"`, etc.

**3. Expand `staffingSteps` in `src/components/tour/tourSteps.ts`**

After the existing "KPI Cards" overview step (step 3), insert 18 new steps -- one per KPI card:

| # | Target | Title | Content (brief description of the metric) |
|---|--------|-------|----|
| 4 | `[data-tour="kpi-vacancy-rate"]` | Vacancy Rate | Percentage of approved budgeted positions currently unfilled. |
| 5 | `[data-tour="kpi-hired-ftes"]` | Hired FTEs | Total Full-Time, Part-Time, and PRN employees currently on staff. |
| 6 | `[data-tour="kpi-target-ftes"]` | Target FTEs | Number of FTEs needed to meet budgeted staffing levels based on volume. |
| 7 | `[data-tour="kpi-fte-variance"]` | FTE Variance | Gap between Target FTEs and Hired FTEs. Positive means understaffed. |
| 8 | `[data-tour="kpi-open-reqs"]` | Open Reqs | Count of approved requisitions not yet filled. |
| 9 | `[data-tour="kpi-req-variance"]` | Req Variance | Remaining gap after accounting for open requisitions against FTE variance. |
| 10 | `[data-tour="kpi-12m-monthly"]` | 12M Average | Rolling 12-month average monthly volume of patient encounters or units of service. |
| 11 | `[data-tour="kpi-12m-daily"]` | 12M Daily Average | Average daily volume over the past 12 months. |
| 12 | `[data-tour="kpi-3m-low"]` | 3M Low | Average daily volume during the 3 lowest-volume months. Used for minimum staffing. |
| 13 | `[data-tour="kpi-3m-high"]` | 3M High | Average daily volume during the 3 highest-volume months. Used for peak staffing. |
| 14 | `[data-tour="kpi-target-vol"]` | Target Volume | Expected daily volume used for staffing calculations. Green border means it is active. |
| 15 | `[data-tour="kpi-override-vol"]` | Override Volume | Manually set volume that supersedes the target. Orange border means it is active. |
| 16 | `[data-tour="kpi-paid-ftes"]` | Paid FTEs | Total labor resources the organization pays for, productive and non-productive. |
| 17 | `[data-tour="kpi-contract-ftes"]` | Contract FTEs | FTEs supplied by external agencies -- travel nurses, agency staff, temp contractors. |
| 18 | `[data-tour="kpi-overtime-ftes"]` | Overtime FTEs | Hours worked above regular commitment, converted to FTE equivalent. |
| 19 | `[data-tour="kpi-total-prn"]` | Total PRN | PRN staff hours converted to FTE equivalent. Used for flex coverage. |
| 20 | `[data-tour="kpi-total-np"]` | Total NP% | Percentage of paid hours not spent on direct patient care (PTO, training, admin). |
| 21 | `[data-tour="kpi-total-fullpart-ftes"]` | Employed Productive FTEs | Full-Time and Part-Time productive FTEs after excluding non-productive hours. |

The remaining existing steps (Trend Chart, Definition, Volume Colors, Target Split Badge, Hired Split Badge) follow after these.

**4. Update step count in `UserGuidesTab.tsx`**

Update the staffing summary `stepCount` from 8 to 26.

### Files changed

| File | Change |
|------|--------|
| `src/components/staffing/KPICard.tsx` | Add `dataTour` prop, apply as `data-tour` on wrapper |
| `src/components/staffing/DraggableKPISection.tsx` | Pass `dataTour={`kpi-${kpi.id}`}` to each KPICard |
| `src/components/tour/tourSteps.ts` | Insert 18 individual KPI steps into `staffingSteps` |
| `src/components/support/UserGuidesTab.tsx` | Update stepCount 8 -> 26 |

