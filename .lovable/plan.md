

## Fix: Missing Minus Sign on Shortage Value in Tour Legend

### Problem

In the "FTE Legend" tour tooltip, the Shortage line shows "3.5" instead of "-3.5". The code uses a Unicode minus character (`−`, U+2212) which doesn't render correctly in the dark-mode tooltip context, making the sign invisible.

### Fix

**File: `src/components/tour/TourDemoPreview.tsx` (line 153)**

Replace the Unicode minus `−` with a standard ASCII hyphen-minus `-`:

```
Before: <span className="text-orange-700 font-medium">−3.5</span>
After:  <span className="text-orange-700 font-medium">-3.5</span>
```

Single character change in one file. The dark-mode tooltip uses `text-orange-700` which may not have sufficient contrast either — but the primary fix is the character rendering issue.

