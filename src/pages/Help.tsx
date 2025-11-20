import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Help = () => {
  const navigate = useNavigate();

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
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn the basics of Edu-Scaffold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Create an Assignment</h3>
                <p className="text-muted-foreground">
                  Click "New Assignment" to scaffold a new project. Provide an ID (e.g., A1, HW01) and title.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Upload Test Results</h3>
                <p className="text-muted-foreground">
                  Run tests locally and upload your test_results.json file to track progress.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Package Submission</h3>
                <p className="text-muted-foreground">
                  When ready, package your assignment into a ZIP file for submission.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>What if my ZIP size is too large?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      The packager automatically excludes large files and unnecessary folders. Make sure your
                      data/ folder doesn't contain files larger than 5MB. Consider compressing or removing
                      them before packaging.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>My test_results.json failed to parse?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Ensure your test_results.json file is valid JSON with the following structure:
                    </p>
                    <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "timestamp": "2025-11-20T...",
  "returncode": 0,
  "passed": 5,
  "failed": 0,
  "total": 5,
  "stdout": "...",
  "stderr": ""
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Upload to LMS denied (401 error)?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      This usually means your API token is invalid or expired. Generate a new token from your
                      LMS settings and update it in your environment variables. Also verify that the LMS URL
                      and course ID are correct.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Assignment ID validation error?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Assignment IDs must start with uppercase letters followed by digits (e.g., A1, HW01,
                      LAB003). Special characters and lowercase letters are not allowed.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I add team members?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Navigate to the assignment detail page and click "Manage Team". You can add team members
                      by email and assign roles (student, instructor, TA). Team members will be able to view
                      and collaborate on the assignment.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Guide</CardTitle>
              <CardDescription>Recommended daily workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Create assignment scaffold with appropriate template</li>
                <li>Download the scaffolded files and work locally</li>
                <li>Run tests frequently: <code className="bg-muted px-1 rounded">pytest</code></li>
                <li>Upload test results to track progress</li>
                <li>Edit metadata if requirements change</li>
                <li>Package submission when ready (optionally include tests)</li>
                <li>Review package size and estimated upload time</li>
                <li>Upload to LMS or submit manually</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
