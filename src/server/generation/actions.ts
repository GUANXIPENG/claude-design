"use server";

import { redirect } from "next/navigation";
import { validateGenerationPrompt } from "@/schemas/generation";
import { requireCurrentUser } from "@/server/auth/session";
import { createProjectFromPrompt as createProjectFromPromptService } from "@/server/generation/projectGenerationService";

const GENERATION_ERROR =
  "Project generation failed. No saved project was created. Please revise the prompt and try again.";

export async function createProjectFromPrompt(formData: FormData) {
  const user = await requireCurrentUser("/projects");
  const rawPrompt = formData.get("prompt");
  let prompt: string;

  try {
    prompt = validateGenerationPrompt(rawPrompt);
  } catch {
    redirect(
      `/projects?error=${encodeURIComponent(
        "Please describe the prototype in 4000 characters or fewer."
      )}`
    );
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
