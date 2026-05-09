CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE generation_mode AS ENUM ('generate', 'iterate', 'repair', 'explain');
CREATE TYPE generation_status AS ENUM ('queued', 'running', 'succeeded', 'failed');
CREATE TYPE quota_operation AS ENUM ('generate', 'iterate', 'repair', 'export');

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_style text,
  initial_prompt text,
  current_version_id uuid,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  route text NOT NULL,
  file_path text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_home boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL REFERENCES user_profiles(id),
  version_number integer NOT NULL,
  summary text NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id uuid REFERENCES project_versions(id),
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE generation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  requested_by_id uuid NOT NULL REFERENCES user_profiles(id),
  mode generation_mode NOT NULL,
  prompt text NOT NULL,
  status generation_status NOT NULL DEFAULT 'queued',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE generation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES generation_requests(id) ON DELETE CASCADE,
  validation_status text NOT NULL,
  result jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE export_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id uuid REFERENCES project_versions(id),
  requested_by_id uuid NOT NULL REFERENCES user_profiles(id),
  export_type text NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  operation_type quota_operation NOT NULL,
  units integer NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX projects_owner_id_idx ON projects(owner_id);
CREATE INDEX pages_project_id_idx ON pages(project_id);
CREATE INDEX project_versions_project_id_idx ON project_versions(project_id);
CREATE INDEX conversation_messages_project_id_idx ON conversation_messages(project_id);
CREATE INDEX generation_requests_requested_by_id_idx ON generation_requests(requested_by_id);
CREATE INDEX export_records_project_id_idx ON export_records(project_id);
CREATE INDEX quotas_user_id_idx ON quotas(user_id);
