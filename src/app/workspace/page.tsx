import { WorkspacePage } from "@/features/workspace/components/WorkspacePage";
import { requireCurrentUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function WorkspaceRoute() {
  const user = await requireCurrentUser("/workspace");

  return <WorkspacePage authUserEmail={user.email} />;
}
