export type UserRole = "admin" | "user";
export type UserStatus = "approved" | "pending" | "rejected";

export type AppModuleId =
  | "overview"
  | "storage"
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
  | "memories";

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
}

export interface ManagedUser {
  id: string;
  username: string;
  password?: string;
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

