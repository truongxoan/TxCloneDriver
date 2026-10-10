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
  | "vault";

export interface AuthUser {
  id?: string;
  username: string;
  role: UserRole;
  name: string;
  avatarInitials: string;
  status: UserStatus;
  allowedModules: string[];
}

export interface ManagedUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  allowedModules: string[];
  createdAt: string;
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
}
