import { getAuthHeader } from "./auth-store";
import { redirect } from "next/navigation";

export async function authorizedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const authHeader = getAuthHeader();
  const headers = {
    ...(init.headers || {}),
    ...authHeader,
  } as Record<string, string>;

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 || res.status === 403) {
    // Clear client-side auth state
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      } catch {
        // ignore storage errors
      }
    }

    try {
      const current =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/";
      redirect(`/login?redirect=${encodeURIComponent(current)}`);
    } catch {
      // redirect() is only allowed in specific contexts; if it fails, just return the response
    }
  }

  return res;
}
