

## Wire Volume KPIs to Patient Volume API

### What stays the same
- **Override Vol** KPI card continues using `useVolumeOverrides` hook (NestJS `/volume-overrides`) — no changes
- Chart data generators remain for sparkline visuals (seeded from real values)

### New hook: `src/hooks/usePatientVolume.ts`
- Fetches `GET /patient-volume` with query params: `region`, `market`, `businessUnit` (facility), `departmentId`, `submarket`, `level2`, `pstat`
- Same auth pattern (MSAL token from sessionStorage)
- Unwraps `{ data, total }` paginated response
- Returns typed array of `PatientVolumeRecord`

### Edit: `src/pages/staffing/StaffingSummary.tsx`
- Import and call `usePatientVolume` with current filter selections
- Replace hardcoded Volume KPI values with API data from first matching record:

| KPI Card | Hardcoded → | API field |
|---|---|---|
| 12M Average | `"633.5"` | `mthly_avg_volume_12mth` |
| 12M Daily Average | `"20.8"` | `dly_avg_volume_12mth` |
| 3M Low | `"14.2"` | `dly_avg_volume_3mth_low` |
| 3M High | `"28.4"` | `dly_avg_volume_3mth_high` |
| Target Vol | `"20.8"` | `target_volume` |

- When no data returned or loading, show `"—"` as value
- Override Vol card remains unchanged (uses `useVolumeOverrides`)
- Sparkline charts seeded from real value (e.g., `generateGrowthTrend(val * 0.9, val)`)

### Scope
- 1 new file, 1 edited file
- No changes to `useVolumeOverrides`, `useHistoricalVolumeAnalysis`, or Settings tab

