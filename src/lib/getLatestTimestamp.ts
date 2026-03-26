/**
 * Scans an array of rows and returns the newest valid timestamp string
 * from the given key, or null if none found.
 */
export function getLatestTimestamp(
  rows: any[] | undefined,
  key = "curated_data_load_ts"
): string | null {
  if (!rows || rows.length === 0) return null;

  let latest: number | null = null;
  let latestStr: string | null = null;

  for (const row of rows) {
    const val = row?.[key];
    if (!val) continue;
    const ts = new Date(val).getTime();
    if (isNaN(ts)) continue;
    if (latest === null || ts > latest) {
      latest = ts;
      latestStr = val;
    }
  }

  return latestStr;
}
