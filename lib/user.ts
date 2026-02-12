import { useAuthStore } from "./auth-store";

export function getCurrentUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }
  const state = useAuthStore.getState();
  return state.user?.id ?? null;
}
