

## Straighten X-axis Month Labels in Volume Settings Dialog

### Changes

**File: `src/components/staffing/TargetVolumePopover.tsx`**

1. **Widen dialog**: `max-w-4xl` → `max-w-6xl` to give enough horizontal room for straight labels
2. **Remove angle on X-axis** (line 139-140): Remove `angle={-30}` and `textAnchor="end"`, keeping labels horizontal
3. **Reduce bottom margin**: `margin.bottom: 20` → `10` since straight labels need less vertical space

