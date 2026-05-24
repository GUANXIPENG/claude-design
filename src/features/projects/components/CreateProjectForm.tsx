"use client";

import { useFormStatus } from "react-dom";

type CreateProjectFormProps = {
  action: (formData: FormData) => Promise<void>;
};

export function CreateProjectForm({ action }: CreateProjectFormProps) {
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-line bg-white p-5 shadow-sm">
      <label className="text-sm font-semibold" htmlFor="project-prompt">
        New prototype
      </label>
      <textarea
        className="min-h-28 resize-y rounded-md border border-line bg-white p-3 text-sm leading-6 outline-none focus:border-accent"
        id="project-prompt"
        maxLength={4000}
        name="prompt"
        placeholder="Describe the multi-page prototype you want to generate..."
        required
      />
      <p className="text-xs leading-5 text-muted">
        Creates a front-end prototype snapshot only. Buttons, forms, auth, payment, and data sync remain simulated unless you connect them later.
      </p>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Generating..." : "Generate project"}
    </button>
  );
}
