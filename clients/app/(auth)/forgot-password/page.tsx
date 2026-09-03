"use client";

import { useState } from "react";

import api from "@/utils/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post("/api/auth/forgot-password", {
        email: normalizedEmail,
      });

      // Generic message prevents email enumeration.
      setMessage(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err: unknown) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-xl font-semibold">Forgot Password</h1>

        {message && (
          <p
            role="status"
            className="mb-4 rounded bg-green-50 p-2 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={loading}
          className="mb-4 w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}