import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Download, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  due_date: string | null;
  status: "pending" | "passed" | "failed";
  test_results?: {
    timestamp: string;
    passed: number;
    failed: number;
    output: string;
  };
}

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      const assignments = JSON.parse(stored);
      const found = assignments.find((a: Assignment) => a.id === id);
      if (found) {
        setAssignment(found);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const handleRunTests = () => {
    setIsRunningTests(true);
    
    setTimeout(() => {
      const passed = Math.random() > 0.3;
      const testResults = {
        timestamp: new Date().toISOString(),
        passed: passed ? 5 : 3,
        failed: passed ? 0 : 2,
        output: passed 
          ? "All tests passed successfully! ✓\n\ntest_main.py::test_basic_functionality PASSED\ntest_main.py::test_edge_cases PASSED\ntest_main.py::test_performance PASSED\ntest_main.py::test_error_handling PASSED\ntest_main.py::test_integration PASSED"
          : "Some tests failed ✗\n\ntest_main.py::test_basic_functionality PASSED\ntest_main.py::test_edge_cases FAILED\ntest_main.py::test_performance PASSED\ntest_main.py::test_error_handling FAILED\ntest_main.py::test_integration PASSED\n\nAssertionError: Expected output does not match actual output",
      };

      const updated = {
        ...assignment!,
        status: passed ? "passed" : "failed",
        test_results: testResults,
      } as Assignment;

      const stored = localStorage.getItem("assignments");
      if (stored) {
        const assignments = JSON.parse(stored);
        const index = assignments.findIndex((a: Assignment) => a.id === id);
        assignments[index] = updated;
        localStorage.setItem("assignments", JSON.stringify(assignments));
        setAssignment(updated);
      }

      setIsRunningTests(false);
      toast({
        title: passed ? "Tests Passed" : "Tests Failed",
        description: passed 
          ? "All tests completed successfully" 
          : "Some tests failed. Check the output for details.",
        variant: passed ? "default" : "destructive",
      });
    }, 2000);
  };

  const handlePackage = () => {
    toast({
      title: "Package Created",
      description: `${assignment?.id}_submission.zip ready for download`,
    });
  };

  const handleDelete = () => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      const assignments = JSON.parse(stored);
      const filtered = assignments.filter((a: Assignment) => a.id !== id);
      localStorage.setItem("assignments", JSON.stringify(filtered));
      toast({
        title: "Assignment Deleted",
        description: "Assignment has been removed",
      });
      navigate("/");
    }
  };

  if (!assignment) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="mt-2">ID: {assignment.id}</CardDescription>
                </div>
                <Badge variant={assignment.status === "passed" ? "default" : assignment.status === "failed" ? "destructive" : "secondary"}>
                  {assignment.status === "passed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {assignment.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                  {assignment.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{assignment.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{new Date(assignment.created_at).toLocaleString()}</p>
                </div>
                {assignment.due_date && (
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{new Date(assignment.due_date).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {assignment.test_results && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Last run: {new Date(assignment.test_results.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">{assignment.test_results.passed} Passed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">{assignment.test_results.failed} Failed</span>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {assignment.test_results.output}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage your assignment</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={handleRunTests} disabled={isRunningTests}>
                <Play className="mr-2 h-4 w-4" />
                {isRunningTests ? "Running Tests..." : "Run Tests"}
              </Button>
              <Button variant="outline" onClick={handlePackage}>
                <Download className="mr-2 h-4 w-4" />
                Package Submission
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
