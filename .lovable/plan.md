

## Fix Support Page Content Taking Full Width

### Problem
Each tab's content is wrapped in a `bg-shell-elevated rounded-xl px-4 py-4 shadow-md` card container. Since the shell layout already provides `bg-shell-elevated` and `px-6` padding, these inner wrappers add unnecessary padding and rounded card styling that shrinks the content area.

### Fix — `src/pages/support/SupportPage.tsx`

Remove the decorative card wrapper divs from all three tab content blocks. The content should render directly inside the scrollable container without extra padding/shadow.

1. **Guides tab** (line 87): Change `<div className="bg-shell-elevated rounded-xl px-4 pb-4 shadow-md">` to just `<div>`.
2. **FAQs tab** (line 93): Change `<div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">` to just `<div>`.
3. **Videos tab** (line 132): Change `<div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">` to just `<div>`.

This removes the extra horizontal padding (`px-4`) and shadow/rounded styling, letting search fields and content span the full available width.

