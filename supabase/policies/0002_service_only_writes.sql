-- Sandpack readiness gate:
-- Business table writes must go through server-side orchestration so Zod schemas,
-- path safety checks, quota recording, ownership checks, and version services cannot
-- be bypassed by direct Supabase Data API writes from authenticated browsers.

DROP POLICY IF EXISTS user_profiles_self_insert ON user_profiles;
DROP POLICY IF EXISTS user_profiles_self_update ON user_profiles;
DROP POLICY IF EXISTS projects_owner_insert ON projects;
DROP POLICY IF EXISTS projects_owner_update ON projects;
DROP POLICY IF EXISTS projects_owner_delete ON projects;
DROP POLICY IF EXISTS pages_project_owner_insert ON pages;
DROP POLICY IF EXISTS pages_project_owner_update ON pages;
DROP POLICY IF EXISTS pages_project_owner_delete ON pages;
DROP POLICY IF EXISTS project_versions_project_owner_insert ON project_versions;
DROP POLICY IF EXISTS conversation_messages_project_owner_insert ON conversation_messages;
DROP POLICY IF EXISTS generation_requests_requester_insert ON generation_requests;
DROP POLICY IF EXISTS generation_requests_requester_update ON generation_requests;
DROP POLICY IF EXISTS generation_results_requester_insert ON generation_results;
DROP POLICY IF EXISTS export_records_project_owner_insert ON export_records;
DROP POLICY IF EXISTS quotas_user_insert ON quotas;

REVOKE INSERT, UPDATE, DELETE ON TABLE
  user_profiles,
  projects,
  pages,
  project_versions,
  conversation_messages,
  generation_requests,
  generation_results,
  export_records,
  quotas
FROM anon, authenticated;
