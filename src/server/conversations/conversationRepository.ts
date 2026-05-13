import "server-only";

import { getDatabase } from "@/server/db/client";
import { conversationMessages } from "@/server/db/schema";

export async function recordConversationMessage(input: {
  content: string;
  projectId: string;
  role: "user" | "assistant" | "system-summary";
  versionId?: string | null;
}) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  const [record] = await db
    .insert(conversationMessages)
    .values({
      content: input.content,
      projectId: input.projectId,
      role: input.role,
      versionId: input.versionId
    })
    .returning();

  return record ?? null;
}

export async function recordGenerationConversation(input: {
  assistantSummary: string;
  projectId: string;
  userPrompt: string;
  versionId?: string | null;
}) {
  const userMessage = await recordConversationMessage({
    content: input.userPrompt,
    projectId: input.projectId,
    role: "user",
    versionId: input.versionId
  });

  const assistantMessage = await recordConversationMessage({
    content: input.assistantSummary,
    projectId: input.projectId,
    role: "assistant",
    versionId: input.versionId
  });

  return {
    assistantMessage,
    userMessage
  };
}
