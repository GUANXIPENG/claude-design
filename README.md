# AI Design Workspace

Phase 2 turns the minimal scaffold into a fixture-driven front-end workspace
loop for validating the visible MVP shell.

## Current Stage

This is not the full MVP. The current app establishes the engineering
foundation and a mock front-end workspace described in `docs/PROJECT_STATUS.md`:

- Next.js App Router with TypeScript.
- Tailwind CSS global styling.
- Source directories for app, components, features, lib, server, schemas,
  prompts, and shared types.
- Phase 2 homepage with links to fixture projects and workspace.
- Login placeholder route for the future Supabase Auth boundary.
- Fixture project list and three-panel workspace shell.
- Static preview and code view driven by `src/lib/fixtures/workspace.ts`.
- Mock generation states for empty input, generating, and ready feedback.
- Environment variable examples without real secrets.
- Phase 1 scaffold and Phase 2 workspace verification scripts.

Real AI generation, Supabase Auth, database persistence, Sandpack preview,
export, quota logic, and version rollback are intentionally not implemented in
Phase 2. The workspace uses fixture data only.

## Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run the available checks:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Environment

Create a local `.env` file from `.env.example` when services are connected.
Do not commit `.env` or real keys.

Required placeholders for later phases:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

OpenAI API keys and Supabase service role keys must stay server-only.

## Project Boundaries

Phase 2 only creates the front-end shell. Future work should keep business
logic out of `src/app` route files where possible and use:

- `src/features` for frontend product areas.
- `src/lib/fixtures` for mock data that must not become the production data
  source.
- `src/server` for server-only orchestration, auth, AI, data, export, quota,
  and version logic.
- `src/schemas` for runtime validation.
- `src/prompts` for auditable prompt templates.
- `src/types` for shared TypeScript types.
