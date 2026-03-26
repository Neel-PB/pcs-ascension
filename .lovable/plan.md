

## Feedback Page: Larger Search Button + Uniform Filter Dimensions

### Changes

**File: `src/pages/feedback/FeedbackPage.tsx`**
1. Search field container: `w-64` → `w-72`
2. All 3 `SelectTrigger` components: `w-[140px]` → `w-[160px] h-11` for uniform width and height matching the search field

**File: `src/components/ui/search-field.tsx`**
3. Search icon button: `h-9 w-9` → `h-10 w-10` for a larger, more prominent button

### Files Modified
1. `src/pages/feedback/FeedbackPage.tsx` — lines 158, 168, 180, 192
2. `src/components/ui/search-field.tsx` — line 54

