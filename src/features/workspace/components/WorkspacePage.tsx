"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { VersionSnapshot } from "@/schemas/generation";
import { ControlledSandpackPreview } from "@/features/preview/components/ControlledSandpackPreview";
import { rollbackVersionAction } from "@/server/versions/actions";

type ProjectWorkspaceSnapshot = {
  currentVersion: {
    id: string;
    snapshot: VersionSnapshot;
    summary: string;
    versionNumber: number;
  } | null;
  project: {
    description: string | null;
    id: string;
    name: string;
    updatedAt: string;
  };
};

type SelectionState = {
  label: string;
  scope: string;
};

type VersionHistoryItem = {
  createdAt: string;
  id: string;
  isCurrent: boolean;
  projectId: string;
  snapshot: VersionSnapshot;
  summary: string;
  versionNumber: number;
};

type WorkspacePageProps = {
  authUserEmail: string | null;
  exportMessage: string | null;
  versionHistory: VersionHistoryItem[];
  versionMessage: string | null;
  workspaceProject: ProjectWorkspaceSnapshot | null;
};

export function WorkspacePage({
  authUserEmail,
  exportMessage,
  versionHistory,
  versionMessage,
  workspaceProject
}: WorkspacePageProps) {
  const currentVersion = workspaceProject?.currentVersion ?? null;
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [confirmRollbackVersionId, setConfirmRollbackVersionId] = useState<string | null>(
    null
  );
  const previewVersion =
    versionHistory.find((version) => version.id === previewVersionId) ?? null;
  const activeVersion = previewVersion ?? currentVersion;
  const snapshot = activeVersion?.snapshot ?? null;
  const pages = snapshot?.pages ?? [];
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id ?? "");
  const [selection, setSelection] = useState<SelectionState | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId]
  );
  const code =
    selectedPage && snapshot?.files ? snapshot.files[selectedPage.filePath] ?? "" : "";

  if (!workspaceProject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-ink">
        <section className="w-full max-w-xl rounded-lg border border-line bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            Workspace
          </p>
          <h1 className="mt-3 text-2xl font-semibold">No project selected</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Choose a saved project or generate a new prototype before opening
            the workspace.
          </p>
          <Link
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white"
            href="/projects"
          >
            Back to projects
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="flex flex-col gap-3 border-b border-line bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            P0 project workspace
          </p>
          <h1 className="mt-1 text-xl font-semibold">{workspaceProject.project.name}</h1>
          <p className="mt-1 text-xs text-muted">
            Signed in as {authUserEmail ?? "authenticated user"} / Updated{" "}
            {new Date(workspaceProject.project.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-line px-3 py-1 text-muted">
            Current version v{currentVersion?.versionNumber ?? 0}
          </span>
          <button
            className="rounded-md border border-line px-3 py-2"
            onClick={() => setIsVersionHistoryOpen((isOpen) => !isOpen)}
            type="button"
          >
            Version history
          </button>
          {currentVersion ? (
            <>
              <Link
                className="rounded-md bg-accent px-3 py-2 text-white"
                href={`/export?projectId=${workspaceProject.project.id}&versionId=${currentVersion.id}&exportType=static`}
              >
                Download static ZIP
              </Link>
              <Link
                className="rounded-md border border-line px-3 py-2"
                href={`/export?projectId=${workspaceProject.project.id}&versionId=${currentVersion.id}&exportType=editable-project`}
              >
                Download editable ZIP
              </Link>
            </>
          ) : (
            <button
              className="rounded-md bg-accent px-3 py-2 text-white opacity-60"
              disabled
              type="button"
            >
              Export current version
            </button>
          )}
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="border-b border-line bg-white p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Pages</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Reads the persisted current version snapshot for this project.
            </p>
          </div>
          <nav className="space-y-2">
            {pages.map((page) => (
              <button
                className={`w-full rounded-md border px-3 py-3 text-left text-sm ${
                  page.id === selectedPageId
                    ? "border-accent bg-canvas text-ink"
                    : "border-line bg-white text-muted"
                }`}
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                type="button"
              >
                <span className="block font-medium">{page.name}</span>
                <span className="mt-1 block text-xs">{page.route}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-h-[560px] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Live preview</h2>
              <p className="text-xs text-muted">
                {selectedPage?.purpose ?? "This project has no generated pages yet."}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-muted">
              {previewVersion ? `Preview version v${previewVersion.versionNumber}` : "Current version"}
            </span>
          </div>

          {previewVersion ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-white px-4 py-3 text-sm shadow-sm">
              <span>
                Previewing version v{previewVersion.versionNumber}. Current version is not
                changed until restore is confirmed.
              </span>
              <button
                className="rounded-md border border-line px-3 py-2 text-xs"
                onClick={() => {
                  setConfirmRollbackVersionId(null);
                  setPreviewVersionId(null);
                }}
                type="button"
              >
                Return to current version
              </button>
            </div>
          ) : null}

          <ControlledSandpackPreview
            selectedFilePath={selectedPage?.filePath ?? null}
            snapshot={snapshot}
          />

          <div className="mt-4 rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Code view</h2>
              <span className="text-xs text-muted">{selectedPage?.filePath ?? "No file"}</span>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md bg-[#17202a] p-4 text-xs leading-5 text-[#e6edf3]">
              <code>{code || "No generated code found for the selected page."}</code>
            </pre>
          </div>
        </section>

        <aside className="border-t border-line bg-white p-4 lg:border-l lg:border-t-0">
          {versionMessage ? (
            <div className="mb-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
              {versionMessage}
            </div>
          ) : null}
          {exportMessage ? (
            <div className="mb-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
              {exportMessage}
            </div>
          ) : null}
          <div className="mb-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
            The current workspace displays persisted prototype metadata and safe
            generated files in a controlled Sandpack preview. Exports are
            server-generated ZIP files with prototype boundary notes; full iterative
            editing remains a separate MVP stage.
          </div>

          {isVersionHistoryOpen ? (
            <div className="mb-4 rounded-lg border border-line p-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                Version history
              </p>
              {versionHistory.length ? (
                <div className="mt-3 space-y-3">
                  {versionHistory.map((version) => (
                    <div
                      className="rounded-md border border-line bg-white p-3"
                      key={version.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            v{version.versionNumber}
                            {version.isCurrent ? " / Current version" : ""}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted">
                            {version.summary}
                          </p>
                          <p className="mt-1 text-[11px] text-muted">
                            {new Date(version.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          className="rounded-md border border-line px-2 py-1 text-xs"
                          onClick={() => {
                            setPreviewVersionId(version.id);
                            setConfirmRollbackVersionId(null);
                          }}
                          type="button"
                        >
                          Preview version
                        </button>
                      </div>
                      {!version.isCurrent ? (
                        confirmRollbackVersionId === version.id ? (
                          <form action={rollbackVersionAction} className="mt-3 space-y-2">
                            <input
                              name="projectId"
                              type="hidden"
                              value={workspaceProject.project.id}
                            />
                            <input name="versionId" type="hidden" value={version.id} />
                            <p className="text-xs leading-5 text-muted">
                              Confirm restore to version v{version.versionNumber}. A new
                              current version record will be created.
                            </p>
                            <div className="flex gap-2">
                              <button
                                className="rounded-md bg-accent px-3 py-2 text-xs font-medium text-white"
                                type="submit"
                              >
                                Confirm restore
                              </button>
                              <button
                                className="rounded-md border border-line px-3 py-2 text-xs"
                                onClick={() => setConfirmRollbackVersionId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            className="mt-3 rounded-md border border-line px-3 py-2 text-xs"
                            onClick={() => {
                              setPreviewVersionId(version.id);
                              setConfirmRollbackVersionId(version.id);
                            }}
                            type="button"
                          >
                            Restore this version
                          </button>
                        )
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-muted">
                  No version history yet.
                </p>
              )}
            </div>
          ) : null}

          <div className="mb-4 rounded-lg border border-line p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                  Selection context
                </p>
                <p className="mt-2 text-sm font-medium">
                  {selection?.label ?? "No selected area"}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {selection?.scope ??
                    "Local edit requests will use this context in a later iteration stage."}
                </p>
              </div>
              <button
                className="rounded-md border border-line px-2 py-1 text-xs text-muted"
                onClick={() =>
                  setSelection((current) =>
                    current || !selectedPage
                      ? null
                      : {
                          label: `${selectedPage.name} / Current page`,
                          scope: "Selected from the persisted current version snapshot."
                        }
                  )
                }
                type="button"
              >
                {selection ? "Clear" : "Select"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line p-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                Generation summary
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {workspaceProject.currentVersion?.summary ??
                  "No current version snapshot has been saved."}
              </p>
            </div>
            {snapshot?.navigation.length ? (
              <div className="rounded-lg border border-line p-3">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                  Navigation
                </p>
                <ul className="mt-2 space-y-2 text-sm text-muted">
                  {snapshot.navigation.map((item) => (
                    <li key={`${item.from}-${item.to}-${item.label}`}>
                      {item.label}: {item.from} to {item.to}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
