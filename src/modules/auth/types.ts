export type UserRole = "admin" | "user";

export interface AuthUser {
  username: string;
  role: UserRole;
  name: string;
  avatarInitials: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}
