import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../../API";

const authCfg = () => {
    const token = localStorage.getItem("session_token");

    return {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 15000,
    };
};

const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getInitial = (name = "") => {
    return String(name || "U").trim().charAt(0).toUpperCase() || "U";
};

const getStatusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "active") {
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    if (s === "expired") {
        return "bg-red-100 text-red-700 border-red-200";
    }

    if (s === "none") {
        return "bg-slate-100 text-slate-700 border-slate-200";
    }

    if (s === "not_required") {
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
};

const getStatusLabel = (status) => {
    if (status === "not_required") return "Not Required";
    if (!status) return "None";
    return String(status).replaceAll("_", " ");
};

const AdminSubscriptionUsers = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1,
    });

    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [filters, setFilters] = useState({
        search: "",
        role: "all",
        subscriptionStatus: "all",
        approved: "all",
    });

    const [selectedUser, setSelectedUser] = useState(null);

    const [extendForm, setExtendForm] = useState({
        days: "",
        months: "",
        years: "",
        plan: "monthly",
        reason: "",
    });

    const fetchUsers = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            params.set("page", String(pagination.page));
            params.set("limit", String(pagination.limit));

            if (filters.search.trim()) {
                params.set("search", filters.search.trim());
            }

            if (filters.role !== "all") {
                params.set("role", filters.role);
            }

            if (filters.subscriptionStatus !== "all") {
                params.set("subscriptionStatus", filters.subscriptionStatus);
            }

            if (filters.approved !== "all") {
                params.set("approved", filters.approved);
            }

            const res = await axios.get(
                `${API.ADMIN_USER_SUBSCRIPTIONS}?${params.toString()}`,
                authCfg()
            );

            setUsers(res.data?.data || []);
            setPagination((prev) => ({
                ...prev,
                total: res.data?.total || 0,
                page: res.data?.page || prev.page,
                limit: res.data?.limit || prev.limit,
                totalPages: res.data?.totalPages || 1,
            }));
        } catch (err) {
            console.error("Fetch subscription users error:", err);
            toast.error(
                err?.response?.data?.message || "Failed to fetch subscription users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.search,
        filters.role,
        filters.subscriptionStatus,
        filters.approved,
        pagination.page,
        pagination.limit,
    ]);

    const summary = useMemo(() => {
        const total = users.length;

        const active = users.filter(
            (u) => u.subscription?.effectiveStatus === "active"
        ).length;

        const expired = users.filter(
            (u) => u.subscription?.effectiveStatus === "expired"
        ).length;

        const none = users.filter(
            (u) => u.subscription?.effectiveStatus === "none"
        ).length;

        const notRequired = users.filter(
            (u) => u.subscription?.effectiveStatus === "not_required"
        ).length;

        return { total, active, expired, none, notRequired };
    }, [users]);

    const updateFilter = (key, value) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const openExtendModal = (user) => {
        setSelectedUser(user);

        const currentPlan = user?.subscription?.plan || "monthly";

        setExtendForm({
            days: "",
            months: "",
            years: "",
            plan: currentPlan === "yearly" ? "yearly" : "monthly",
            reason: "",
        });
    };

    const closeExtendModal = () => {
        if (updating) return;
        setSelectedUser(null);
    };

    const setQuickValidity = (type) => {
        if (type === "15days") {
            setExtendForm((prev) => ({
                ...prev,
                days: "15",
                months: "",
                years: "",
                plan: "monthly",
            }));
        }

        if (type === "1month") {
            setExtendForm((prev) => ({
                ...prev,
                days: "",
                months: "1",
                years: "",
                plan: "monthly",
            }));
        }

        if (type === "1year") {
            setExtendForm((prev) => ({
                ...prev,
                days: "",
                months: "",
                years: "1",
                plan: "yearly",
            }));
        }
    };

    const handleExtendSubscription = async (e) => {
        e.preventDefault();

        if (!selectedUser?._id) {
            toast.error("No user selected.");
            return;
        }

        const days = Number(extendForm.days || 0);
        const months = Number(extendForm.months || 0);
        const years = Number(extendForm.years || 0);

        if (days <= 0 && months <= 0 && years <= 0) {
            toast.error("Please enter days, months or years to extend.");
            return;
        }

        setUpdating(true);

        try {
            const payload = {
                days,
                months,
                years,
                plan: extendForm.plan,
                reason: extendForm.reason,
            };

            const res = await axios.patch(
                API.EXTEND_USER_SUBSCRIPTION(selectedUser._id),
                payload,
                authCfg()
            );

            const updated = res.data?.data;

            toast.success(res.data?.message || "Subscription extended successfully.");

            if (updated?._id) {
                setUsers((prev) =>
                    prev.map((user) =>
                        String(user._id) === String(updated._id)
                            ? {
                                ...user,
                                ...updated,
                                subscription: updated.subscription || user.subscription,
                            }
                            : user
                    )
                );
            } else {
                await fetchUsers();
            }

            closeExtendModal();
        } catch (err) {
            console.error("Extend subscription error:", err);
            toast.error(
                err?.response?.data?.message || "Failed to extend subscription."
            );
        } finally {
            setUpdating(false);
        }
    };

    const goToPage = (nextPage) => {
        const safePage = Math.min(
            Math.max(Number(nextPage) || 1, 1),
            pagination.totalPages || 1
        );

        setPagination((prev) => ({ ...prev, page: safePage }));
    };

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="bg-gradient-to-r from-slate-900 via-teal-800 to-emerald-700 px-4 py-5 sm:px-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white sm:text-2xl">
                                User Subscription Management
                            </h2>
                            <p className="mt-1 text-sm text-emerald-50">
                                View all users, check validity, and extend subscription manually.
                            </p>
                        </div>

                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-5">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Showing
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {summary.total}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            Active
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-700">
                            {summary.active}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                            Expired
                        </p>
                        <p className="mt-1 text-2xl font-bold text-red-700">
                            {summary.expired}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            No Plan
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-700">
                            {summary.none}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                            Admin
                        </p>
                        <p className="mt-1 text-2xl font-bold text-indigo-700">
                            {summary.notRequired}
                        </p>
                    </div>
                </div>

                <div className="border-b border-slate-100 bg-white p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div className="xl:col-span-2">
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Search User
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => updateFilter("search", e.target.value)}
                                placeholder="Name, email, phone, GSTIN, transport ID..."
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Role
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => updateFilter("role", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">RRI Users</option>
                                <option value="transportUser">Transport Users</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Subscription
                            </label>
                            <select
                                value={filters.subscriptionStatus}
                                onChange={(e) =>
                                    updateFilter("subscriptionStatus", e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="none">No Subscription</option>
                                <option value="not_required">Not Required</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Approval
                            </label>
                            <select
                                value={filters.approved}
                                onChange={(e) => updateFilter("approved", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            >
                                <option value="all">All</option>
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                            <div className="text-center">
                                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                                <p className="text-sm font-medium text-slate-600">
                                    Loading users...
                                </p>
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                                    <span className="text-3xl">👤</span>
                                </div>
                                <p className="text-lg font-semibold text-slate-700">
                                    No users found
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Try changing search or filter options.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 xl:block">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                User
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Approval
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Subscription
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Validity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Days Left
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {users.map((user) => {
                                            const sub = user.subscription || {};
                                            const status = sub.effectiveStatus || "none";
                                            const isAdmin = user.role === "admin";

                                            return (
                                                <tr
                                                    key={user._id}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                                                                {getInitial(user.name)}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-slate-900">
                                                                    {user.name || "Unnamed User"}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {user.email || "No email"}
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                    {user.phone || "No phone"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                                                            {user.role}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isApproved
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                                }`}
                                                        >
                                                            {user.isApproved ? "Approved" : "Pending"}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1">
                                                            <span
                                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
                                                                    status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(status)}
                                                            </span>

                                                            <p className="text-xs text-slate-500">
                                                                Plan: {sub.plan || "N/A"}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm text-slate-700">
                                                        <div>
                                                            <p>
                                                                <span className="font-semibold">Start:</span>{" "}
                                                                {formatDate(sub.startsAt)}
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">End:</span>{" "}
                                                                {formatDate(sub.endsAt)}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${sub.isActive
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                                }`}
                                                        >
                                                            {sub.isActive
                                                                ? `${sub.daysRemaining || 0} days`
                                                                : "0 days"}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            onClick={() => openExtendModal(user)}
                                                            disabled={isAdmin}
                                                            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                                        >
                                                            Extend
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile / Tablet Cards */}
                            <div className="grid grid-cols-1 gap-4 xl:hidden">
                                {users.map((user) => {
                                    const sub = user.subscription || {};
                                    const status = sub.effectiveStatus || "none";
                                    const isAdmin = user.role === "admin";

                                    return (
                                        <div
                                            key={user._id}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                                                    {getInitial(user.name)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h3 className="truncate text-base font-bold text-slate-900">
                                                                {user.name || "Unnamed User"}
                                                            </h3>
                                                            <p className="break-all text-sm text-slate-500">
                                                                {user.email || "No email"}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                {user.phone || "No phone"}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(
                                                                status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(status)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                        <div className="rounded-xl bg-slate-50 p-3">
                                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                                Role
                                                            </p>
                                                            <p className="mt-1 font-bold capitalize text-slate-800">
                                                                {user.role}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-slate-50 p-3">
                                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                                Approval
                                                            </p>
                                                            <p
                                                                className={`mt-1 font-bold ${user.isApproved
                                                                        ? "text-emerald-700"
                                                                        : "text-yellow-700"
                                                                    }`}
                                                            >
                                                                {user.isApproved ? "Approved" : "Pending"}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-slate-50 p-3">
                                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                                Plan
                                                            </p>
                                                            <p className="mt-1 font-bold capitalize text-slate-800">
                                                                {sub.plan || "N/A"}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-slate-50 p-3">
                                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                                Days Left
                                                            </p>
                                                            <p className="mt-1 font-bold text-slate-800">
                                                                {sub.isActive
                                                                    ? `${sub.daysRemaining || 0} days`
                                                                    : "0 days"}
                                                            </p>
                                                        </div>

                                                        <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                                Validity
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-700">
                                                                {formatDate(sub.startsAt)} →{" "}
                                                                {formatDate(sub.endsAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => openExtendModal(user)}
                                                        disabled={isAdmin}
                                                        className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                                    >
                                                        Extend Subscription
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing page{" "}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.totalPages}
                                    </span>{" "}
                                    — Total{" "}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.total}
                                    </span>{" "}
                                    users
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => goToPage(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        onClick={() => goToPage(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedUser && (
                // <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
                <div className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm p-0 sm:items-center sm:p-4">
                    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Extend Subscription
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {selectedUser.name} • {selectedUser.email}
                                    </p>
                                </div>

                                <button
                                    onClick={closeExtendModal}
                                    disabled={updating}
                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleExtendSubscription} className="p-5 sm:p-6">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Current Status
                                        </p>
                                        <p className="mt-1 font-bold capitalize text-slate-900">
                                            {getStatusLabel(
                                                selectedUser.subscription?.effectiveStatus
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Current Plan
                                        </p>
                                        <p className="mt-1 font-bold capitalize text-slate-900">
                                            {selectedUser.subscription?.plan || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Current Expiry
                                        </p>
                                        <p className="mt-1 font-bold text-slate-900">
                                            {formatDateTime(selectedUser.subscription?.endsAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Days Left
                                        </p>
                                        <p className="mt-1 font-bold text-slate-900">
                                            {selectedUser.subscription?.isActive
                                                ? `${selectedUser.subscription?.daysRemaining || 0} days`
                                                : "0 days"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <p className="mb-2 text-sm font-semibold text-slate-700">
                                    Quick Validity
                                </p>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <button
                                        type="button"
                                        onClick={() => setQuickValidity("15days")}
                                        className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
                                    >
                                        +15 Days
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickValidity("1month")}
                                        className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
                                    >
                                        +1 Month
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickValidity("1year")}
                                        className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
                                    >
                                        +1 Year
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                                        Days
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={extendForm.days}
                                        onChange={(e) =>
                                            setExtendForm((prev) => ({
                                                ...prev,
                                                days: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                                        Months
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={extendForm.months}
                                        onChange={(e) =>
                                            setExtendForm((prev) => ({
                                                ...prev,
                                                months: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                                        Years
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={extendForm.years}
                                        onChange={(e) =>
                                            setExtendForm((prev) => ({
                                                ...prev,
                                                years: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Plan
                                </label>
                                <select
                                    value={extendForm.plan}
                                    onChange={(e) =>
                                        setExtendForm((prev) => ({
                                            ...prev,
                                            plan: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Reason / Note
                                </label>
                                <textarea
                                    rows={3}
                                    value={extendForm.reason}
                                    onChange={(e) =>
                                        setExtendForm((prev) => ({
                                            ...prev,
                                            reason: e.target.value,
                                        }))
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                    placeholder="Example: Manual extension by admin..."
                                />
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeExtendModal}
                                    disabled={updating}
                                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {updating ? "Updating..." : "Extend Validity"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubscriptionUsers;