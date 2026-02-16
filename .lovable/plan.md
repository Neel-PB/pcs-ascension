

## Convert User Guides to Tabbed Category Layout

### Overview
Replace the vertically scrolling category sections in the User Guides tab with inner sub-tabs (one per category: Staffing, Positions, Admin, Feedback, Overlays). This keeps everything visible without scrolling and lets users jump directly to the module they care about.

### Layout
The existing outer Support tabs remain unchanged. Inside the "User Guides" panel, the five category sections become underline-style inner tabs (using the existing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` components, which per the project's memory are reserved for internal content sections -- exactly this use case).

```
[User Guides] [FAQs] [Videos] [Troubleshooting] [Report Issue]   <-- outer toggle group (unchanged)

  Staffing | Positions | Admin | Feedback | Overlays              <-- NEW inner underline tabs
  ─────────────────────────────────────────────────────

  [Card] [Card] [Card]                                            <-- filtered grid for active category
  [Card] [Card] [Card]
```

### Technical Changes

#### `src/components/support/UserGuidesTab.tsx`
- Import `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`
- Replace the `categories.map()` scroll layout with a `<Tabs defaultValue="Staffing">` wrapper
- Render a `<TabsList>` with one `<TabsTrigger>` per category (full-width, flex-1 per tab memory standards for underline tabs)
- Render a `<TabsContent>` per category containing only that category's guide cards grid
- The card markup stays identical -- just moved into the appropriate `TabsContent`
- No other files need changes
