import "server-only";

import type { GeneratedProject } from "@/schemas/generation";
import { PHASE_4_GENERATION_SYSTEM_PROMPT } from "@/prompts/generation";

export type AiGenerationInput = {
  mode: "generate" | "iterate";
  prompt: string;
  projectId?: string;
  selectedContext?: string;
};

export type AiProvider = {
  generateProject(input: AiGenerationInput): Promise<GeneratedProject>;
  iterateProject(input: AiGenerationInput): Promise<GeneratedProject>;
};

function buildMockProject(input: AiGenerationInput): GeneratedProject {
  const projectName =
    input.mode === "iterate" ? "Iterated Internship Workspace" : "Generated Internship Workspace";
  const selectedContext = input.selectedContext
    ? ` Selection context: ${input.selectedContext}.`
    : "";

  return {
    files: [
      {
        content: `export default function HomePage() {
  return (
    <main>
      <p>Prototype boundary</p>
      <h1>${projectName}</h1>
      <p>${input.prompt}${selectedContext}</p>
      <a href="/opportunities">Browse opportunities</a>
    </main>
  );
}
`,
        path: "app/page.tsx"
      },
      {
        content: `const opportunities = ["Design internship", "Frontend internship", "Research assistant"];

export default function OpportunitiesPage() {
  return (
    <main>
      <h1>Opportunities</h1>
      {opportunities.map((item) => (
        <article key={item}>{item}</article>
      ))}
    </main>
  );
}
`,
        path: "app/opportunities/page.tsx"
      },
      {
        content: `# ${projectName}

This project is a prototype export. Buttons, forms, auth, payment, and data sync are simulated.
`,
        path: "README.md"
      }
    ],
    mode: input.mode,
    navigation: [
      { from: "/", label: "Browse opportunities", to: "/opportunities" },
      { from: "/opportunities", label: "Home", to: "/" }
    ],
    pages: [
      {
        filePath: "app/page.tsx",
        id: "home",
        name: "Home",
        purpose: "Introduce the prototype and route users into opportunity discovery.",
        route: "/"
      },
      {
        filePath: "app/opportunities/page.tsx",
        id: "opportunities",
        name: "Opportunities",
        purpose: "Show browseable opportunity cards for prototype review.",
        route: "/opportunities"
      }
    ],
    project: {
      defaultStyle: "Focused, restrained, prototype-oriented workspace UI.",
      description:
        "A generated multi-page front-end prototype with explicit simulated backend boundaries.",
      name: projectName
    },
    summary:
      input.mode === "iterate"
        ? "Updated the current prototype using the selected context and saved a new version snapshot."
        : "Generated a new multi-page prototype with safe front-end files and navigation.",
    warnings: [
      PHASE_4_GENERATION_SYSTEM_PROMPT.includes("prototype")
        ? "Prototype only. Real backend, auth, payment, and data sync are not implemented."
        : "Prototype boundary applies."
    ]
  };
}

export function createMockAiProvider(): AiProvider {
  return {
    generateProject(input) {
      return Promise.resolve(buildMockProject({ ...input, mode: "generate" }));
    },
    iterateProject(input) {
      return Promise.resolve(buildMockProject({ ...input, mode: "iterate" }));
    }
  };
}
