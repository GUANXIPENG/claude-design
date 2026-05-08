# AI Design Workspace

Phase 1 turns this repository from documentation only into a minimal runnable
Next.js application scaffold.

## Current Stage

This is not the full MVP. The current app only establishes the engineering
foundation described in `docs/PROJECT_STATUS.md`:

- Next.js App Router with TypeScript.
- Tailwind CSS global styling.
- Source directories for app, components, features, lib, server, schemas,
  prompts, and shared types.
- Placeholder homepage that confirms the app can render.
- Environment variable examples without real secrets.
- A minimal scaffold verification script.

Real AI generation, Supabase Auth, database persistence, Sandpack preview,
export, quota logic, version rollback, and workspace flows are intentionally
not implemented in Phase 1.

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

Phase 1 only creates the scaffold. Future work should keep business logic out
of `src/app` route files where possible and use:

- `src/features` for frontend product areas.
- `src/server` for server-only orchestration, auth, AI, data, export, quota,
  and version logic.
- `src/schemas` for runtime validation.
- `src/prompts` for auditable prompt templates.
- `src/types` for shared TypeScript types.
