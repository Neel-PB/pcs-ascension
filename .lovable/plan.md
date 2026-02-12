
## Change All Shortage Colors from Red to Orange

### Scope
Replace all red/destructive colors used for "shortage" indicators across the Staffing module (Position Planning, Variance Analysis, Forecast) with orange, matching the vacancy age badge color from the Positions module.

### Files and Changes

#### 1. `src/pages/staffing/PositionPlanning.tsx`
- **Line 271**: `getVarianceColor` -- change `text-red-600` to `text-orange-600` for negative variance values
- **Lines 920, 1050**: FTE Shortage legend -- change `text-red-500` to `text-orange-500` on the `-` symbol

#### 2. `src/components/forecast/ForecastKPICards.tsx`
- **Lines 40-41**: Shortage card border/bg -- change `border-destructive/60 bg-destructive/10` and `border-destructive/30 bg-destructive/5` to `border-orange-500/60 bg-orange-500/10` and `border-orange-500/30 bg-orange-500/5`
- **Lines 47, 48, 50, 54, 56, 59**: All `text-destructive` references to `text-orange-600`
- **Line 54**: Separator `bg-destructive/30` to `bg-orange-500/30`

#### 3. `src/components/forecast/ForecastBalanceTableRow.tsx`
- **Lines 14-15**: `gapColor` for shortage/surplus -- change `text-destructive` to `text-orange-600`
- **Lines 23-24**: `statusColor` for shortage/surplus -- change `text-destructive bg-destructive/10` to `text-orange-600 bg-orange-500/10`

#### 4. `src/components/forecast/BalanceTwoPanel.tsx`
- **Line 24**: PercentageBar text when under target -- change `text-destructive` to `text-orange-600`
- **Line 34**: PercentageBar fill when under target -- change `bg-destructive` to `bg-orange-500`

#### 5. `src/components/staffing/KPICard.tsx`
- **Line 65**: `getTrendColor` isNegative -- change `text-destructive` to `text-orange-600`
- **Line 67**: trend down -- change `text-red-500` to `text-orange-500`
- **Line 83**: isNegative card border/bg -- change `border-destructive/50 bg-destructive/5` to `border-orange-500/50 bg-orange-500/5`
- **Line 118**: Value text isNegative -- change `text-destructive` to `text-orange-600`

#### 6. `src/components/staffing/KPICardGroup.tsx`
- **Line 54**: `getTrendColor` isNegative -- change `text-destructive` to `text-orange-600`
- **Line 56**: trend down -- change `text-red-500` to `text-orange-500`
- **Line 66**: isNegative card border/bg -- change `border-destructive/50 bg-destructive/5` to `border-orange-500/50 bg-orange-500/5`
- **Line 101**: Value text isNegative -- change `text-destructive` to `text-orange-600`

#### 7. `src/components/staffing/KPIChartModal.tsx`
- **Line 42**: Chart color for negative -- change `hsl(var(--destructive))` to `hsl(24 95% 53%)` (orange-500 hsl value)
- **Line 48**: `getTrendColor` isNegative -- change `text-destructive` to `text-orange-600`
- **Line 50**: trend down -- change `text-red-500` to `text-orange-500`
- **Line 104**: Value text isNegative -- change `text-destructive` to `text-orange-600`

#### 8. `src/components/staffing/KPIInfoModal.tsx`
- **Line 37**: `getTrendColor` isNegative -- change `text-destructive` to `text-orange-600`
- **Line 39**: trend down -- change `text-red-500` to `text-orange-500`
- **Line 54**: Value text isNegative -- change `text-destructive` to `text-orange-600`

#### 9. `src/components/staffing/DraggableKPISection.tsx`
- **Lines 207, 215**: Modal "Current vs Target" off-target values -- change `text-red-500` to `text-orange-500`
- **Lines 253, 259, 265**: Modal current split badges when off-target -- change `bg-destructive/10 text-destructive` to `bg-orange-500/10 text-orange-600`

### Not Changed
- **Variance Analysis table cells** (`VarianceAnalysis.tsx`) -- these currently use no red/destructive color on cell values (just `font-semibold`), so no change needed
- **Workforce checklist components** (`ForecastChecklistLocationGroup`, `ForecastChecklistDeptSkillGroup`, `ForecastChecklistPositionDetail`) -- these use `text-red-600` for surplus (not shortage), so left as-is
- **Settings tab** (`SettingsTab.tsx`) -- uses destructive for "Require Override" count, which is a different concern
- **Badge `destructive` variant** -- semantic badge variant for rejected status badges is unrelated

### Result
All shortage/negative indicators across Position Planning, Forecast, and Staffing Summary KPIs will use orange (`orange-500/600/700`) instead of red/destructive, creating visual consistency with the Positions module vacancy age badges.
