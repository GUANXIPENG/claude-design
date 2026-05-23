import { describe, expect, it, vi } from "vitest";
import type { AiProvider } from "../src/server/ai/provider";
import { sanitizePersistenceErrorMessage } from "../src/server/generation/generationRepository";

vi.mock("server-only", () => ({}));

const generatedProject = {
  files: [
    {
      content: "export default function Home() { return <main>Home</main>; }",
      path: "app/page.tsx"
    }
  ],
  mode: "generate" as const,
  navigation: [],
  pages: [
    {
      filePath: "app/page.tsx",
      id: "home",
      name: "Home",
      purpose: "Introduce the generated prototype.",
      route: "/"
    }
  ],
  project: {
    defaultStyle: "Clean workspace UI",
    description: "Generated prototype description.",
    name: "Generated Prototype"
  },
  summary: "Generated a safe prototype.",
  warnings: ["Prototype only."]
};

function createProvider(project = generatedProject) {
  return {
    generateProject: vi.fn().mockResolvedValue(project),
    iterateProject: vi.fn()
  } satisfies AiProvider;
}

function createPersistence() {
  return {
    createGenerationRequest: vi.fn().mockResolvedValue({ id: "request-1" }),
    markGenerationFailed: vi.fn().mockResolvedValue(null),
    persistSuccessfulGeneration: vi
      .fn()
      .mockResolvedValue({ projectId: "project-1", versionId: "version-1" })
  };
}

describe("P0 project generation entry behavior", () => {
  it("rejects empty prompts before provider or persistence work", async () => {
    const { createProjectFromPrompt } = await import(
      "../src/server/generation/projectGenerationService"
    );
    const provider = createProvider();
    const persistence = createPersistence();

    await expect(
      createProjectFromPrompt({
        ownerId: "user-1",
        persistence,
        prompt: "   ",
        provider
      })
    ).rejects.toThrow("Generated project prompt is required");

    expect(provider.generateProject).not.toHaveBeenCalled();
    expect(persistence.createGenerationRequest).not.toHaveBeenCalled();
    expect(persistence.persistSuccessfulGeneration).not.toHaveBeenCalled();
  });

  it("records a failed request when AI output includes an illegal path", async () => {
    const { createProjectFromPrompt } = await import(
      "../src/server/generation/projectGenerationService"
    );
    const provider = createProvider({
      ...generatedProject,
      files: [{ content: "SECRET=1", path: ".env" }],
      pages: [{ ...generatedProject.pages[0], filePath: ".env" }]
    });
    const persistence = createPersistence();

    await expect(
      createProjectFromPrompt({
        ownerId: "user-1",
        persistence,
        prompt: "Build a prototype",
        provider
      })
    ).rejects.toThrow(/forbidden pattern|not allowed|allowlist/);

    expect(persistence.createGenerationRequest).toHaveBeenCalledOnce();
    expect(persistence.persistSuccessfulGeneration).not.toHaveBeenCalled();
    expect(persistence.markGenerationFailed).toHaveBeenCalledOnce();
  });

  it("persists a successful generation through the atomic persistence boundary", async () => {
    const { createProjectFromPrompt } = await import(
      "../src/server/generation/projectGenerationService"
    );
    const provider = createProvider();
    const persistence = createPersistence();

    await expect(
      createProjectFromPrompt({
        ownerId: "user-1",
        persistence,
        prompt: "Build a multi-page internship tracker",
        provider
      })
    ).resolves.toMatchObject({
      projectId: "project-1",
      versionId: "version-1"
    });

    expect(persistence.createGenerationRequest).toHaveBeenCalledWith({
      mode: "generate",
      ownerId: "user-1",
      projectId: null,
      prompt: "Build a multi-page internship tracker"
    });
    expect(persistence.persistSuccessfulGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedProject,
        initialPrompt: "Build a multi-page internship tracker",
        ownerId: "user-1",
        request: { id: "request-1" }
      })
    );
    expect(persistence.markGenerationFailed).not.toHaveBeenCalled();
  });

  it("stores safe failure categories instead of raw provider errors", () => {
    expect(sanitizePersistenceErrorMessage(new Error("OpenAI raw upstream timeout"))).toBe(
      "provider_failed"
    );
    expect(sanitizePersistenceErrorMessage(new Error("Generated file path contains .env"))).toBe(
      "validation_failed"
    );
    expect(sanitizePersistenceErrorMessage(new Error("Database insert failed"))).toBe(
      "persistence_failed"
    );
  });
});
