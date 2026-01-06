"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [status, setStatus] = useState("");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!email) return;

    const interval = setInterval(async () => {
      try {
        setChecking(true);

        const res = await api.post("/api/auth/check-verification", { email });

        if (res.data?.verified) {
          clearInterval(interval);
          router.push("/login?verified=true");
        }
      } catch (err) {
        // silence to avoid revealing info
      } finally {
        setChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [email, router]);

  const resend = async () => {
    try {
      setStatus("");
      await api.post("/api/auth/resend-verification", { email });

      setStatus(
        "If an account exists for this email, a verification link has been sent."
      );
    } catch {
      setStatus(
        "If an account exists for this email, a verification link has been sent."
      );
    }
  };

  return (
    <main className="max-w-md mx-auto text-center mt-20 px-4">
      <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>

      <p className="text-gray-600 mb-2">
        A verification link was sent to:
        <br />
        <span className="font-semibold">{email || "your email"}</span>
      </p>

      <p className="text-sm text-gray-500 mb-6">
        This page will automatically redirect once your email is verified.
      </p>

      {checking && (
        <p className="text-blue-600 text-sm mb-2">Checking verification…</p>
      )}

      {status && <p className="text-green-700 text-sm mb-4">{status}</p>}

      <button
        onClick={resend}
        className="px-4 py-2 bg-black text-white rounded-md"
      >
        Resend Verification Email
      </button>

      <p className="mt-6 text-sm">
        Wrong email?{" "}
        <a className="underline" href="/register">
          Register again
        </a>
      </p>
    </main>
  );
}
