import { ActivityLog } from "@/types/assignment";

export const logActivity = (
  assignment_id: string,
  action: ActivityLog["action"],
  user: string,
  details: string
) => {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem("activityLogs") || "[]");
  
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    assignment_id,
    action,
    timestamp: new Date().toISOString(),
    user,
    details,
  };

  logs.unshift(newLog);
  
  // Keep only last 100 logs
  if (logs.length > 100) {
    logs.splice(100);
  }

  localStorage.setItem("activityLogs", JSON.stringify(logs));
};

export const getActivityLogs = (assignment_id?: string): ActivityLog[] => {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem("activityLogs") || "[]");
  
  if (assignment_id) {
    return logs.filter((log) => log.assignment_id === assignment_id);
  }
  
  return logs;
};

export const getRecentLogs = (limit: number = 10): ActivityLog[] => {
  const logs = getActivityLogs();
  return logs.slice(0, limit);
};
