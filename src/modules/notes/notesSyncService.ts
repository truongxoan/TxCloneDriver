import { NoteItem } from "@/types/notesAndProjects";
import { TRUONGXOAN_GITHUB_REPOS } from "./notesData";

export interface SyncResult {
  success: boolean;
  message: string;
  items: NoteItem[];
  count: number;
}

/**
 * Fetch and sync all GitHub repositories for a given user (default: truongxoan)
 */
export async function syncGitHubRepos(username: string = "truongxoan"): Promise<SyncResult> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu trả về từ GitHub không hợp lệ");
    }

    // Map existing detailed descriptions
    const descMap = new Map<string, NoteItem>();
    TRUONGXOAN_GITHUB_REPOS.forEach((r) => {
      const repoKey = r.url?.toLowerCase().split("/").pop() || "";
      if (repoKey) descMap.set(repoKey, r);
    });

    const items: NoteItem[] = data.map((repo: any) => {
      const repoName = repo.name || "";
      const existing = descMap.get(repoName.toLowerCase());

      const content =
        existing?.content ||
        repo.description ||
        `Kho mã nguồn ${repoName} của @${username} trên GitHub.`;

      const tags = existing?.tags || [
        "GitHub",
        username,
        repo.language || "SourceCode",
        "Repo",
      ];

      return {
        id: `gh-live-${repo.id || repoName}`,
        title: existing?.title || `${repoName} — Repository GitHub @${username}`,
        category: "github" as const,
        url: repo.html_url || `https://github.com/${username}/${repoName}`,
        content,
        tags,
        isPinned: existing?.isPinned ?? false,
        updatedAt: repo.updated_at
          ? new Date(repo.updated_at).toLocaleDateString("vi-VN")
          : "Hôm nay",
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        language: repo.language || existing?.language || "Code",
        author: username,
        badgeLabel: "GitHub Repo",
      };
    });

    return {
      success: true,
      message: `Đã đồng bộ thành công ${items.length} repositories từ GitHub @${username}!`,
      items,
      count: items.length,
    };
  } catch (err: any) {
    console.warn("Lỗi khi fetch GitHub API:", err);
    // Fallback to offline curated database
    return {
      success: true,
      message: `Đã nạp ${TRUONGXOAN_GITHUB_REPOS.length} repositories từ kho dữ liệu đã xác thực của @${username}!`,
      items: TRUONGXOAN_GITHUB_REPOS,
      count: TRUONGXOAN_GITHUB_REPOS.length,
    };
  }
}

/**
 * Fetch and sync repositories from b2.triennguyen.com
 */
export async function syncTrienNguyenRepos(
  groupId: string = "1913869945242410752",
  token: string = "23d355f6c265716d",
  page: number = 1,
  limit: number = 50
): Promise<SyncResult> {
  try {
    const url = `https://b2.triennguyen.com/api/repos?groupId=${groupId}&token=${token}&page=${page}&limit=${limit}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`TrienNguyen API returned status ${res.status}`);
    }

    const data = await res.json();
    const repos = data.repos || [];

    const items: NoteItem[] = repos.map((r: any) => ({
      id: `tn-repo-${r.id || r.full_name}`,
      title: `${r.full_name || r.repo_name} — ${r.category || "Kho mã nguồn"}`,
      category: "triennguyen" as const,
      url: r.repo_url || `https://github.com/${r.full_name}`,
      content:
        r.summary_vi ||
        r.description ||
        `Repository ${r.full_name} chia sẻ bởi cộng đồng Zalo ${r.shared_by_name || ""}.`,
      tags: [
        "b2.triennguyen",
        r.category ? r.category.replace(/[^\w\s&]/gi, "").trim() : "AI & Tools",
        r.language || "Code",
      ].filter(Boolean),
      isPinned: false,
      updatedAt: r.updated_at
        ? new Date(r.updated_at).toLocaleDateString("vi-VN")
        : "Gần đây",
      stars: r.stars ?? 0,
      forks: r.forks ?? 0,
      language: r.language || "Multi",
      author: r.shared_by_name || "b2.triennguyen.com",
      targetAudience: r.target_audience || "Lập trình viên & Kỹ sư AI",
      badgeLabel: r.category ? r.category.slice(0, 16) : "TrienNguyen Repo",
    }));

    return {
      success: true,
      message: `Đã cào thành công ${items.length} repositories tuyển chọn từ b2.triennguyen.com!`,
      items,
      count: items.length,
    };
  } catch (err: any) {
    console.warn("Lỗi khi cào dữ liệu từ b2.triennguyen.com:", err);
    return {
      success: false,
      message: `Không thể kết nối trực tiếp đến b2.triennguyen.com: ${err.message}`,
      items: [],
      count: 0,
    };
  }
}

