

## Fix: Resolve Region to Actual Value When Saving Overrides

### Problem
When a user selects a facility and department without explicitly selecting a region/market filter, the `selectedRegion` value is `"all-regions"` (the sentinel). This gets stored in the database as-is. Instead, the actual region should be derived from the patient volume data that's already loaded.

### Current State
- **NPSettingsTab**: Already partially handles this (line 50-52) — derives region from `patientVolumeData[0]?.region`. But it falls back to `selectedRegion` which could be `"all-regions"`.
- **SettingsTab**: Uses `selectedRegion || ''` directly (line 128), which stores `"all-regions"` when no region filter is selected.

### Changes

#### 1. `src/pages/staffing/SettingsTab.tsx`
- Add a derived `region` value from `patientVolumeData`, same pattern as NPSettingsTab
- Use it on line 128 instead of `selectedRegion || ''`
- Also derive `market` from the data to avoid storing `"all-markets"`

```typescript
const region = useMemo(() => {
  return patientVolumeData?.[0]?.region || selectedRegion || '';
}, [patientVolumeData, selectedRegion]);

const market = useMemo(() => {
  return patientVolumeData?.[0]?.market || selectedMarket || '';
}, [patientVolumeData, selectedMarket]);
```

Then in `handleSaveDate`: `region: region` instead of `region: selectedRegion || ''`

#### 2. `src/pages/staffing/NPSettingsTab.tsx`
- The existing derived `region` (line 50-52) already prefers `patientVolumeData[0]?.region`, which is correct
- However, also derive `market` from the data to avoid storing `"all-markets"` when the market filter isn't explicitly selected

Both tabs will now resolve region/market from the actual API data associated with the selected facility, regardless of filter state.

