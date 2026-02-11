

# Move Search Icon to a Blue Button on the Right Side

## What's changing

Redesign the `SearchField` component so the search icon sits inside a filled primary (blue) circular button on the **right end** of the input, matching the style shown in the reference image (similar to the Data Refresh button). The clear (X) button will sit between the input text and the search button when there's a value.

## Layout

```text
Current:  [🔍 icon]  [input text ............]  [X clear]
New:      [input text ............]  [X clear]  [🔍 button]
```

## Changes

### `src/components/ui/search-field.tsx`

- **Remove** the absolute-positioned search icon from the left side
- **Update input padding**: Change from `pl-10 pr-10` to `pl-4 pr-20` (or `pr-24` when clear is visible) to make room on the right for both buttons
- **Add a circular blue search button** on the right end using `bg-primary text-primary-foreground rounded-full` styling (matching the "ascension" button variant look from the reference image -- 40x40px circle with a 24px icon)
- **Reposition the clear (X) button** to sit just left of the search button (right side, offset to leave room for the search button)
- **Order**: input text, then clear button (conditional), then search icon button (always visible)

### No other files change

The `SearchField` is used across Employees, Contractors, and Requisitions tabs in the Positions module. All will get this update automatically.

## Technical Details

The search button will be purely decorative/visual (no submit action needed since search is live/debounced). The button gets the same `h-10 w-10 rounded-full bg-primary text-primary-foreground` styling as the icon buttons in the app. The clear button shifts left to accommodate the search button on the far right.

```text
Container (relative, flex):
  <input class="... pl-4 pr-[5.5rem] ..." />
  {hasValue && <X button at right-14 />}
  <Search button at right-1, bg-primary rounded-full h-10 w-10 />
```

