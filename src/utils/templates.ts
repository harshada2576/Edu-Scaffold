export interface Template {
  id: string;
  name: string;
  description: string;
  defaultDependencies: string[];
  structure: string[];
}

export const templates: Record<string, Template> = {
  "basic-cli": {
    id: "basic-cli",
    name: "Basic CLI",
    description: "Simple command-line Python application",
    defaultDependencies: ["pytest==7.4.0"],
    structure: ["src/main.py", "tests/test_main.py", "README.md"],
  },
  "web-backend": {
    id: "web-backend",
    name: "Web Backend",
    description: "Flask/FastAPI web application",
    defaultDependencies: ["flask==3.0.0", "pytest==7.4.0"],
    structure: ["src/app.py", "src/routes/", "tests/", "requirements.txt"],
  },
  "data-science": {
    id: "data-science",
    name: "Data Science",
    description: "Jupyter notebooks and data analysis",
    defaultDependencies: ["numpy==1.26.0", "pandas==2.1.0", "jupyter==1.0.0"],
    structure: ["notebooks/", "data/", "src/analysis.py", "tests/"],
  },
};

export const getTemplate = (templateId: string): Template => {
  return templates[templateId] || templates["basic-cli"];
};
