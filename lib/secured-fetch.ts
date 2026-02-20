// lib/authorized-fetch.ts
import { useAuthStore } from "./auth-store";

export class AuthError extends Error {
    constructor(public status: 401 | 403) {
        super(`Unauthorized: ${status}`);
        this.name = "AuthError";
    }
}

export async function authorizedFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    // Read token from store state directly — safe after hydration
    const token = useAuthStore.getState().token;

    const headers = new Headers(init.headers);
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(input, { ...init, headers });

    if (res.status === 401 || res.status === 403) {
        // Wipe auth state in the store and localStorage
        useAuthStore.getState().logout();

        // Throw so callers can handle or bubble up
        throw new AuthError(res.status);
    }

    return res;
}