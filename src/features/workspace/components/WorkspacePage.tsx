"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { primaryFixtureProject } from "@/lib/fixtures/workspace";

type GenerationState = "idle" | "generating" | "ready";

export function WorkspacePage() {
  const [selectedPageId, setSelectedPageId] = useState(primaryFixtureProject.pages[0].id);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("Describe a page or selected area to generate a fixture response.");
  const [generationState, setGenerationState] = useState<GenerationState>("idle");

  const selectedPage = useMemo(
    () =>
      primaryFixtureProject.pages.find((page) => page.id === selectedPageId) ??
      primaryFixtureProject.pages[0],
    [selectedPageId]
  );

  const code = primaryFixtureProject.files[selectedPage.filePath] ?? "";

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.trim()) {
      setMessage("Please describe what to generate or change before submitting.");
      setGenerationState("idle");
      return;
    }

    setGenerationState("generating");
    setMessage("Generating fixture preview. No AI request is being sent.");

    window.setTimeout(() => {
      setGenerationState("ready");
      setMessage("Fixture update ready. This is mock fixture output for Phase 2 only.");
    }, 450);
  }

  return (
    <main className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="flex flex-col gap-3 border-b border-line bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            Phase 2 fixture workspace
          </p>
          <h1 className="mt-1 text-xl font-semibold">{primaryFixtureProject.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-line px-3 py-1 text-muted">
            Current version v{primaryFixtureProject.versionCount}
          </span>
          <button className="rounded-md border border-line px-3 py-2" type="button">
            Version history
          </button>
          <button className="rounded-md bg-accent px-3 py-2 text-white" type="button">
            Export mock
          </button>
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="border-b border-line bg-white p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Pages</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Fixture navigation only. Page changes update preview and code view.
            </p>
          </div>
          <nav className="space-y-2">
            {primaryFixtureProject.pages.map((page) => (
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
              <h2 className="text-sm font-semibold">Preview</h2>
              <p className="text-xs text-muted">{selectedPage.purpose}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-muted">
              Desktop fixture
            </span>
          </div>

          <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
            <div className="rounded-md border border-line bg-canvas p-6">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                Prototype only
              </p>
              <h3 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight">
                {selectedPage.previewTitle}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
                {selectedPage.previewSummary}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {selectedPage.highlights.map((highlight) => (
                  <div className="rounded-md border border-line bg-white p-3" key={highlight}>
                    <span className="text-sm font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Code view</h2>
              <span className="text-xs text-muted">{selectedPage.filePath}</span>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md bg-[#17202a] p-4 text-xs leading-5 text-[#e6edf3]">
              <code>{code}</code>
            </pre>
          </div>
        </section>

        <aside className="border-t border-line bg-white p-4 lg:border-l lg:border-t-0">
          <div className="mb-4 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-muted">
            This is mock fixture output. It is not connected to real AI, Supabase,
            Sandpack, export, quota, or version rollback services.
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-line p-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                System
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
            </div>
            {generationState === "generating" ? (
              <div className="rounded-lg border border-line p-3 text-sm text-muted">
                Generating fixture preview...
              </div>
            ) : null}
            {generationState === "ready" ? (
              <div className="rounded-lg border border-accent bg-canvas p-3 text-sm">
                Fixture update ready for {selectedPage.name}.
              </div>
            ) : null}
          </div>

          <form className="mt-5 space-y-3" onSubmit={submitPrompt}>
            <label className="block text-sm font-medium" htmlFor="workspace-draft">
              Request
            </label>
            <textarea
              className="min-h-32 w-full resize-y rounded-md border border-line bg-white p-3 text-sm outline-none focus:border-accent"
              id="workspace-draft"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Describe a generation or local edit request..."
              value={draft}
            />
            <button
              className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white"
              type="submit"
            >
              Generate fixture response
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
