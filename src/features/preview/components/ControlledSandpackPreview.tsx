"use client";

import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider
} from "@codesandbox/sandpack-react";
import type { VersionSnapshot } from "@/schemas/generation";
import { createSandpackPreviewModel } from "@/features/preview/lib/createSandpackPreviewModel";

type ControlledSandpackPreviewProps = {
  selectedFilePath: string | null;
  snapshot: VersionSnapshot | null;
};

export function ControlledSandpackPreview({
  selectedFilePath,
  snapshot
}: ControlledSandpackPreviewProps) {
  const previewModel = createSandpackPreviewModel({ selectedFilePath, snapshot });

  if (previewModel.status !== "ready") {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-line bg-white p-6 text-center shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
            Live preview
          </p>
          <h2 className="mt-3 text-lg font-semibold">Preview unavailable</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            {previewModel.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Live preview</h2>
          <p className="mt-1 text-xs leading-5 text-muted">{previewModel.pagePurpose}</p>
        </div>
        <span className="rounded-full bg-canvas px-3 py-1 text-xs text-muted">
          Sandpack controlled
        </span>
      </div>
      <SandpackProvider
        files={previewModel.files}
        options={{
          activeFile: previewModel.activeFile,
          externalResources: [],
          visibleFiles: [previewModel.activeFile]
        }}
        template="react-ts"
      >
        <SandpackLayout className="!block !border-0">
          <SandpackPreview
            className="!h-[440px] !border-0"
            showOpenInCodeSandbox={false}
            showRefreshButton
          />
        </SandpackLayout>
      </SandpackProvider>
      <div className="border-t border-line bg-canvas px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
          Prototype boundary
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">{previewModel.boundaryNotice}</p>
      </div>
    </div>
  );
}
