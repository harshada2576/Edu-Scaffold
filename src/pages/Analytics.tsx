import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, CheckCircle2, XCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Assignment } from "@/types/assignment";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { getActivityLogs } from "@/utils/activityLogger";

const Analytics = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    avgPackageSize: 0,
    totalActions: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      const data: Assignment[] = JSON.parse(stored);
      setAssignments(data);

      const logs = getActivityLogs();
      setStats({
        total: data.length,
        passed: data.filter((a) => a.status === "passed").length,
        failed: data.filter((a) => a.status === "failed").length,
        pending: data.filter((a) => a.status === "pending").length,
        avgPackageSize: 250, // Simulated
        totalActions: logs.length,
      });
    }
  }, []);

  const generateReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Assignment Status Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.setFontSize(14);
    doc.text("Summary Statistics", 20, 45);
    
    doc.setFontSize(11);
    doc.text(`Total Assignments: ${stats.total}`, 20, 55);
    doc.text(`Tests Passed: ${stats.passed}`, 20, 62);
    doc.text(`Tests Failed: ${stats.failed}`, 20, 69);
    doc.text(`Pending: ${stats.pending}`, 20, 76);
    doc.text(`Total Actions: ${stats.totalActions}`, 20, 83);
    
    doc.setFontSize(14);
    doc.text("Assignment Details", 20, 100);
    
    let yPos = 110;
    doc.setFontSize(10);
    
    assignments.slice(0, 15).forEach((assignment, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${assignment.id} - ${assignment.title}`, 20, yPos);
      doc.text(`Status: ${assignment.status.toUpperCase()}`, 40, yPos + 5);
      doc.text(`Created: ${new Date(assignment.created_at).toLocaleDateString()}`, 40, yPos + 10);
      
      yPos += 20;
    });
    
    doc.save("assignment-report.pdf");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={generateReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActions}</div>
                <p className="text-xs text-muted-foreground">All-time activities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.passed} of {stats.total} assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Package Size</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgPackageSize} KB</div>
                <p className="text-xs text-muted-foreground">Submission size</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Status Overview</CardTitle>
              <CardDescription>Distribution of assignment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-600" />
                    <span>Passed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.passed}</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{
                          width: `${stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-destructive" />
                    <span>Failed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.failed}</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive"
                        style={{
                          width: `${stats.total > 0 ? (stats.failed / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.pending}</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground"
                        style={{
                          width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
