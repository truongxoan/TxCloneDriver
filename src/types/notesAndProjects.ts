export type NoteCategory =
  | "text"
  | "website"
  | "drive"
  | "github"
  | "terminal"
  | "prompt"
  | "doc"
  | "windows"
  | "triennguyen"
  | "cheatsheet"
  | "tips";

export interface NoteItem {
  id: string;
  title: string;
  category: NoteCategory;
  content?: string;
  url?: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
  stars?: number;
  forks?: number;
  language?: string;
  codeSnippet?: string;
  shortcut?: string;
  author?: string;
  targetAudience?: string;
  badgeLabel?: string;
}

export type ProjectStatus =
  | "idea"
  | "not_started"
  | "in_progress"
  | "almost_done"
  | "completed";

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progressPercent: number;
  priority: "high" | "medium" | "low";
  dueDate: string;
  updatedAt: string;
  githubUrl?: string;
  branch?: string;
  tasks: ProjectTask[];
}
