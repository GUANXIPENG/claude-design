import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import { rollbackProjectVersion, type VersionSnapshot } from "../src/server/versions/versionService";

vi.mock("server-only", () => ({}));

const snapshot: VersionSnapshot = {
  files: {
    "app/page.tsx": "export default function Home() { return <main />; }"
  },
  navigation: [],
  pages: [
    {
      filePath: "app/page.tsx",
      id: "home",
      name: "Home",
      purpose: "Home page",
      route: "/"
    }
  ],
  project: {
    defaultStyle: "Clean",
    description: "Rollback target",
    name: "Rollback Project"
  },
  prototypeBoundaryNotice: "Prototype only.",
  summary: "Target version"
};

describe("version history rollback behavior", () => {
  it("creates a new rollback version record without mutating the target snapshot", () => {
    const rollback = rollbackProjectVersion({
      createdById: "00000000-0000-4000-8000-000000000001",
      projectId: "00000000-0000-4000-8000-000000000002",
      targetSnapshot: snapshot,
      targetVersionNumber: 2,
      versionNumber: 5
    });

    expect(rollback).toMatchObject({
      createdById: "00000000-0000-4000-8000-000000000001",
      projectId: "00000000-0000-4000-8000-000000000002",
      reason: "rollback",
      summary: "Rolled back to version 2.",
      versionNumber: 5
    });
    expect(rollback.snapshot).toBe(snapshot);
  });
});
