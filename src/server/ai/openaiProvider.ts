import "server-only";

import OpenAI from "openai";
import type { AiGenerationInput, AiProvider } from "@/server/ai/provider";
import {
  sanitizeGeneratedProject,
  type GeneratedProject
} from "@/schemas/generation";
import { PHASE_4_GENERATION_SYSTEM_PROMPT } from "@/prompts/generation";

const DEFAULT_OPENAI_MODEL = "gpt-5.5";

type OpenAiResponsesClient = {
  responses: {
    create(input: Record<string, unknown>): Promise<{
      output?: unknown;
      output_text?: string;
    }>;
  };
};

const generatedProjectJsonSchema = {
  additionalProperties: false,
  properties: {
    files: {
      items: {
        additionalProperties: false,
        properties: {
          content: { minLength: 1, type: "string" },
          path: { minLength: 1, type: "string" }
        },
        required: ["content", "path"],
        type: "object"
      },
      minItems: 1,
      type: "array"
    },
    mode: { enum: ["generate", "iterate", "repair", "explain"], type: "string" },
    navigation: {
      items: {
        additionalProperties: false,
        properties: {
          from: { minLength: 1, type: "string" },
          label: { minLength: 1, type: "string" },
          to: { minLength: 1, type: "string" }
        },
        required: ["from", "label", "to"],
        type: "object"
      },
      type: "array"
    },
    pages: {
      items: {
        additionalProperties: false,
        properties: {
          filePath: { minLength: 1, type: "string" },
          id: { minLength: 1, type: "string" },
          name: { minLength: 1, type: "string" },
          purpose: { minLength: 1, type: "string" },
          route: { minLength: 1, type: "string" }
        },
        required: ["filePath", "id", "name", "purpose", "route"],
        type: "object"
      },
      minItems: 1,
      type: "array"
    },
    project: {
      additionalProperties: false,
      properties: {
        defaultStyle: { minLength: 1, type: "string" },
        description: { minLength: 1, type: "string" },
        name: { minLength: 1, type: "string" }
      },
      required: ["defaultStyle", "description", "name"],
      type: "object"
    },
    summary: { minLength: 1, type: "string" },
    warnings: {
      items: { type: "string" },
      type: "array"
    }
  },
  required: ["files", "mode", "navigation", "pages", "project", "summary", "warnings"],
  type: "object"
} as const;

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

export function hasOpenAiProviderConfig() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function createOpenAiResponsesProvider(options?: {
  apiKey?: string;
  client?: OpenAiResponsesClient;
  model?: string;
}): AiProvider {
  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
  const client =
    options?.client ??
    new OpenAI({
      apiKey
    });
  const model = options?.model ?? getOpenAiModel();

  async function requestGeneratedProject(input: AiGenerationInput): Promise<GeneratedProject> {
    if (!apiKey && !options?.client) {
      throw new Error("OpenAI provider is not configured.");
    }

    const response = await client.responses.create({
      input: buildUserInput(input),
      instructions: PHASE_4_GENERATION_SYSTEM_PROMPT,
      model,
      store: false,
      text: {
        format: {
          name: "generated_project",
          schema: generatedProjectJsonSchema,
          strict: true,
          type: "json_schema"
        }
      }
    });

    return sanitizeGeneratedProject(parseResponseJson(response));
  }

  return {
    generateProject(input) {
      return requestGeneratedProject({ ...input, mode: "generate" });
    },
    iterateProject(input) {
      return requestGeneratedProject({ ...input, mode: "iterate" });
    }
  };
}

function buildUserInput(input: AiGenerationInput) {
  const selectedContext = input.selectedContext
    ? `\nSelected context for local edit:\n${input.selectedContext}`
    : "";

  return [
    `Mode: ${input.mode}`,
    input.projectId ? `Project id: ${input.projectId}` : "Project id: new project",
    "User request:",
    input.prompt,
    selectedContext,
    "Return only JSON matching the provided schema. Generated files must stay inside the allowlisted front-end prototype paths."
  ]
    .filter(Boolean)
    .join("\n");
}

function parseResponseJson(response: { output?: unknown; output_text?: string }) {
  const outputText = response.output_text ?? findTextOutput(response.output);

  if (!outputText) {
    throw new Error("OpenAI response did not include structured JSON output.");
  }

  try {
    return JSON.parse(outputText);
  } catch {
    throw new Error("OpenAI response JSON could not be parsed.");
  }
}

function findTextOutput(output: unknown): string | null {
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = "content" in item ? item.content : null;

    if (!Array.isArray(content)) {
      continue;
    }

    const textPart = content.find(
      (part) => part && typeof part === "object" && "text" in part
    );

    if (textPart && typeof textPart === "object" && "text" in textPart) {
      return String(textPart.text);
    }
  }

  return null;
}
