

## Fix Auth Page Image Layout to Match Design

### Issue
The left image panel extends edge-to-edge with no rounding, and the Ascension logo at the bottom gets cut off. The desired look (image 432) shows the entire page wrapped with padding and the left panel having rounded corners.

### Changes

**File: `src/pages/AuthPage.tsx`** (~3 lines changed)

1. Wrap the outer `flex` container in a full-screen wrapper with padding (`p-4`) and background
2. Add `rounded-2xl overflow-hidden` to the inner flex container so both panels get rounded corners
3. Change `bg-cover bg-center` to `bg-cover bg-bottom` on the left panel so the Ascension logo at the bottom stays visible

```text
Before:
┌─────────────────────────────────────┐
│ [image edge-to-edge] │ Form        │
│                      │             │
│ logo cut off ───────>│             │
└─────────────────────────────────────┘

After:
┌─────────────────────────────────────┐
│  ╭────────────────╮╭─────────────╮  │
│  │ image rounded  ││ Form        │  │
│  │                ││             │  │
│  │ logo visible   ││             │  │
│  ╰────────────────╯╰─────────────╯  │
└─────────────────────────────────────┘
```

- Outer div: `h-screen w-full bg-muted/30 p-4`
- Inner flex div: `flex h-full w-full rounded-2xl overflow-hidden shadow-lg`
- Left panel: change `bg-center` → `bg-bottom` to keep logo visible

