import "server-only";

const DEFAULT_RETURN_TO = "/projects";
const SAME_ORIGIN_BASE = "http://app.local";

export function sanitizeReturnTo(value: unknown, fallback = DEFAULT_RETURN_TO) {
  if (typeof value !== "string") {
    return fallback;
  }

  const returnTo = value.trim();

  if (!returnTo.startsWith("/") || returnTo.startsWith("//") || returnTo.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(returnTo, SAME_ORIGIN_BASE);

    if (parsed.origin !== SAME_ORIGIN_BASE) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
