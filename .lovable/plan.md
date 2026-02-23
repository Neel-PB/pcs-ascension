

## Optimize Support Page Space Utilization

### Problem

The "Need Help?" contact banner at the top occupies significant vertical space (~160px), pushing the actual content (User Guides, FAQs, etc.) down and reducing the usable area. The banner has a large heading, description paragraph, and two contact cards stacked vertically on smaller screens.

### Solution: Collapse the Banner into a Compact Inline Strip

Replace the tall multi-row banner with a single-row horizontal strip that shows all the same information (icon, title, email, phone) in one line, freeing up ~100px of vertical space for content.

**File: `src/pages/support/SupportPage.tsx`**

Replace the current banner block (lines 134-155) with a compact single-row layout:

```
Before (tall card with heading + paragraph + 2-column grid):
  - Icon + "Need Help?" title
  - Description paragraph
  - Email card | Phone card

After (single compact row):
  [Icon] Need Help?  |  Email: support@company.com  |  Phone: 1-800-555-0123
```

### Technical Details

- Replace the banner `div` (lines 135-155) with a single flex row using `items-center` and `gap-6`
- Remove the description paragraph ("Can't find what you're looking for...")
- Display email and phone as inline text pairs separated by a dot or pipe, not as separate bordered cards
- Keep `flex-shrink-0` so it doesn't collapse
- Reduce vertical padding from `py-4` to `py-3`

The resulting markup will be roughly:
```tsx
<div className="bg-shell-elevated rounded-xl px-4 py-3 shadow-md flex-shrink-0 flex items-center gap-6">
  <div className="flex items-center gap-2">
    <div className="p-1.5 bg-primary/10 rounded-lg">
      <MessageSquare className="h-4 w-4 text-primary" />
    </div>
    <span className="text-sm font-semibold text-foreground">Need Help?</span>
  </div>
  <div className="flex items-center gap-4 text-sm">
    <span className="text-shell-muted">Email: <a className="text-primary">support@company.com</a></span>
    <span className="text-shell-muted">Phone: <span className="text-primary">1-800-555-0123</span></span>
  </div>
</div>
```

This is a single-file change affecting only `src/pages/support/SupportPage.tsx`, reducing the banner from ~6 vertical rows to 1, giving the tab content area significantly more space.

