import "server-only";

import { getDatabase } from "@/server/db/client";
import { userProfiles } from "@/server/db/schema";
import type { AuthUser } from "@/server/auth/session";

type UserProfileDatabase = {
  insert(table: typeof userProfiles): {
    values(value: {
      email: string | null;
      id: string;
      updatedAt?: Date;
    }): {
      onConflictDoUpdate(update: {
        set: {
          email: string | null;
          updatedAt: Date;
        };
        target: typeof userProfiles.id;
      }): Promise<unknown>;
    };
  };
};

export async function ensureUserProfile(input: {
  db?: UserProfileDatabase | null;
  user: AuthUser;
}) {
  const db = input.db ?? getDatabase();

  if (!db) {
    return;
  }

  await db
    .insert(userProfiles)
    .values({
      email: input.user.email,
      id: input.user.id,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      set: {
        email: input.user.email,
        updatedAt: new Date()
      },
      target: userProfiles.id
    });
}
