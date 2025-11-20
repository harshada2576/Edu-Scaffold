import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Assignment } from "@/types/assignment";

export const packageAssignment = async (
  assignment: Assignment,
  includeTests: boolean = false
): Promise<{ blob: Blob; size: number }> => {
  const zip = new JSZip();

  // Add assignment metadata
  zip.file(
    ".assignment_meta.json",
    JSON.stringify(
      {
        id: assignment.id,
        title: assignment.title,
        created_at: assignment.created_at,
        due_date: assignment.due_date,
        python_version: assignment.python_version,
        dependencies: assignment.dependencies,
        allowed_files: assignment.allowed_files,
      },
      null,
      2
    )
  );

  // Add README
  zip.file(
    "README.md",
    `# ${assignment.title}\n\n**Assignment ID:** ${assignment.id}\n\n${assignment.description || ""}\n\n## Requirements\n\n- Python ${assignment.python_version}\n- Dependencies: ${assignment.dependencies.join(", ")}\n\n## Submission\n\nDue: ${assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "TBD"}\n`
  );

  // Add src folder
  const srcFolder = zip.folder("src");
  srcFolder?.file(
    "main.py",
    `"""${assignment.title}\n\nAssignment ID: ${assignment.id}\n"""\n\ndef main():\n    print("Hello from ${assignment.id}!")\n    # TODO: Implement your solution here\n    pass\n\nif __name__ == "__main__":\n    main()\n`
  );

  // Add tests if requested
  if (includeTests) {
    const testsFolder = zip.folder("tests");
    testsFolder?.file(
      "test_main.py",
      `import pytest\nfrom src.main import main\n\ndef test_main():\n    """Test main function executes without errors"""\n    try:\n        main()\n        assert True\n    except Exception as e:\n        pytest.fail(f"main() raised {type(e).__name__}: {e}")\n`
    );
  }

  // Add report folder
  zip.folder("report");

  // Add data folder
  zip.folder("data");

  // Generate the ZIP
  const blob = await zip.generateAsync({ type: "blob" });
  const size = blob.size;

  return { blob, size };
};

export const downloadPackage = async (
  assignment: Assignment,
  includeTests: boolean = false
) => {
  const { blob } = await packageAssignment(assignment, includeTests);
  saveAs(blob, `${assignment.id}_submission.zip`);
};
