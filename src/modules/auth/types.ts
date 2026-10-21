export type UserRole = "admin" | "user";
export type UserStatus = "approved" | "pending" | "rejected";

export type AppModuleId =
  | "overview"
  | "storage"
  | "image_studio"
  | "notes"
  | "projects"
  | "events"
  | "weather"
  | "settings"
  | "telegram"
  | "watch_together"
  | "vault"
  | "games"
  | "study"
  | "driver_license"
  | "expenses"
  | "qr"
  | "downloader"
  | "memories"
  | "google_flow";

export interface LockedDevice {
  machineId: string;
  failedCount: number;
  lastAttemptAt: string;
  isLocked: boolean;
  lockedAt?: string;
  ip?: string;
  userAgent?: string;
  attemptedUsernames?: string[];
}

export interface AuthUser {
  id?: string;
  username: string;
  role: UserRole;
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
  bio?: string;
  coins?: number;
  status: UserStatus;
  allowedModules: string[];
  pendingNameChange?: string;
  provider?: "local" | "google";
  googleEmail?: string;
  updatedAt?: number;
  isStealthMode?: boolean;
}

export interface ManagedUser {
  id: string;
  username: string;
  password?: string;
  plainPassword?: string;
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
  bio?: string;
  coins?: number;
  role: UserRole;
  status: UserStatus;
  allowedModules: string[];
  createdAt: string;
  pendingNameChange?: string;
  provider?: "local" | "google";
  googleEmail?: string;
  updatedAt?: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  details?: string;
  ip: string;
  status: "success" | "blocked" | "warning";
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  managedUsers: ManagedUser[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleProfile: { email: string; name: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserPermissions: (userId: string, allowedModules: string[], status: UserStatus) => void;
  approveUser: (userId: string, allowedModules: string[]) => void;
  rejectUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  hasModuleAccess: (moduleKey: AppModuleId) => boolean;
  updateProfile: (newName: string, avatarUrl?: string, bio?: string) => { success: boolean; message: string; requiresApproval?: boolean };
  approveNameChange: (userId: string) => void;
  rejectNameChange: (userId: string) => void;
  adjustUserCoins: (userId: string, deltaCoins: number) => void;
  // Device Lockout Tracking across system
  lockedDevices: LockedDevice[];
  recordDeviceAttempt: (machineId: string, username: string, isFailed: boolean) => { isLocked: boolean; failedCount: number };
  unlockDevice: (machineId: string) => void;
  clearAllDeviceLocks: () => void;
  // Admin Superpowers
  originalAdminUser: AuthUser | null;
  impersonateUser: (userId: string) => void;
  stopImpersonating: () => void;
  isMaintenanceMode: boolean;
  toggleMaintenanceMode: (enabled?: boolean) => void;
  securityAuditLogs: AuditLogItem[];
  logSecurityAudit: (action: string, details?: string, status?: "success" | "blocked" | "warning") => void;
  clearSecurityLogs: () => void;
}

