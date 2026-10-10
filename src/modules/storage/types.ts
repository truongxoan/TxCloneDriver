export type FileCategory = "document" | "image" | "backup" | "archive" | "folder";

export interface StorageItem {
  id: string;
  name: string;
  category: FileCategory;
  sizeBytes: number;
  mimeType: string;
  updatedAt: string;
  starred: boolean;
  driveSyncStatus: "not_synced" | "demo_only";
  owner: string;
}

export interface StorageQuota {
  totalBytes: number;
  usedBytes: number;
  breakdown: {
    documentsBytes: number;
    imagesBytes: number;
    backupsBytes: number;
    othersBytes: number;
  };
}
