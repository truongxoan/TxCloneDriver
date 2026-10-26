import { ManagedUser } from "./types";

// Name-only preset members (PR: name-only login).
// Only these usernames, plus "admin", may enter the web. Members type any
// non-empty password; it is never checked, stored, or used to overwrite a
// stored password. Admin keeps strict password verification elsewhere.
// Admin may change a preset member's permissions later via the existing
// Settings permission matrix; that change is a record with a newer
// updatedAt and must win over these defaults (see the server merge rules).
export const PRESET_MEMBER_USERNAMES = [
  "11",
  "22",
  "33",
  "44",
  "55",
  "66",
  "77",
  "88",
  "99",
] as const;

export type PresetMemberUsername = (typeof PRESET_MEMBER_USERNAMES)[number];

export const PRESET_MEMBER_MODULES = ["storage", "watch_together"];

export const PRESET_MEMBERS: ManagedUser[] = PRESET_MEMBER_USERNAMES.map(
  (username) => ({
    id: `u-member-${username}`,
    username,
    // No password is stored for preset members: login accepts any
    // non-empty password for them, so there is nothing to check against.
    name: `Thành viên ${username}`,
    avatarInitials: username,
    coins: 50000,
    role: "user",
    status: "approved",
    allowedModules: [...PRESET_MEMBER_MODULES],
    createdAt: "10/10/2026",
    provider: "local",
    updatedAt: 0,
  })
);

export function isPresetMemberUsername(
  username: string
): username is PresetMemberUsername {
  return (PRESET_MEMBER_USERNAMES as readonly string[]).includes(
    username.trim().toLowerCase()
  );
}

export function isAllowedUsername(username: string): boolean {
  const u = username.trim().toLowerCase();
  return u === "admin" || isPresetMemberUsername(u);
}

export function presetMemberFor(username: string): ManagedUser | undefined {
  return PRESET_MEMBERS.find(
    (m) => m.username === username.trim().toLowerCase()
  );
}
