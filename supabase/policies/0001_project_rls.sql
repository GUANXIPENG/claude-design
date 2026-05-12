ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_self_select ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY user_profiles_self_insert ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY user_profiles_self_update ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY projects_owner_select ON projects
  FOR SELECT
  USING (auth.uid() = projects.owner_id);

CREATE POLICY projects_owner_insert ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = projects.owner_id);

CREATE POLICY projects_owner_update ON projects
  FOR UPDATE
  USING (auth.uid() = projects.owner_id)
  WITH CHECK (auth.uid() = projects.owner_id);

CREATE POLICY projects_owner_delete ON projects
  FOR DELETE
  USING (auth.uid() = projects.owner_id);

CREATE POLICY pages_project_owner_select ON pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY pages_project_owner_insert ON pages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY pages_project_owner_update ON pages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
        AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY pages_project_owner_delete ON pages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY project_versions_project_owner_select ON project_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY project_versions_project_owner_insert ON project_versions
  FOR INSERT
  WITH CHECK (
    project_versions.created_by_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY conversation_messages_project_owner_select ON conversation_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = conversation_messages.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY conversation_messages_project_owner_insert ON conversation_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = conversation_messages.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY generation_requests_requester_select ON generation_requests
  FOR SELECT
  USING (
    generation_requests.requested_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generation_requests.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY generation_requests_requester_insert ON generation_requests
  FOR INSERT
  WITH CHECK (
    generation_requests.requested_by_id = auth.uid()
    AND (
      generation_requests.project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = generation_requests.project_id
          AND projects.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY generation_requests_requester_update ON generation_requests
  FOR UPDATE
  USING (generation_requests.requested_by_id = auth.uid())
  WITH CHECK (generation_requests.requested_by_id = auth.uid());

CREATE POLICY generation_results_requester_select ON generation_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM generation_requests
      WHERE generation_requests.id = generation_results.request_id
        AND (
          generation_requests.requested_by_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = generation_requests.project_id
              AND projects.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY generation_results_requester_insert ON generation_results
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM generation_requests
      WHERE generation_requests.id = generation_results.request_id
        AND generation_requests.requested_by_id = auth.uid()
    )
  );

CREATE POLICY export_records_project_owner_select ON export_records
  FOR SELECT
  USING (
    export_records.requested_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = export_records.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY export_records_project_owner_insert ON export_records
  FOR INSERT
  WITH CHECK (
    export_records.requested_by_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = export_records.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY quotas_user_select ON quotas
  FOR SELECT
  USING (quotas.user_id = auth.uid());

CREATE POLICY quotas_user_insert ON quotas
  FOR INSERT
  WITH CHECK (
    quotas.user_id = auth.uid()
    AND (
      quotas.project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = quotas.project_id
          AND projects.owner_id = auth.uid()
      )
    )
  );
