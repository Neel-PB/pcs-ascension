

## Replace Hardcoded Filter Previews with Real Database Data

### Overview

Update the filter demo previews in `tourSteps.ts` to use actual Region, Market, Facility, Department, and Submarket names from the database instead of the current placeholder values like "East", "Gulf Coast", "St. Vincent Hospital", etc.

### Current vs New Data

| Filter | Current (Fake) | New (Real) |
|--------|---------------|------------|
| Region | East, Gulf Coast, West | Region 1, Region 2 |
| Market | Indianapolis, Nashville, Wichita | Baltimore, Florida, Illinois, Indiana |
| Facility | St. Vincent Hospital / FAC001, Sacred Heart Medical / FAC002, Providence Clinic / FAC003 | Alexian Brothers Behavioral / 40078, Amita Health Mercy Ctr Aurora / 40012, Ascension Saint Thomas Midtown / 46001 |
| Department | ICU / DEP101, Emergency / DEP202, Med-Surg / DEP303 | Adult ECMO 001 / 10298, Cardiac Care / 11012, Cardiac Critical Care Unit / 14454 |
| More Filters labels | Already correct (Submarket, Level 2, PSTAT) -- no change needed |

### Changes

**`src/components/tour/tourSteps.ts`** -- Update 4 filter steps:

1. **Region Filter** (line ~31): Change items from `['All Regions', 'East', 'Gulf Coast', 'West']` to `['All Regions', 'Region 1', 'Region 2']`

2. **Market Filter** (line ~41): Change items from `['All Markets', 'Indianapolis', 'Nashville', 'Wichita']` to `['All Markets', 'Baltimore', 'Florida', 'Illinois', 'Indiana']`

3. **Facility Filter** (lines ~52-54): Change searchable items to real facilities:
   - `{ name: 'Alexian Brothers Behavioral', id: '40078' }`
   - `{ name: 'Amita Health Mercy Ctr Aurora', id: '40012' }`
   - `{ name: 'Ascension Saint Thomas Midtown', id: '46001' }`

4. **Department Filter** (lines ~66-68): Change searchable items to real departments:
   - `{ name: 'Adult ECMO 001', id: '10298' }`
   - `{ name: 'Cardiac Care', id: '11012' }`
   - `{ name: 'Cardiac Critical Care Unit', id: '14454' }`

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Replace hardcoded filter preview data with real Region, Market, Facility, and Department names/IDs from the database |

