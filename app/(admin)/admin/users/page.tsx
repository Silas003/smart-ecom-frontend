"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, createUser, deleteUser, type User, type UserRole } from "../../../../lib/auth-api";
import { useAuthStore } from "../../../../lib/auth-store";
import { useToast } from "../../../../components/ui/toaster";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState<{
    username: string;
    email: string;
    password: string;
    userRole: UserRole;
  }>({ username: "", email: "", password: "", userRole: "customer" });

  const loadPage = async (pageIndex: number) => {
    const res = await getUsers({ page: pageIndex, size: pageSize });
    setUsers(res.data.content);
    setTotalPages(res.data.totalPages);
    setPage(res.data.number);
  };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/admin/users")}`);
      return;
    }
    if (user.userRole !== "admin") {
      router.push("/");
      return;
    }

    loadPage(0)
      .catch((err) => {
        console.error("Failed to load users", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => setInitialLoading(false));
  }, [isLoading, router, user, hydrate]);

  const refresh = async () => {
    try {
      await loadPage(page);
    } catch (err) {
      console.error("Failed to refresh users", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      await createUser(form);
      setForm({ username: "", email: "", password: "", userRole: "customer" });
      await refresh();
      addToast("User created successfully", "success");
    } catch (err) {
      const fallback = "Failed to create user.";
      const message = err instanceof Error ? err.message || fallback : fallback;
      setError(message);
      addToast(message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addToast("User deleted", "success");
    } catch (err) {
      console.error("Failed to delete user", err);
      const message = "Failed to delete user.";
      setError(message);
      addToast(message, "error");
    }
  };

  if (isLoading || (!user && initialLoading)) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Users</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Users
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manage accounts
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Create, list, and remove users. Use this section carefully in production.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Create user
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Add a new account with a role. Password must meet your backend policy.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Username (min 5 characters)"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="email"
            placeholder="Email address (e.g. alice@example.com)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="password"
            placeholder="Strong password (min 8 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <select
            value={form.userRole}
            onChange={(e) => setForm({ ...form, userRole: e.target.value as UserRole })}
            className="w-44 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {creating ? "Creating..." : "Create user"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>Existing users</span>
          {initialLoading && <span>Loading...</span>}
        </div>
        {users.length === 0 && !initialLoading ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No users found on this page.
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pl-3 pr-4">ID</th>
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-100 text-xs text-zinc-700 last:border-0 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <td className="py-2 pl-3 pr-4">{u.id}</td>
                  <td className="py-2 pr-4">{u.username}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.userRole}</td>
                  <td className="py-2 pr-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      className="rounded-full border border-red-300 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => loadPage(page - 1).catch(() => {})}
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => loadPage(page + 1).catch(() => {})}
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
