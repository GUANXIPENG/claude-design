"use server";

import { redirect } from "next/navigation";
import { rollbackProjectVersionForCurrentUser } from "@/server/projects/projectService";

function readRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

export async function rollbackVersionAction(formData: FormData) {
  let projectId = "";

  try {
    projectId = readRequiredFormValue(formData, "projectId");
    const versionId = readRequiredFormValue(formData, "versionId");

    await rollbackProjectVersionForCurrentUser({
      projectId,
      versionId
    });
  } catch {
    const fallbackProjectId = projectId ? `?projectId=${encodeURIComponent(projectId)}&` : "?";
    redirect(`${"/workspace"}${fallbackProjectId}versionError=rollback_failed`);
  }

  redirect(`/workspace?projectId=${encodeURIComponent(projectId)}&versionRestored=1`);
}
