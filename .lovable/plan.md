

## Add a "User Guides" Tab to the Support Page

### Overview
Add a new "User Guides" tab to the existing Support page (`/support`) that lists all available interactive tours organized by module. Each guide card shows a title, description, step count, and a "Start Tour" button that navigates to the relevant page and launches the tour automatically.

### Design
The Support page already has tabs (FAQs, Training Videos, Troubleshooting, Report Issue). A fifth tab called **User Guides** will be added as the first tab, making it the default landing tab for users looking for help.

Each guide will be displayed as a card with:
- Module icon (matching the sidebar icons)
- Tour name and description
- Number of steps
- "Start Tour" button that navigates to the target page and triggers the tour via `useTourStore.startTour()`
- A "Reset" link to clear the localStorage completion flag so users can re-take tours they've already completed
- A checkmark badge if the tour has already been completed (read from localStorage)

### Guide Catalog

| Module | Tour Key | Target Route | Steps |
|--------|----------|-------------|-------|
| Staffing Summary | `staffing` | `/staffing` | 8 |
| Position Planning | `staffing-planning` | `/staffing` (Planning tab) | 6 |
| Variance Analysis | `staffing-variance` | `/staffing` (Variance tab) | 5 |
| Forecast | `staffing-forecast` | `/staffing` (Forecast tab) | 3 |
| Volume Settings | `staffing-volume-settings` | `/staffing` (Settings tab) | 3 |
| NP Settings | `staffing-np-settings` | `/staffing` (Settings tab) | 3 |
| Positions (Employees) | `positions-employees` | `/positions` | Tour steps count |
| Positions (Contractors) | `positions-contractors` | `/positions` | Tour steps count |
| Positions (Requisitions) | `positions-requisitions` | `/positions` | Tour steps count |
| Admin Users | `admin-users` | `/admin` | 6 |
| Admin Feed | `admin-feed` | `/admin` | 3 |
| Admin RBAC | `admin-rbac` | `/admin` | 4 |
| Admin Audit Log | `admin-audit` | `/admin` | 3 |
| Admin Settings | `admin-settings` | `/admin` | 3 |
| Feedback Page | `feedback-page` | `/feedback` | 5 |
| Positions Checklist (Overlay) | `checklist` | Current page | 4 |
| AI Hub (Overlay) | `ai-hub` | Current page | 4 |
| Feedback Panel (Overlay) | `feedback` | Current page | 3 |

### Technical Changes

#### 1. `src/pages/support/SupportPage.tsx`
- Add "User Guides" as a new tab (first position in the tabs array)
- Import and render a new `UserGuidesTab` component when active
- Change default `activeTab` from `"faqs"` to `"guides"`

#### 2. `src/components/support/UserGuidesTab.tsx` (new file)
- Define the guide catalog as a static array with: `tourKey`, `title`, `description`, `icon`, `route`, `stepCount`, `category` (Staffing / Positions / Admin / Feedback / Overlays)
- Group guides by category with section headers
- Each card:
  - Shows completion status via `localStorage.getItem('helix-tour-{tourKey}-completed')`
  - "Start Tour" button calls `navigate(route)` then `startTour(tourKey)`
  - "Reset" button removes the localStorage key
- Uses the same card styling as the Support page (bg-shell-elevated, rounded-xl, shadow-soft)

#### 3. `src/components/shell/AppHeader.tsx`
- Update the "Take a Tour" dropdown item to also include a secondary option: "View All Guides" that navigates to `/support` with the guides tab active
- Or simply keep the existing behavior as-is (tours for current page) since users can access the full catalog from Support

### Why the Support Page
- The Support page is the natural home for help content (FAQs, videos, troubleshooting)
- No new routes or pages needed -- just a new tab
- Users already know to go to Support for help
- The "Take a Tour" option in the header dropdown continues to work for quick access to the current page's tour
