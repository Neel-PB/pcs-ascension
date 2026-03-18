

## Fix Variance Analysis Legend

**Problem**: The legend in Variance Analysis shows `+ FTE Shortage` and `- FTE Surplus`, which is backwards. Per the variance formula (Hired - Target), positive means surplus and negative means shortage.

### Changes

**`src/pages/staffing/VarianceAnalysis.tsx`** — Two identical legend blocks (lines 669-675 and lines 740-747):

Swap the labels:
- `+` → "FTE Surplus" (was "FTE Shortage")
- `-` → "FTE Shortage" (was "FTE Surplus")

Both the inline header legend and the fullscreen dialog legend will be updated.

