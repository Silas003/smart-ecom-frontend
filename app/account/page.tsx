"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "../../lib/user";
import { useAuthStore } from "../../lib/auth-store";
import { getUserOrders, type Order } from "../../lib/orders";
import { updateUser } from "../../lib/auth-api";
import { useToast } from "../../components/ui/toaster";

export default function AccountPage() {
  const router = useRouter();
  const initialUserId = getCurrentUserId();
  const [loading, setLoading] = useState(!initialUserId);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user, hydrate, setUser } = useAuthStore();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent("/account")}`);
      return;
    }
    getUserOrders(userId)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to load orders", err))
      .finally(() => setOrdersLoading(false));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const validateProfile = () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedUsername || trimmedUsername.length < 5) {
      setError("Username must be at least 5 characters");
      return false;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address");
      return false;
    }
    return true;
  };

  const validateNewPassword = () => {
    if (!newPassword) {
      setError("New password is required");
      return false;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("Use upper, lower case letters and a number");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!validateProfile()) return;

    try {
      setSavingProfile(true);
      const res = await updateUser(user.id, {
        username: username.trim(),
        email: email.trim(),
        userRole: user.userRole,
      });
      setUser(res.data);
      addToast("Profile updated", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      addToast(message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!validateNewPassword()) return;

    try {
      setSavingPassword(true);
      await updateUser(user.id, {
        username: user.username,
        email: user.email,
        password: newPassword,
        userRole: user.userRole,
      });
      setCurrentPassword("");
      setNewPassword("");
      addToast("Password updated", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      setError(message);
      addToast(message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Account
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your profile and see recent activity.
        </p>
        <form onSubmit={handleSaveProfile} className="mt-4 grid gap-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Name
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Security
        </h2>
        <form onSubmit={handleChangePassword} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="At least 8 chars, with upper, lower & a number"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Recent orders
          </h2>
          <Link
            href="/account/orders"
            className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {ordersLoading ? (
            <div className="h-16 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          ) : orders.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              You haven&apos;t placed any orders yet.
            </p>
          ) : (
            orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {order.items?.length || 0} items · ${order.totalAmount?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
                <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                  {order.status}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
