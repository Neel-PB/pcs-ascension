

## Remove Troubleshooting Tab from Support Module

### Changes — `src/pages/support/SupportPage.tsx`

1. **Remove tab entry** (line 39): Delete `{ id: "troubleshooting", label: "Troubleshooting" }` from the `tabs` array.

2. **Remove data** (lines 107-128): Delete the entire `troubleshootingTopics` array.

3. **Remove render block** (lines 194-208): Delete the `{activeTab === "troubleshooting" && ...}` conditional block.

4. **Remove unused import**: `AlertCircle` icon import (only used by troubleshooting section).

