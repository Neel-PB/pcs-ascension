

## Remove "Max Expiration" Column from Volume and NP Settings Tables

### Rationale
The max expiration date is already enforced inside the Expiration Date calendar picker (via `maxDate` prop). Showing it as a separate column is redundant and wastes horizontal space.

### Changes

**1. `src/config/volumeOverrideColumns.tsx`** — Remove the `max_allowed_expiry` column definition (lines 179-203)

**2. `src/config/npOverrideColumns.tsx`** — Remove the `max_expiry` column definition (lines 81-95)

No other files need changes — the data fields remain available for the date picker's `maxDate` constraint.

