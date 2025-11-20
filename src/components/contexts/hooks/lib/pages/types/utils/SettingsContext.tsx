import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentLogs } from "@/utils/activityLogger";
import { FileDown, Upload, Edit, Send, FolderPlus } from "lucide-react";

const RecentActivity = () => {
  const logs = getRecentLogs(5);

  const getIcon = (action: string) => {
    switch (action) {
      case "scaffold":
        return <FolderPlus className="h-4 w-4" />;
      case "test_upload":
        return <Upload className="h-4 w-4" />;
      case "package":
        return <FileDown className="h-4 w-4" />;
      case "lms_upload":
        return <Send className="h-4 w-4" />;
      case "metadata_edit":
        return <Edit className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "scaffold":
        return "Created scaffold";
      case "test_upload":
        return "Uploaded test results";
      case "package":
        return "Packaged submission";
      case "lms_upload":
        return "Uploaded to LMS";
      case "metadata_edit":
        return "Edited metadata";
      default:
        return action;
    }
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across all assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 text-muted-foreground">{getIcon(log.action)}</div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{getActionText(log.action)}</p>
                <p className="text-muted-foreground text-xs">{log.details}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
