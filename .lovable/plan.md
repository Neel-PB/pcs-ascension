

## Fix Right-Side Actions to Fixed Positions in User Guides

### Problem

The action buttons (step count, Done badge, "Go & Start", reset) currently float based on the title/description width, causing them to appear at inconsistent horizontal positions across rows.

### Solution

Give the right-side action area fixed widths so all rows align consistently:

1. **Step count badge**: fixed width (`w-16`, right-aligned text)
2. **Done badge**: fixed width slot (`w-14`) -- shows badge or empty space to keep alignment
3. **Go & Start button**: already consistent size
4. **Reset button**: fixed width slot (`w-7`) -- shows button or empty spacer

This ensures all action columns line up regardless of title length.

### Technical Details

**File: `src/components/support/UserGuidesTab.tsx`** (lines 242-274)

Replace the current `flex items-center gap-1.5 flex-shrink-0` div with fixed-width slots:

```tsx
<div className="flex items-center gap-1.5 flex-shrink-0">
  <Badge className="w-16 text-center ...">
    {stepTitles.length} steps
  </Badge>
  <div className="w-14 flex justify-center">
    {completed ? <Badge>Done</Badge> : null}
  </div>
  <Button>Go & Start</Button>
  <div className="w-7 flex justify-center">
    {completed ? <Button>Reset</Button> : null}
  </div>
</div>
```

This keeps all rows aligned at the same column positions on the right side, matching the clean grid-like layout shown in the screenshot.

### Files Changed

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Give right-side action slots fixed widths so badges/buttons align across all rows |

