import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Download, Trash2, CheckCircle2, XCircle, Upload, Edit, Users, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Assignment, TestResults } from "@/types/assignment";
import { downloadPackage, packageAssignment } from "@/utils/packaging";
import { logActivity, getActivityLogs } from "@/utils/activityLogger";
import { formatFileSize, estimateUploadTime } from "@/utils/validation";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [includeTests, setIncludeTests] = useState(false);
  const [packageSize, setPackageSize] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    due_date: "",
    dependencies: "",
    allowed_files: "",
  });

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = () => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      const assignments = JSON.parse(stored);
      const found = assignments.find((a: Assignment) => a.id === id);
      if (found) {
        setAssignment(found);
        setEditForm({
          title: found.title,
          description: found.description || "",
          due_date: found.due_date || "",
          dependencies: found.dependencies?.join("\n") || "",
          allowed_files: found.allowed_files?.join(",") || "",
        });
      } else {
        navigate("/");
      }
    }
  };

  const updateAssignment = (updates: Partial<Assignment>) => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      const assignments = JSON.parse(stored);
      const index = assignments.findIndex((a: Assignment) => a.id === id);
      if (index !== -1) {
        assignments[index] = { ...assignments[index], ...updates };
        localStorage.setItem("assignments", JSON.stringify(assignments));
        setAssignment(assignments[index]);
      }
    }
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    
    setTimeout(() => {
      const passed = Math.random() > 0.3;
      const testResults: TestResults = {
        timestamp: new Date().toISOString(),
        returncode: passed ? 0 : 1,
        passed: passed ? 5 : 3,
        failed: passed ? 0 : 2,
        total: 5,
        stdout: passed 
          ? "===== 5 passed in 0.12s =====\n\ntest_main.py::test_basic_functionality PASSED\ntest_main.py::test_edge_cases PASSED\ntest_main.py::test_performance PASSED\ntest_main.py::test_error_handling PASSED\ntest_main.py::test_integration PASSED"
          : "===== 2 failed, 3 passed in 0.18s =====\n\ntest_main.py::test_basic_functionality PASSED\ntest_main.py::test_edge_cases FAILED\ntest_main.py::test_performance PASSED\ntest_main.py::test_error_handling FAILED\ntest_main.py::test_integration PASSED\n\nAssertionError: Expected output does not match actual output",
        stderr: passed ? "" : "FAILED test_main.py::test_edge_cases - AssertionError",
      };

      updateAssignment({
        status: passed ? "passed" : "failed",
        test_results: testResults,
      });

      logActivity(
        assignment!.id,
        "test_upload",
        "current_user",
        `Test run: ${passed ? "PASSED" : "FAILED"} (${testResults.passed}/${testResults.total})`
      );

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

  const handleTestFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const testResults: TestResults = JSON.parse(e.target?.result as string);
        
        if (!testResults.timestamp || typeof testResults.returncode !== "number") {
          throw new Error("Invalid test results format");
        }

        const status = testResults.returncode === 0 ? "passed" : "failed";
        updateAssignment({ status, test_results: testResults });

        logActivity(
          assignment!.id,
          "test_upload",
          "current_user",
          `Uploaded test results: ${testResults.passed}/${testResults.total} passed`
        );

        toast({
          title: "Test Results Uploaded",
          description: `${testResults.passed} tests passed, ${testResults.failed} failed`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Invalid test_results.json file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handlePackage = async () => {
    if (!assignment) return;

    try {
      const { size } = await packageAssignment(assignment, includeTests);
      setPackageSize(size);

      await downloadPackage(assignment, includeTests);

      logActivity(
        assignment.id,
        "package",
        "current_user",
        `Packaged submission: ${formatFileSize(size)} ${includeTests ? "(with tests)" : ""}`
      );

      toast({
        title: "Package Created",
        description: `${assignment.id}_submission.zip (${formatFileSize(size)}) - Est. upload: ${estimateUploadTime(size)}`,
      });
    } catch (error) {
      toast({
        title: "Packaging Failed",
        description: "Could not create submission package",
        variant: "destructive",
      });
    }
  };

  const handleSaveMetadata = () => {
    updateAssignment({
      title: editForm.title,
      description: editForm.description,
      due_date: editForm.due_date || null,
      dependencies: editForm.dependencies.split("\n").filter((d) => d.trim()),
      allowed_files: editForm.allowed_files.split(",").map((f) => f.trim()),
    });

    logActivity(
      assignment!.id,
      "metadata_edit",
      "current_user",
      "Updated assignment metadata"
    );

    setIsEditing(false);
    toast({
      title: "Metadata Updated",
      description: "Assignment information has been saved",
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

  const logs = getActivityLogs(assignment.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="text-2xl font-bold"
                      />
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                      {assignment.description && (
                        <CardDescription className="mt-2">{assignment.description}</CardDescription>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSaveMetadata}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Badge variant={assignment.status === "passed" ? "default" : assignment.status === "failed" ? "destructive" : "secondary"}>
                    {assignment.status === "passed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {assignment.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                    {assignment.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-medium">{assignment.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{new Date(assignment.created_at).toLocaleDateString()}</p>
                </div>
                {assignment.due_date && (
                  <div>
                    <span className="text-muted-foreground">Due:</span>
                    <p className="font-medium">{new Date(assignment.due_date).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Python:</span>
                  <p className="font-medium">{assignment.python_version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="package">Package</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>
                    {assignment.test_results 
                      ? `Last run: ${new Date(assignment.test_results.timestamp).toLocaleString()}`
                      : "No test results yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleRunTests} disabled={isRunningTests}>
                      <Play className="mr-2 h-4 w-4" />
                      {isRunningTests ? "Running Tests..." : "Simulate Test Run"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleTestFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload test_results.json
                    </Button>
                  </div>

                  {assignment.test_results && (
                    <>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">{assignment.test_results.passed} Passed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-destructive" />
                          <span className="font-semibold">{assignment.test_results.failed} Failed</span>
                        </div>
                        <div className="text-muted-foreground">
                          Total: {assignment.test_results.total}
                        </div>
                      </div>
                      <div>
                        <Label>Output</Label>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto mt-2 max-h-96">
                          {assignment.test_results.stdout}
                        </pre>
                      </div>
                      {assignment.test_results.stderr && (
                        <div>
                          <Label>Errors</Label>
                          <pre className="bg-destructive/10 p-4 rounded-lg text-sm overflow-x-auto mt-2">
                            {assignment.test_results.stderr}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="package" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Package Submission</CardTitle>
                  <CardDescription>Create a ZIP file ready for submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <Label htmlFor="include-tests">Include tests in package</Label>
                    <Switch
                      id="include-tests"
                      checked={includeTests}
                      onCheckedChange={setIncludeTests}
                    />
                  </div>

                  <Button onClick={handlePackage} className="w-full">
                    <Package className="mr-2 h-4 w-4" />
                    Create & Download Package
                  </Button>

                  {packageSize > 0 && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Package Size:</span>
                        <span className="font-semibold">{formatFileSize(packageSize)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. Upload Time (10 Mbps):</span>
                        <span className="font-semibold">{estimateUploadTime(packageSize)}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-1">Package includes:</p>
                    <ul className="list-disc list-inside">
                      <li>Assignment metadata (.assignment_meta.json)</li>
                      <li>Source code (src/)</li>
                      {includeTests && <li>Test files (tests/)</li>}
                      <li>Report folder (report/)</li>
                      <li>Data folder (data/)</li>
                      <li>README.md</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Metadata</CardTitle>
                  <CardDescription>Configuration and requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dependencies</Label>
                    <div className="flex flex-wrap gap-2">
                      {assignment.dependencies?.map((dep, idx) => (
                        <Badge key={idx} variant="secondary">{dep}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed Files</Label>
                    <div className="flex flex-wrap gap-2">
                      {assignment.allowed_files?.map((file, idx) => (
                        <Badge key={idx} variant="outline">{file}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <p className="text-sm">{assignment.template || "basic-cli"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>History of actions for this assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity yet</p>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{log.details}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.timestamp).toLocaleString()} • {log.user}
                            </p>
                          </div>
                          <Badge variant="outline">{log.action}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete assignment "{assignment.title}" and all associated data.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete Permanently
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