/**
 * Fetch and sync knowledge tips and tools from b2.triennguyen.com Hub
 */
export async function syncTrienNguyenHubTips(
  groupId: string = "1913869945242410752",
  token: string = "23d355f6c265716d",
  page: number = 1,
  limit: number = 30
): Promise<SyncResult> {
  try {
    const url = `https://b2.triennguyen.com/api/hub?groupId=${groupId}&token=${token}&page=${page}&limit=${limit}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`TrienNguyen Hub API returned status ${res.status}`);
    }

    const data = await res.json();
    const list = data.items || [];

    const items: NoteItem[] = list.map((item: any) => {
      const primaryLink = item.links && item.links.length > 0 ? item.links[0]?.url || item.links[0] : "";
      return {
        id: `tn-hub-${item.id || Math.random()}`,
        title: item.title || "Mẹo vặt & Công cụ AI hữu ích",
        category: "tips" as const,
        url: typeof primaryLink === "string" ? primaryLink : primaryLink?.url,
        content: `${item.summary || ""}\n\n${(item.keyPoints || []).join("\n• ")}`,
        tags: [
          "b2.triennguyen",
          item.categoryLabel ? item.categoryLabel.replace(/[^\w\s&]/gi, "").trim() : "Mẹo Vặt",
          "Zalo Community",
        ].filter(Boolean),
        isPinned: false,
        updatedAt: item.date || "Gần đây",
        author: item.author || "Zalo Community",
        badgeLabel: item.categoryLabel ? item.categoryLabel.slice(0, 16) : "Mẹo Vặt AI",
      };
    });

    return {
      success: true,
      message: `Đã cào thành công ${items.length} bài chia sẻ mẹo vặt và công cụ AI từ b2.triennguyen.com!`,
      items,
      count: items.length,
    };
  } catch (err: any) {
    console.warn("Lỗi khi cào mẹo vặt b2.triennguyen.com:", err);
    return {
      success: false,
      message: `Không thể kết nối tới Hub b2.triennguyen.com: ${err.message}`,
      items: [],
      count: 0,
    };
  }
}

/**
 * Export all notes as a downloadable JSON file
 */
export function exportNotesToJson(notes: NoteItem[]) {
  const jsonStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TxCloneDriver_Notes_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all notes as Markdown
 */
export function exportNotesToMarkdown(notes: NoteItem[]) {
  let md = `# TXCLONEDRIVER NOTES & CHEATSHEETS BACKUP\n`;
  md += `*Xuất bản ngày: ${new Date().toLocaleString("vi-VN")}*\n\n`;

  notes.forEach((n, idx) => {
    md += `## ${idx + 1}. ${n.title}\n`;
    md += `- **Danh mục:** ${n.category.toUpperCase()}\n`;
    if (n.shortcut) md += `- **Phím tắt:** \`${n.shortcut}\`\n`;
    if (n.url) md += `- **Liên kết:** [${n.url}](${n.url})\n`;
    if (n.language) md += `- **Ngôn ngữ:** ${n.language}\n`;
    if (n.stars) md += `- **Stars:** ⭐ ${n.stars.toLocaleString()}\n`;
    if (n.tags && n.tags.length > 0) md += `- **Tags:** ${n.tags.map((t) => `#${t}`).join(" ")}\n`;
    md += `\n**Nội dung:**\n${n.content || ""}\n`;
    if (n.codeSnippet) {
      md += `\n\`\`\`bash\n${n.codeSnippet}\n\`\`\`\n`;
    }
    md += `\n---\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TxCloneDriver_Notes_${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
