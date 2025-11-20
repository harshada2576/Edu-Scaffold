import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { validateAssignmentId, validateDueDate } from "@/utils/validation";
import { logActivity } from "@/utils/activityLogger";
import { getTemplate } from "@/utils/templates";

const CreateAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    due_date: "",
    python_version: "",
    template: "",
    dependencies: "",
    allowed_files: "src,tests,report,data,README.md",
  });

  useEffect(() => {
    const stored = localStorage.getItem("userSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      setFormData((prev) => ({
        ...prev,
        python_version: settings.pythonVersion || "3.11",
        template: settings.scaffoldTemplate || "basic-cli",
        dependencies: settings.defaultDependencies?.join("\n") || "pytest==7.4.0",
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAssignmentId(formData.id)) {
      toast({
        title: "Invalid Assignment ID",
        description: "ID must be uppercase letters followed by digits (e.g., A1, HW01)",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title) {
      toast({
        title: "Error",
        description: "Assignment title is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.due_date && !validateDueDate(formData.due_date)) {
      toast({
        title: "Invalid Due Date",
        description: "Due date must be in the future",
        variant: "destructive",
      });
      return;
    }

    const template = getTemplate(formData.template);

    const newAssignment = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      created_at: new Date().toISOString(),
      due_date: formData.due_date || null,
      status: "pending" as const,
      python_version: formData.python_version,
      dependencies: formData.dependencies.split("\n").filter((d) => d.trim()),
      allowed_files: formData.allowed_files.split(",").map((f) => f.trim()),
      template: formData.template as "basic-cli" | "web-backend" | "data-science",
    };

    const existing = localStorage.getItem("assignments");
    const assignments = existing ? JSON.parse(existing) : [];
    
    if (assignments.some((a: any) => a.id === formData.id)) {
      toast({
        title: "Error",
        description: "Assignment ID already exists",
        variant: "destructive",
      });
      return;
    }

    assignments.push(newAssignment);
    localStorage.setItem("assignments", JSON.stringify(assignments));

    logActivity(
      newAssignment.id,
      "scaffold",
      "current_user",
      `Created assignment: ${newAssignment.title}`
    );

    toast({
      title: "Success",
      description: "Assignment created successfully",
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>
              Set up a new assignment with metadata and structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Assignment ID *</Label>
                  <Input
                    id="id"
                    placeholder="e.g., A1, HW01"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Uppercase letters + digits only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={formData.template}
                    onValueChange={(value) => setFormData({ ...formData, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic-cli">Basic CLI</SelectItem>
                      <SelectItem value="web-backend">Web Backend</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Sorting Algorithms"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the assignment"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="python_version">Python Version</Label>
                  <Select
                    value={formData.python_version}
                    onValueChange={(value) => setFormData({ ...formData, python_version: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3.8">Python 3.8</SelectItem>
                      <SelectItem value="3.9">Python 3.9</SelectItem>
                      <SelectItem value="3.10">Python 3.10</SelectItem>
                      <SelectItem value="3.11">Python 3.11</SelectItem>
                      <SelectItem value="3.12">Python 3.12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependencies">Dependencies (one per line, package==version)</Label>
                <Textarea
                  id="dependencies"
                  placeholder="pytest==7.4.0&#10;numpy==1.26.0"
                  value={formData.dependencies}
                  onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_files">Allowed Files (comma-separated)</Label>
                <Input
                  id="allowed_files"
                  placeholder="src,tests,report,data,README.md"
                  value={formData.allowed_files}
                  onChange={(e) => setFormData({ ...formData, allowed_files: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Create Assignment
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAssignment;
