"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Home,
    Loader2,
    AlertCircle,
    CheckCircle,
    Send,
} from "lucide-react";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";    

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { login, resendVerification } = useAuth();
    const router = useRouter();

    const [cooldown, setCooldown] = useState(0);
    const [verificationCooldown, setVerificationCooldown] = useState(0);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState("");
    const [verificationError, setVerificationError] = useState("");

    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;

        const interval = setInterval(() => {
            setCooldown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    // Verification cooldown timer
    useEffect(() => {
        if (verificationCooldown <= 0) {
            localStorage.removeItem("verificationCooldownExpires");
            return;
        }

        const interval = setInterval(() => {
            setVerificationCooldown((prev) => {
                if (prev <= 1) {
                    localStorage.removeItem("verificationCooldownExpires");
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [verificationCooldown]);

    // Restore verification cooldown after refresh
    useEffect(() => {
        const expiresStr = localStorage.getItem(
            "verificationCooldownExpires"
        );

        if (!expiresStr) return;

        const expires = Number.parseInt(expiresStr, 10);
        const now = Date.now();

        if (expires > now) {
            const remaining = Math.ceil((expires - now) / 1000);
            setVerificationCooldown(remaining);
        } else {
            localStorage.removeItem("verificationCooldownExpires");
        }
    }, []);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const email = form.email.trim().toLowerCase();

        if (!email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        if (cooldown > 0) return;

        setLoading(true);
        setError("");
        setVerificationError("");
        setVerificationSuccess("");

        try {
            await login(email, form.password);
            router.push("/profile");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Login failed. Please check your credentials and try again.";

                setError(errorMessage);

                if (err.response?.status === 429) {
                    const retry = err.response.data?.retryAfterSeconds ?? 10;
                    setCooldown(Math.max(retry, 1));
                }
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationEmail = async (email: string) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) return;
        if (verificationLoading || verificationCooldown > 0) return;

        setVerificationLoading(true);
        setVerificationError("");
        setVerificationSuccess("");

        try {
            await resendVerification(normalizedEmail);

            setVerificationSuccess(
                "Verification email sent successfully. Please check your inbox and spam folder."
            );

            const expires = Date.now() + 300000;

            localStorage.setItem(
                "verificationCooldownExpires",
                expires.toString()
            );

            setVerificationCooldown(300);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 429) {
                const retry = err.response.data?.retryAfterSeconds ?? 300;

                const expires = Date.now() + retry * 1000;

                localStorage.setItem(
                    "verificationCooldownExpires",
                    expires.toString()
                );

                setVerificationCooldown(retry);
                setVerificationError(
                    "Too many attempts. Please try again later."
                );
            } else {
                setVerificationError(
                    "Unable to send the verification email. Please try again."
                );
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleInputChange = (
        field: keyof LoginForm,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const showVerificationUI =
        Boolean(form.email) &&
        (error.toLowerCase().includes("verify") ||
            verificationCooldown > 0 ||
            Boolean(verificationSuccess) ||
            Boolean(verificationError));

    const cooldownProgress = Math.min(
        (cooldown / 90) * 100,
        100
    );

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#C9A66B]/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#D4B47A]/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Main Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                    {/* Header */}
                    <div className="border-b border-gray-100 bg-[#FAF9F6] p-8 text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="rounded-full bg-[#C9A66B]/15 p-3">
                                <Home className="h-8 w-8 text-[#B8924A]" />
                            </div>
                        </div>

                        <h1 className="mb-2 font-serif text-3xl font-bold text-[#1C1C1C]">
                            Welcome Back
                        </h1>

                        <p className="text-gray-500">
                            Sign in to your Luxe Home account
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {/* Login Error */}
                        {error && (
                            <div
                                className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4"
                                role="alert"
                            >
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-red-800">
                                            Login Error
                                        </h4>

                                        <p className="text-sm text-red-700">
                                            {error}
                                        </p>

                                        {cooldown > 0 && (
                                            <div className="mt-3 rounded-lg border border-[#C9A66B]/20 bg-[#FAF9F6] p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="relative flex items-center justify-center">
                                                        <svg
                                                            className="h-10 w-10 -rotate-90"
                                                            viewBox="0 0 40 40"
                                                            aria-hidden="true"
                                                        >
                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="16"
                                                                stroke="#E5E7EB"
                                                                strokeWidth="5"
                                                                fill="transparent"
                                                            />

                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="16"
                                                                stroke="#C9A66B"
                                                                strokeWidth="5"
                                                                fill="transparent"
                                                                strokeDasharray={2 * Math.PI * 16}
                                                                strokeDashoffset={
                                                                    (1 - cooldownProgress / 100) *
                                                                    (2 * Math.PI * 16)
                                                                }
                                                                strokeLinecap="round"
                                                                className="transition-all duration-1000 ease-linear"
                                                            />
                                                        </svg>

                                                        <span className="absolute text-sm font-bold text-[#B8924A]">
                                                            {cooldown}s
                                                        </span>
                                                    </div>

                                                    <p className="ml-2 text-right text-xs font-medium text-[#B8924A]">
                                                        Too many attempts
                                                        <br />
                                                        Please wait…
                                                    </p>
                                                </div>

                                                <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-1 bg-[#C9A66B] transition-all duration-1000 ease-linear"
                                                        style={{
                                                            width: `${cooldownProgress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification */}
                        {showVerificationUI && (
                            <div className="mb-4 space-y-3">
                                {verificationSuccess && (
                                    <div
                                        className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-3"
                                        role="status"
                                    >
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                                        <p className="text-sm text-green-800">
                                            {verificationSuccess}
                                        </p>
                                    </div>
                                )}

                                {verificationError && (
                                    <div
                                        className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3"
                                        role="alert"
                                    >
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                        <p className="text-sm text-red-800">
                                            {verificationError}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        sendVerificationEmail(form.email)
                                    }
                                    disabled={
                                        verificationLoading ||
                                        verificationCooldown > 0
                                    }
                                    className={`flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${verificationCooldown > 0
                                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                                            : verificationLoading
                                                ? "cursor-wait border-[#C9A66B]/30 bg-[#C9A66B]/10 text-[#B8924A]"
                                                : "border-[#C9A66B]/30 bg-[#C9A66B]/10 text-[#B8924A] hover:border-[#C9A66B]/50 hover:bg-[#C9A66B]/20"
                                        }`}
                                >
                                    {verificationLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sending verification email...
                                        </span>
                                    ) : verificationCooldown > 0 ? (
                                        <span className="flex flex-col items-center">
                                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                                                <CheckCircle className="h-4 w-4" />
                                                Verification email sent
                                            </span>

                                            <span className="mt-1 text-xs text-gray-500">
                                                Resend available in{" "}
                                                {Math.floor(
                                                    verificationCooldown / 60
                                                )}
                                                :
                                                {(verificationCooldown % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            {verificationSuccess
                                                ? "Resend verification email"
                                                : "Send verification email"}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Email */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-[#1C1C1C] placeholder-gray-400 transition-all duration-200 focus:border-[#C9A66B] focus:outline-none focus:ring-2 focus:ring-[#C9A66B]/20 disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-12 text-[#1C1C1C] placeholder-gray-400 transition-all duration-200 focus:border-[#C9A66B] focus:outline-none focus:ring-2 focus:ring-[#C9A66B]/20 disabled:bg-gray-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-[#B8924A]"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[#C9A66B] focus:ring-[#C9A66B]/20"
                                    />

                                    <span className="text-sm text-gray-600">
                                        Remember me
                                    </span>
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-[#B8924A] transition-colors hover:text-[#A6823C] hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || cooldown > 0}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#935e02] px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#774e02] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center">
                            <div className="flex-1 border-t border-gray-200" />
                            <span className="bg-white px-4 text-sm text-gray-400">
                                or
                            </span>
                            <div className="flex-1 border-t border-gray-200" />
                        </div>

                        {/* Google Login */}
                        <div>
                            <button
                                type="button"
                                disabled
                                title="Google login is not available yet"
                                className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3 opacity-60 shadow-sm"
                            >
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>

                                <span className="font-medium text-gray-700">
                                    Continue with Google
                                </span>
                            </button>
                        </div>

                        {/* Sign Up */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-[#B8924A] transition-colors hover:text-[#A6823C] hover:underline"
                                >
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        By signing in, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="text-[#B8924A] transition-colors hover:text-[#A6823C] hover:underline"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="text-[#B8924A] transition-colors hover:text-[#A6823C] hover:underline"
                        >
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}