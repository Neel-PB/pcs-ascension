

## Fix: Position Details Sheet Title on Open Positions Tab

### Problem

When clicking a row on the **Open Positions** tab, the details sheet opens with the title "Open Requisition" instead of "Open Position". This is because the `RequisitionDetailsSheet` component has the title hardcoded on line 56.

### Fix

**File: `src/components/workforce/RequisitionDetailsSheet.tsx` (line 56)**

Change the hardcoded title from "Open Requisition" to "Open Position":

```
Before: <h2 className="text-xl font-semibold text-foreground">Open Requisition</h2>
After:  <h2 className="text-xl font-semibold text-foreground">Open Position</h2>
```

Single line change in one file.
