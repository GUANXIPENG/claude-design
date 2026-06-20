import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { ProjectExportType } from "@/server/export/exportService";
import { exportProjectVersionForCurrentUser } from "@/server/projects/projectService";

export const dynamic = "force-dynamic";

const exportTypes = new Set<ProjectExportType>(["static", "editable-project"]);

function getWorkspaceRedirectUrl(request: NextRequest, projectId: string | null) {
  const url = new URL("/workspace", request.url);

  if (projectId) {
    url.searchParams.set("projectId", projectId);
  }

  url.searchParams.set("exportError", "export_failed");
  return url;
}

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  const versionId = request.nextUrl.searchParams.get("versionId");
  const exportType = request.nextUrl.searchParams.get("exportType");

  if (!projectId || !exportType || !exportTypes.has(exportType as ProjectExportType)) {
    return NextResponse.redirect(getWorkspaceRedirectUrl(request, projectId));
  }

  try {
    const archive = await exportProjectVersionForCurrentUser({
      exportType: exportType as ProjectExportType,
      projectId,
      versionId
    });

    return new Response(Buffer.from(archive.zipBytes), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${archive.fileName}"`,
        "Content-Type": "application/zip"
      }
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return NextResponse.redirect(getWorkspaceRedirectUrl(request, projectId));
  }
}
