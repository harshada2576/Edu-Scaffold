export const validateAssignmentId = (id: string): boolean => {
  // Must be uppercase letters followed by digits (e.g., A1, HW01, LAB003)
  return /^[A-Z]+\d+$/.test(id);
};

export const validateDueDate = (date: string): boolean => {
  if (!date) return true; // Optional field
  const dueDate = new Date(date);
  const now = new Date();
  return dueDate > now;
};

export const validateDependency = (dep: string): boolean => {
  // Must follow package==version format
  return /^[a-zA-Z0-9_-]+==\d+(\.\d+)*(\.\d+)?$/.test(dep);
};

export const validateDependencies = (deps: string[]): boolean => {
  return deps.every(validateDependency);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export const estimateUploadTime = (bytes: number, mbps: number = 10): string => {
  // Default to 10 Mbps connection
  const seconds = (bytes * 8) / (mbps * 1000000);
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  return `${Math.ceil(seconds / 60)}m`;
};
