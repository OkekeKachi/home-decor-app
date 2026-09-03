"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import api from "@/utils/axios";

type VerificationStatus = "loading" | "success" | "error";

interface VerificationResponse {
  message?: string;
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] =
    useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await api.get<VerificationResponse>(
          `/api/auth/verify/${encodeURIComponent(token)}`
        );

        setStatus("success");
        setMessage(
          res.data.message || "Email verified successfully!"
        );

        const redirectTimer = window.setTimeout(() => {
          router.push("/login");
        }, 3000);

        return () => window.clearTimeout(redirectTimer);
      } catch (err: unknown) {
        setStatus("error");

        if (axios.isAxiosError<VerificationResponse>(err)) {
          setMessage(
            err.response?.data?.message ||
            "Verification failed. The token may be expired or invalid."
          );
        } else {
          setMessage(
            "Verification failed. Please try again."
          );
        }
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />

            <h2 className="text-xl font-semibold">
              Verifying your email...
            </h2>

            <p className="text-gray-500 mt-2">
              Please wait while we confirm your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-green-600">
              Email Verified 🎉
            </h2>

            <p className="text-gray-600 mt-2">
              {message}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Redirecting to login...
            </p>

            <Link
              href="/login"
              className="mt-6 inline-block bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-red-600">
              Verification Failed
            </h2>

            <p className="text-gray-600 mt-2">
              {message}
            </p>

            <Link
              href="/register"
              className="mt-6 inline-block bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl transition"
            >
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}