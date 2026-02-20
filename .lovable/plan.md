

## Add Helix UI Design System Specs to Project Memory

### What This Does

Append the complete Helix UI component specifications to `.lovable/plan.md` so every future session automatically follows these standards without relying on separate system memory.

### Content to Add (after existing layout section)

The following sections will be appended:

---

**Section 4: Helix UI Component Standards**

**Cards**
- Border radius: `rounded-xl` (12px)
- Shadow: `shadow-md`
- Internal padding: `px-4` (16px)

**Icon Buttons**
- Shape: fully rounded (`rounded-full`)
- Icon size: 24px

**Search Fields**
- Shape: pill-shaped (`rounded-full`)
- Blue circular search button
- Constant 2px border (no border-width change on focus)

**Badges**
- Shape: `rounded-full` pill
- Semantic colors (success/warning/danger/muted)

**Menus and Selects**
- Border radius: `rounded-lg` (8px)
- Minimum width: 210px
- All dropdown triggers use a blue brand chevron (`text-[#1D69D2]`) that rotates 180 degrees when open

**Calendar / Date Picker**
- Cell size: 40x40px
- Two-step confirmation (header + footer)

**Dialogs and Sheets**
- User Management forms: wide sheet layout (`sm:max-w-xl`, 576px)
- Structure: fixed header, scrollable middle, fixed footer

**Snackbars (Sonner)**
- Position: bottom-center
- Border radius: `rounded-lg`

**Focus and Selection**
- Focus: constant 2px primary border width (no outline ring)
- Selection: `bg-primary/15` + `border-primary/30` background tint only -- no checkmarks
- All visible focus rings suppressed globally via CSS

**Section 5: Spacing and Padding Defaults**

- Page padding: `py-4 px-4` (16px, set by ShellLayout)
- Section gaps: `gap-4` (16px) between siblings
- Card internal padding: `px-4` (16px)
- Toolbar/search bar height: natural (~40px)
- Filter bar height: natural (~48px)
- Tab toggle height: natural (~44px)
- No manual margins between sections -- gap handles everything

---

### File Changed

**`.lovable/plan.md`** -- Append sections 4 and 5 after existing content

### Result

The complete Helix design system (component specs + layout rules) will be in one reference file, applied automatically to all future work.

