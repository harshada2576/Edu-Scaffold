export interface Assignment {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  due_date: string | null;
  status: "pending" | "passed" | "failed";
  python_version: string;
  dependencies: string[];
  allowed_files: string[];
  template: "basic-cli" | "web-backend" | "data-science";
  test_results?: TestResults;
  team_members?: TeamMember[];
}

export interface TestResults {
  timestamp: string;
  returncode: number;
  passed: number;
  failed: number;
  total: number;
  stdout: string;
  stderr: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "ta";
}

export interface ActivityLog {
  id: string;
  assignment_id: string;
  action: "scaffold" | "test_upload" | "package" | "lms_upload" | "metadata_edit";
  timestamp: string;
  user: string;
  details: string;
}
