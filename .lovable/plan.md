

## Convert Target Volume Popover to Dialog with Readable Month Labels

### Problem
The Target Volume chart currently opens as a small popover (520px wide, 176px tall). The X-axis labels show raw dates like `2025-03-01` instead of readable short months like `Jan'24`, `Feb'25`. Users need a larger, clearer view.

### Changes

**File: `src/components/staffing/TargetVolumePopover.tsx`**

1. **Replace Popover with Dialog** — swap `Popover`/`PopoverTrigger`/`PopoverContent` imports for `Dialog`/`DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogTitle` from `@/components/ui/dialog`
2. **Increase chart size** — the dialog gives more room, so increase chart height from `h-44` (176px) to `h-64` (256px) for better readability
3. **Fix X-axis month format** — the `format(parsed, "MMM''yy")` already produces `Jan'25` style labels, but the screenshot shows raw ISO dates. This means some month strings aren't being parsed correctly. Add more robust normalization to ensure all month values render as `Jan'25`, `Feb'25`, etc.
4. **Remove the `-45` degree rotation** on X-axis labels since the dialog is wider and labels like `Jan'25` are short enough to display horizontally (or use a slight angle like `-30`)
5. **Add a DialogTitle** with "Historical Volume Trend" or similar for context
6. **Keep the trigger** — the badge + value row stays the same, just wrapped in `DialogTrigger` instead of `PopoverTrigger`

### Result
- Clicking the target volume cell opens a proper dialog instead of a small popover
- Month labels show as `Jan'25`, `Feb'25` etc. — easy to read
- Chart is taller and wider, matching the dialog's natural width

