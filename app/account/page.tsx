"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/use-require-auth";
import { getUserOrders, type Order } from "../../lib/orders";
import { updateUser } from "../../lib/auth-api";
import { useToast } from "../../components/ui/toaster";

export default function AccountPage() {
    const router = useRouter();
    const { user } = useRequireAuth({
        redirectTo: `/login?redirect=${encodeURIComponent(`/account`)}`,
    });
    const { addToast } = useToast();

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states for local users
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    if (!user) return null;

    const isLocalUser = user?.data.provider == "local";

    useEffect(() => {
        console.log("user", user);
        if (user?.data.id) {
            getUserOrders(user?.data.id)
                .then((res) => setOrders(res.data))
                .catch((err) => console.error("Failed to load orders", err))
                .finally(() => setOrdersLoading(false));

            if (isLocalUser) {
                setUsername(user?.data.username);
                setEmail(user?.data.email);
            }
        }
    }, [user]);

    // Local user validation functions
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
        if (!validateProfile()) return;
        try {
            setSavingProfile(true);
            await updateUser(user?.data.id, { username: username.trim(), email, userRole: user?.data.userRole });
            addToast("Profile updated", "success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !validateNewPassword()) return;
        try {
            setSavingPassword(true);
            await updateUser(user?.data.id, { username: user?.data.username, email: user?.data.email, password: newPassword, userRole: user?.data.userRole });
            setCurrentPassword("");
            setNewPassword("");
            addToast("Password updated", "success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update password");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* ── LOCAL USER ─────────────────────────────────────────────── */}
            {isLocalUser && (
                <>
                    {/* Profile */}
                    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <h1 className="mb-5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            Account
                        </h1>
                        <form onSubmit={handleSaveProfile} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    Username
                                </label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    Email
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="Email"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                                />
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                                >
                                    {savingProfile ? (
                                        <>
                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Security */}
                    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <h2 className="mb-5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            Security
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    Current password
                                </label>
                                <input
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                    New password
                                </label>
                                <input
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                                />
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                    Min. 8 characters with uppercase, lowercase, and a number.
                                </p>
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                                >
                                    {savingPassword ? (
                                        <>
                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update password"
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </>
            )}

            {/* ── SOCIAL USER ────────────────────────────────────────────── */}
            {!isLocalUser && (
                <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex flex-col items-center gap-4 py-4">
                        {/* Avatar */}
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-3xl font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {user?.data.username?.[0]?.toUpperCase()}
                        </div>

                        {/* Identity */}
                        <div className="space-y-0.5 text-center">
                            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                                {user?.data.username}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {user?.data.email}
                            </p>
                        </div>

                        {/* Provider badge */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Signed in with{" "}
                                <span className="font-medium capitalize text-zinc-700 dark:text-zinc-300">
                                    {user?.data.provider}
                                </span>
                            </span>
                        </div>

                        <p className="max-w-xs text-center text-[11px] text-zinc-400 dark:text-zinc-600">
                            Your profile and password are managed by your{" "}
                            <span className="capitalize">{user?.data.provider}</span> account.
                        </p>
                    </div>
                </section>
            )}

            {/* ── RECENT ORDERS ──────────────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        Recent orders
                    </h2>
                    <Link
                        href="/account/orders"
                        className="text-[11px] font-medium text-zinc-500 underline underline-offset-2 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        View all
                    </Link>
                </div>

                {ordersLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-16 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
                        <p className="text-sm text-zinc-400 dark:text-zinc-600">No orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {orders.slice(0, 3).map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        Order #{order.id}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
                                        ${order.totalAmount?.toFixed(2) ?? "0.00"}
                                    </p>
                                </div>
                                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    {order.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}