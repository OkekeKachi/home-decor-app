"use client";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Home, Loader2, AlertCircle, CheckCircle, Clock, Send } from "lucide-react";

export default function LoginPage() {
    const { login, resendVerification } = useAuth();
    const router = useRouter();

    // Login rate limit cooldown
    const [cooldown, setCooldown] = useState(0);

    // Verification resend states
    const [verificationCooldown, setVerificationCooldown] = useState(0);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState("");
    const [verificationError, setVerificationError] = useState("");

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => {
            setCooldown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    // Verification cooldown timer
    useEffect(() => {
        if (verificationCooldown <= 0) {
            localStorage.removeItem('verificationCooldownExpires');
            return;
        }
        const interval = setInterval(() => {
            setVerificationCooldown(prev => {
                if (prev <= 1) {
                    localStorage.removeItem('verificationCooldownExpires');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [verificationCooldown]);

    // Initialize verification cooldown from localStorage on mount
    useEffect(() => {
        const expiresStr = localStorage.getItem('verificationCooldownExpires');
        if (expiresStr) {
            const expires = parseInt(expiresStr, 10);
            const now = Date.now();
            if (expires > now) {
                const remaining = Math.ceil((expires - now) / 1000);
                setVerificationCooldown(remaining);
            } else {
                localStorage.removeItem('verificationCooldownExpires');
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setVerificationError("");

        try {
            await login(form.email, form.password);
            router.push("/profile");
        } catch (err) {
            const errMsg = err?.response?.data?.message || "Login failed";
            setError(errMsg);

            if (err?.response?.status === 429) {
                const retry = err.response?.data?.retryAfterSeconds || 10;
                setCooldown(retry);
            }
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationEmail = async (email) => {
        if (!email) return;
        if (verificationLoading || verificationCooldown > 0) return;

        setVerificationLoading(true);
        setVerificationError("");
        setVerificationSuccess("");

        try {
            await resendVerification(email);
            setVerificationSuccess("Verification email sent successfully. Please check your inbox (and spam folder).");

            const expires = Date.now() + 300000; // 5 minutes
            localStorage.setItem('verificationCooldownExpires', expires.toString());
            setVerificationCooldown(300);
        } catch (err) {
            if (err?.response?.status === 429) {
                const retry = err.response?.data?.retryAfterSeconds || 300;
                const expires = Date.now() + (retry * 1000);
                localStorage.setItem('verificationCooldownExpires', expires.toString());
                setVerificationCooldown(retry);
                setVerificationError("Too many attempts. Please try again later.");
            } else {
                setVerificationError("Unable to send the verification email. Please try again.");
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (error) setError(""); // Clear error when user starts typing
    };

    const showVerificationUI = (error?.toLowerCase().includes("verify") || verificationCooldown > 0 || verificationSuccess) && form.email;

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C9A66B]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#D4B47A]/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#FAF9F6] p-8 text-center border-b border-gray-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-[#C9A66B]/15 p-3 rounded-full">
                                <Home className="w-8 h-8 text-[#B8924A]" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-[#1C1C1C] mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to your Luxe Home account</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-red-800 text-sm">Login Error</h4>
                                        <p className="text-sm text-red-700">{error}</p>

                                        {cooldown > 0 && (
                                            <div className="mt-3 bg-[#FAF9F6] border border-[#C9A66B]/20 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    {/* Countdown Circle */}
                                                    <div className="relative flex items-center justify-center">
                                                        <svg className="w-10 h-10 -rotate-90">
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
                                                                strokeDashoffset={(1 - cooldown / 90) * (2 * Math.PI * 16)}
                                                                strokeLinecap="round"
                                                                className="transition-all duration-1000 ease-linear"
                                                            />
                                                        </svg>
                                                        <span className="absolute text-sm font-bold text-[#B8924A]">
                                                            {cooldown}s
                                                        </span>
                                                    </div>
                                                    {/* Text */}
                                                    <p className="text-xs font-medium text-[#B8924A] ml-2 text-right">
                                                        Too many attempts<br />
                                                        Please wait…
                                                    </p>
                                                </div>
                                                {/* Thin Progress Bar */}
                                                <div className="mt-2 bg-gray-100 h-1 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-1 bg-[#C9A66B] transition-all duration-1000 ease-linear"
                                                        style={{ width: `${(cooldown / 90) * 100}% ` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showVerificationUI && (
                            <div className="mb-4 space-y-3">
                                {verificationSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start space-x-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-green-800">{verificationSuccess}</p>
                                    </div>
                                )}

                                {verificationError && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800">{verificationError}</p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => sendVerificationEmail(form.email)}
                                    disabled={verificationLoading || verificationCooldown > 0}
                                    className={`w-full flex flex-col items-center justify-center py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border
                                        ${verificationCooldown > 0
                                            ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : verificationLoading
                                                ? "bg-[#C9A66B]/10 text-[#B8924A] border-[#C9A66B]/30 cursor-wait"
                                                : "bg-[#C9A66B]/10 text-[#B8924A] border-[#C9A66B]/30 hover:bg-[#C9A66B]/20 hover:border-[#C9A66B]/50"
                                        }`}
                                >
                                    {verificationLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Sending verification email...</span>
                                        </div>
                                    ) : verificationCooldown > 0 ? (
                                        <div className="flex flex-col items-center">
                                            <span className="flex items-center space-x-1 font-semibold text-gray-700">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Verification email sent</span>
                                            </span>
                                            <span className="text-xs mt-1 text-gray-500">
                                                Resend available in {Math.floor(verificationCooldown / 60)}:{(verificationCooldown % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Send className="w-4 h-4" />
                                            <span>{verificationSuccess ? "Resend verification email" : "Send verification email"}</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A66B]/20 focus:border-[#C9A66B] transition-all duration-200 bg-white text-[#1C1C1C] placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A66B]/20 focus:border-[#C9A66B] transition-all duration-200 bg-white text-[#1C1C1C] placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#B8924A] transition-colors duration-200"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]/20"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-[#B8924A] hover:text-[#A6823C] font-medium hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || cooldown > 0}
                                className="w-full bg-[#935e02] hover:bg-[#774e02] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-4 text-sm text-gray-400 bg-white">or</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        {/* Social Login */}
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center space-x-3 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 py-3 px-6 rounded-xl transition-all duration-200 shadow-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="font-medium text-gray-700">Continue with Google</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-[#B8924A] hover:text-[#A6823C] hover:underline transition-colors"
                                >
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="text-[#B8924A] hover:text-[#A6823C] hover:underline transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-[#B8924A] hover:text-[#A6823C] hover:underline transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}