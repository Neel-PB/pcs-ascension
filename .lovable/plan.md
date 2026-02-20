

## Improve Support Page to Follow Helix Design System Standards

### Problem

The Support page currently violates several Helix standards from `.lovable/plan.md`:

1. **`space-y-6`** instead of `gap-4` (24px gaps vs standard 16px)
2. **`mb-6`** on tab toggle wrapper (manual margin instead of gap)
3. **`p-6`** on content cards (should be `px-4` per Section 4)
4. **No flexbox height chain** -- missing `h-full flex flex-col overflow-hidden`
5. **`shadow-soft`** on cards (should be `shadow-md` per Section 4)
6. Content area doesn't use `min-h-0 max-h-full` shrink-wrap pattern
7. Inner `space-y-6` wrapper around tab content (should be eliminated by gap)

### Changes

**File: `src/pages/support/SupportPage.tsx`**

1. **Line 132** -- Outer wrapper: change `space-y-6` to `h-full flex flex-col gap-4 overflow-hidden`
2. **Lines 134, 168, 174, 205, 230, 246** -- All content cards: change `p-6 shadow-soft` to `px-4 shadow-md`
3. **Line 157** -- Tab toggle wrapper: remove `mb-6`, keep `flex justify-center` (gap-4 handles spacing)
4. **Line 166** -- Inner content wrapper: change `space-y-6` to `min-h-0 max-h-full` (shrink-wrap for scrollable content)
5. **Line 134** -- Contact banner: add `flex-shrink-0` so it never collapses
6. **Line 157** -- Tab toggle: add `flex-shrink-0` so it stays fixed height

### Technical Detail

The resulting structure will be:

```text
SupportPage (outer div)
  h-full flex flex-col gap-4 overflow-hidden

  Contact Banner     <-- flex-shrink-0, rounded-xl, px-4, shadow-md
  Tab Toggle         <-- flex-shrink-0
  Tab Content        <-- min-h-0 max-h-full overflow-auto
    Card (guides/faqs/videos/etc)  <-- rounded-xl, px-4, shadow-md
```

This matches the exact pattern documented in Sections 1-5 of the project standards.

