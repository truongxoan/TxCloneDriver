export interface AdminAuditEntry {
  game: string;
  outcome: string;
  time: string;
}

export const ADMIN_AUDIT_KEY = "txclonedriver_admin_audit";
const MAX_AUDIT_ENTRIES = 200;

/**
 * Audit fix #8: every admin-forced game outcome leaves a trace.
 * The panel itself stays admin-gated in each game component (isAdmin);
 * this only records the selection, in localStorage and on the console,
 * so a rigged round can be reviewed afterwards. It never changes the
 * outcome, the bets, or the game logic.
 */
export function logAdminRiggedOutcome(game: string, outcome: string): void {
  const entry: AdminAuditEntry = {
    game,
    outcome,
    time: new Date().toISOString(),
  };
  try {
    // eslint-disable-next-line no-console
    console.warn("[admin-audit] rigged outcome selected", entry);
  } catch {
    // console may be unavailable; the localStorage record is the audit trail
  }
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_KEY);
    const parsed: AdminAuditEntry[] = raw ? JSON.parse(raw) : [];
    const updated = Array.isArray(parsed) ? [entry, ...parsed] : [entry];
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(updated.slice(0, MAX_AUDIT_ENTRIES)));
  } catch {
    // localStorage may fail in private mode; the console entry still stands
  }
}
