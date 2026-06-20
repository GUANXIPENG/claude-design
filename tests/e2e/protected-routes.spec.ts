import { expect, test } from "@playwright/test";

test.describe("protected routes", () => {
  test("serves public pages", async ({ request }) => {
    await expect((await request.get("/")).status()).toBe(200);
    await expect((await request.get("/login")).status()).toBe(200);
  });

  test("redirects unauthenticated project routes to login", async ({ request }) => {
    const projects = await request.get("/projects", { maxRedirects: 0 });
    const workspace = await request.get("/workspace", { maxRedirects: 0 });

    expect(projects.status()).toBe(307);
    expect(projects.headers().location).toBe("/login?returnTo=%2Fprojects");
    expect(workspace.status()).toBe(307);
    expect(workspace.headers().location).toBe("/login?returnTo=%2Fworkspace");
  });

  test("redirects unauthenticated export without leaking project data", async ({
    request
  }) => {
    const response = await request.get("/export?projectId=test&exportType=static", {
      maxRedirects: 0
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe(
      "/login?returnTo=%2Fworkspace%3FprojectId%3Dtest"
    );
  });

  test("redirects invalid export requests to workspace error state", async ({
    request
  }) => {
    const response = await request.get("/export?projectId=test&exportType=unknown", {
      maxRedirects: 0
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain(
      "/workspace?projectId=test&exportError=export_failed"
    );
  });
});
