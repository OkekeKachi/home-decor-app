"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import api from "@/utils/axios";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
        password,
      });

      setSuccess(true);

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          "Reset link is invalid or expired."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-green-600 font-medium text-center">
          Password reset successful. Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-xl shadow"
      >
        <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

        {error && (
          <p
            role="alert"
            className="mb-4 text-sm text-red-700 bg-red-50 p-2 rounded"
          >
            {error}
          </p>
        )}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
          disabled={loading || !token}
          className="w-full border rounded-lg p-2 mb-3"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
          disabled={loading || !token}
          className="w-full border rounded-lg p-2 mb-4"
        />

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}