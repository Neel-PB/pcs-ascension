

## Split-Screen Login Page

Redesign the login page into a two-section layout matching the uploaded Ascension branding image.

### Layout

```text
┌──────────────────────┬──────────────────────┐
│                      │                      │
│   Background Image   │   "Position Control" │
│   (uploaded blue     │                      │
│    Ascension art)    │   [Email field]       │
│                      │   [Continue button]   │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

- **Left half**: The uploaded image (`IMG_0620.PNG`) as a full-height cover background. Hidden on mobile, form goes full-width.
- **Right half**: The login form, vertically centered. Title "Position Control" at top, no logo icon, no card wrapper -- clean white background.

### Changes

**1. Copy uploaded image to project**
- Copy `user-uploads://IMG_0620.PNG` to `src/assets/auth-bg.png`

**2. Rewrite `src/pages/AuthPage.tsx`**
- Remove the `AscensionLogo` import and `<img>` tag
- Remove the `Card` wrapper -- form sits directly on white background
- Outer container: `flex h-screen`
- Left div: `hidden lg:block lg:w-1/2` with the background image as `bg-cover bg-center`
- Right div: `w-full lg:w-1/2 flex items-center justify-center` containing the form
- Keep all existing step logic, animations, and form handlers unchanged
- Title "Position Control" remains as a heading above the form (no logo)

### Mobile behavior
On screens below `lg`, the left image panel is hidden and the form takes full width with a subtle gradient background.

