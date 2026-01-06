"use client";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Home, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const { login, resendVerification } = useAuth();
    const router = useRouter();
    const [cooldown, setCooldown] = useState(0);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;

        const interval = setInterval(() => {
            setCooldown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(form.email, form.password);
            router.push("/profile");
        } catch (err) {
            console.log(err.response?.data?.message);

            if (err?.response?.status === 429) {
                const retry = err.response?.data?.retryAfterSeconds || 10;
                setCooldown(retry);
                setError(err.response?.data?.message || "Too many attempts. Try again later.");
            } else {
                setError(err.response?.data?.message || "Login failed");
                
            }
            // setError(err.response?.data?.message || err.response?.data || "Loginnn failed");
        } finally {
            setLoading(false);
        }
        
    };

    const sendVerificationEmail = async (email) => {
        try {
            await resendVerification(email);    
            alert("Verification email resent. Please check your inbox.");
        } catch (err) {
            alert("Failed to resend verification email.");
        }
    };

    


    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (error) setError(""); // Clear error when user starts typing
    };

    return (
        <div className="min-h-screen  flex items-center justify-center p-6">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-200/20 to-amber-300/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-black p-8 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                <Home className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-300">Sign in to your Luxe Home account</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-red-800 text-sm">Login Error</h4>
                                        <p className="text-sm text-red-700">{error}</p>
                                        {error.includes("verify your email") && (
                                            <button
                                                onClick={() => sendVerificationEmail(form.email)}
                                                className="mt-2 text-amber-700 underline text-sm font-medium hover:text-amber-900"
                                            >
                                                Send verification email
                                            </button>
                                        )}

                                        {cooldown > 0 && (
                                            <div className="mt-2 bg-white border border-amber-200 rounded-lg p-2">
                                                <div className="flex items-center justify-between">
                                                    {/* Countdown Circle */}
                                                    <div className="relative flex items-center justify-center">
                                                        <svg className="w-10 h-10 -rotate-90">
                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="16"
                                                                stroke="#FFE6B3"
                                                                strokeWidth="5"
                                                                fill="transparent"
                                                            />
                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="16"
                                                                stroke="#F59E0B"
                                                                strokeWidth="5"
                                                                fill="transparent"
                                                                strokeDasharray={2 * Math.PI * 16}
                                                                strokeDashoffset={(1 - cooldown / 90) * (2 * Math.PI * 16)}
                                                                strokeLinecap="round"
                                                                className="transition-all duration-1000 ease-linear"
                                                            />
                                                        </svg>

                                                        <span className="absolute text-sm font-bold text-amber-700">
                                                            {cooldown}s
                                                        </span>
                                                    </div>

                                                    {/* Text */}
                                                    <p className="text-xs font-medium text-amber-700 ml-2">
                                                        Too many attempts<br />
                                                        Please wait…
                                                    </p>
                                                </div>

                                                {/* Thin Progress Bar */}
                                                <div className="mt-2 bg-amber-100 h-1 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-1 bg-amber-500 transition-all duration-1000 ease-linear"
                                                        style={{ width: `${(cooldown / 90) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
                                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                    />
                                    <span className="text-sm text-gray-700">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || cooldown > 0}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
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
                            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        {/* Social Login */}
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center space-x-3 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-3 px-6 rounded-xl transition-all duration-200">
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
                                    className="font-semibold text-amber-600 hover:text-amber-700 hover:underline"
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
                        <Link href="/terms" className="text-amber-600 hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-amber-600 hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}