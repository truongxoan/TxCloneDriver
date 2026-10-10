import { DriveFileItem } from "./driveEndpointsContext";

export interface DuplicateGroup {
  groupKey: string;
  nameKey: string;
  primaryItem: DriveFileItem;
  duplicates: DriveFileItem[];
  wastedBytes: number;
}

export interface DuplicateScanResult {
  hasDuplicates: boolean;
  totalDuplicateCount: number;
  totalWastedBytes: number;
  groups: DuplicateGroup[];
  duplicateIds: Set<string>;
}

/**
 * Normalize filename to detect copies and duplicates:
 * e.g., "Song (1).mp3" -> "song"
 * e.g., "Track - Copy.mp3" -> "track"
 * e.g., "Track.mp3.mp3" -> "track"
 */
export function normalizeFileName(name: string): string {
  let clean = name.toLowerCase().trim();
  // Remove multiple repeated extensions (e.g. .mp3.mp3 -> .mp3)
  clean = clean.replace(/(\.mp3)+$/i, ".mp3");
  clean = clean.replace(/(\.mp4)+$/i, ".mp4");
  // Remove common copy tags: " (1)", " - copy", " (bản sao)", " copy"
  clean = clean.replace(/\s*\(\d+\)\s*(\.[a-z0-9]+)?$/i, "$1");
  clean = clean.replace(/\s*-\s*copy\s*(\.[a-z0-9]+)?$/i, "$1");
  clean = clean.replace(/\s*\(bản sao\)\s*(\.[a-z0-9]+)?$/i, "$1");
  clean = clean.replace(/\s*copy\s*(\.[a-z0-9]+)?$/i, "$1");
  // Remove file extension for base comparison
  clean = clean.replace(/\.[a-z0-9]+$/i, "");
  // Collapse whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  return clean;
}

/**
 * Scan a list of Drive items and detect duplicate groups
 */
export function detectDuplicates(items: DriveFileItem[]): DuplicateScanResult {
  const groupsMap = new Map<string, DriveFileItem[]>();

  for (const item of items) {
    const normName = normalizeFileName(item.name);
    // Key by normalized name and approximate size (within 5% or same byte size if > 0)
    // If sizeBytes is 0 (Google Apps Script empty size), just match normalized name
    const key = normName;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key)!.push(item);
  }

  const groups: DuplicateGroup[] = [];
  const duplicateIds = new Set<string>();
  let totalDuplicateCount = 0;
  let totalWastedBytes = 0;

  const entries = Array.from(groupsMap.entries());
  for (const [nameKey, groupItems] of entries) {
    if (groupItems.length > 1) {
      // Sort: choose primary item (earliest date or cleanest name without (1) or copy)
      groupItems.sort((a: DriveFileItem, b: DriveFileItem) => {
        const aHasCopy = /\(\d+\)|copy|bản sao/i.test(a.name);
        const bHasCopy = /\(\d+\)|copy|bản sao/i.test(b.name);
        if (aHasCopy && !bHasCopy) return 1;
        if (!aHasCopy && bHasCopy) return -1;
        return a.name.length - b.name.length;
      });

      const primary = groupItems[0];
      const dupes = groupItems.slice(1);

      let groupWasted = 0;
      for (const d of dupes) {
        duplicateIds.add(d.id);
        totalDuplicateCount++;
        groupWasted += d.sizeBytes || 0;
      }
      totalWastedBytes += groupWasted;

      groups.push({
        groupKey: `dup-${primary.id}`,
        nameKey,
        primaryItem: primary,
        duplicates: dupes,
        wastedBytes: groupWasted,
      });
    }
  }

  return {
    hasDuplicates: groups.length > 0,
    totalDuplicateCount,
    totalWastedBytes,
    groups,
    duplicateIds,
  };
}
