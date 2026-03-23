
## Fix Access Scope Scroll with a Proper Enterprise Dialog Layout

### What I’d change
Keep the current **4 access-scope entry points** in the user form:
- Region
- Market
- Facility
- Department

But make each one open a **dedicated professional dialog** with a layout built specifically for reliable scrolling.

### Why scroll is failing now
The current level dialog relies on a custom `ScrollArea` inside a nested dialog/sheet stack. That makes the scroll height too implicit, so wheel/trackpad scrolling is inconsistent when lists get long.

### Implementation plan

**1. Rebuild `AccessScopeLevelDialog.tsx` around a fixed modal structure**
- Keep the top area static:
  - icon + title
  - description
  - search
  - selected count / actions
- Keep the bottom footer static:
  - Cancel
  - Done
- Make only the **middle list panel** scroll

**2. Replace the inner custom scroll area with a native scroll container**
- Use a dedicated list wrapper like:
  - `flex-1 min-h-0 overflow-y-auto overscroll-contain`
- Put the list inside a bordered panel so the scroll area is visually obvious
- This is much more reliable than stacking Radix scroll behavior inside nested modals

**3. Add dialog size presets by scope type**
- **Region / Market**: compact dialog
- **Facility / Department**: wider dialog and taller list viewport
- Example behavior:
  - Region: small, mostly no scroll needed
  - Market: medium-height list
  - Facility: taller list panel
  - Department: tallest list panel

**4. Make the list rows look more enterprise**
- Use a stable 3-part row:
  - checkbox
  - name
  - right-aligned ID/code
- Keep hover + selected states
- Keep searchable behavior for Facility and Department

**5. Preserve current cascade logic**
- Region filters Market
- Market filters Facility
- Facility filters Department
- No backend/API changes needed
- `AccessScopeManager.tsx` stays the controller and summary surface

### Files to update

**`src/components/admin/AccessScopeLevelDialog.tsx`**
- Main fix happens here
- Replace the current `ScrollArea`-based middle section with a native scrolling body
- Add:
  - `overflow-hidden` on dialog content
  - `flex flex-col`
  - explicit body/list height rules
  - size variants for small vs large lists

**`src/components/admin/AccessScopeManager.tsx`**
- Pass a size/variant hint per level (`compact` / `large`)
- Keep current per-level trigger rows and chips
- No logic rewrite unless needed for cleaner labels/actions

### Recommended UX refinement
While doing this, I’d also improve the actions text to be clearer:
- `Select All Visible`
- `Clear Selection`

That feels more enterprise and avoids confusion when filters/search are active.

### Technical details
```text
Dialog
├─ Header (fixed)
│  ├─ Title / description
│  ├─ Search
│  └─ Count + quick actions
├─ List panel (only scrollable area)
│  └─ overflow-y-auto + min-h-0
└─ Footer (fixed)
   ├─ Cancel
   └─ Done
```

Key CSS/layout fixes:
- `DialogContent`: `flex flex-col overflow-hidden`
- Scroll body wrapper: `flex-1 min-h-0`
- Actual list viewport: `overflow-y-auto overscroll-contain`
- Large lists: explicit viewport height for Facility/Department

### Result
This will keep the UI you want:
- each scope level opens its **own dialog**
- the dialogs feel cleaner and more professional
- scroll becomes reliable for long Facility/Department lists
- header/footer stay visible while the list scrolls independently
