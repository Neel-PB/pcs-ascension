

## Fix ROLLUP_PSTATS values to match actual API data

The current P-stat names in `ROLLUP_PSTATS` don't match what the API returns. Need to update the set values.

### Change: `src/pages/staffing/StaffingSummary.tsx` (line 147-151)

Update the set to use the correct `unit_of_service` strings from the API:

```typescript
const ROLLUP_PSTATS = useMemo(() => new Set([
  'Pat Days + Obs',
  'Total Pat Days + Obs',
  'Pat Days + Obs + Newborn Days',
]), []);
```

Single line change, same file.

