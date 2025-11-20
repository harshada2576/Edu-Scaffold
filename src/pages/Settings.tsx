import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    pythonVersion: "3.11",
    defaultDependencies: "pytest==7.4.0\nblack==24.0.0",
    scaffoldTemplate: "basic-cli",
    lmsType: "none",
    lmsUrl: "",
    lmsCourseId: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("userSettings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings({
        ...parsed,
        defaultDependencies: parsed.defaultDependencies?.join("\n") || "",
      });
    }
  }, []);

  const handleSave = () => {
    const toSave = {
      ...settings,
      defaultDependencies: settings.defaultDependencies.split("\n").filter((d) => d.trim()),
    };
    localStorage.setItem("userSettings", JSON.stringify(toSave));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Scaffold Settings</CardTitle>
              <CardDescription>Configure default values for new assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pythonVersion">Python Version</Label>
                <Select
                  value={settings.pythonVersion}
                  onValueChange={(value) => setSettings({ ...settings, pythonVersion: value })}
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

              <div className="space-y-2">
                <Label htmlFor="template">Default Template</Label>
                <Select
                  value={settings.scaffoldTemplate}
                  onValueChange={(value) => setSettings({ ...settings, scaffoldTemplate: value })}
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

              <div className="space-y-2">
                <Label htmlFor="dependencies">Default Dependencies (one per line)</Label>
                <Textarea
                  id="dependencies"
                  value={settings.defaultDependencies}
                  onChange={(e) => setSettings({ ...settings, defaultDependencies: e.target.value })}
                  placeholder="pytest==7.4.0&#10;black==24.0.0"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LMS Integration</CardTitle>
              <CardDescription>Configure Learning Management System connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lmsType">LMS Type</Label>
                <Select
                  value={settings.lmsType}
                  onValueChange={(value) => setSettings({ ...settings, lmsType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="canvas">Canvas</SelectItem>
                    <SelectItem value="moodle">Moodle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.lmsType !== "none" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lmsUrl">LMS URL</Label>
                    <Input
                      id="lmsUrl"
                      placeholder="https://canvas.example.edu"
                      value={settings.lmsUrl}
                      onChange={(e) => setSettings({ ...settings, lmsUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lmsCourseId">Default Course ID</Label>
                    <Input
                      id="lmsCourseId"
                      placeholder="12345"
                      value={settings.lmsCourseId}
                      onChange={(e) => setSettings({ ...settings, lmsCourseId: e.target.value })}
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="font-semibold mb-2">API Token Setup:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Log in to your {settings.lmsType === "canvas" ? "Canvas" : "Moodle"} account</li>
                      <li>Go to Account → Settings → Approved Integrations</li>
                      <li>Generate a new access token</li>
                      <li>Store it securely as environment variable: {settings.lmsType.toUpperCase()}_TOKEN</li>
                    </ol>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
