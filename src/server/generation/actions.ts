"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/server/auth/session";
import { createProjectFromPrompt as createProjectFromPromptService } from "@/server/generation/projectGenerationService";

const GENERATION_ERROR =
  "Project generation failed. No saved project was created. Please revise the prompt and try again.";

export async function createProjectFromPrompt(formData: FormData) {
  const user = await requireCurrentUser("/projects");
  const rawPrompt = formData.get("prompt");
  const prompt = typeof rawPrompt === "string" ? rawPrompt.trim() : "";

  if (!prompt) {
    redirect(`/projects?error=${encodeURIComponent("Please describe the prototype before generating.")}`);
  }

  let projectId: string;

  try {
    const result = await createProjectFromPromptService({
      ownerId: user.id,
      prompt
    });
    projectId = result.projectId;
  } catch {
    redirect(`/projects?error=${encodeURIComponent(GENERATION_ERROR)}`);
  }

  redirect(`/workspace?projectId=${projectId}`);
}
