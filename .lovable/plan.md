

## Fix: Forecast Table Content Being Clipped

### Problem
The Forecast Balance Table's rightmost "Status" column is being clipped because the `Card` wrapper uses `overflow-hidden`, and the grid template columns may exceed the available card width. The table needs horizontal scrolling support to show all columns fully.

### Solution

**File: `src/components/forecast/ForecastBalanceTable.tsx`**

Change the Card from `overflow-hidden` to allow the inner scrollable div to handle overflow properly:

1. On the inner `div` (line 41), change from `max-h-[600px] overflow-y-auto` to `max-h-[600px] overflow-auto` so it can scroll both horizontally and vertically when needed.

2. Ensure the grid rows have `min-width: max-content` so they don't get compressed and clip content. Wrap the header and body in a `div` with `style={{ minWidth: 'max-content' }}` to guarantee the grid never compresses below its natural width.

This allows the full Status column (and any other content) to be visible via horizontal scroll when the viewport is narrower than the total grid width, while keeping vertical scrolling for many rows.

