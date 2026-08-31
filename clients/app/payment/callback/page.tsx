"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { CheckCircle, AlertCircle, AlertTriangle, Lock } from "lucide-react";

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthorized' | 'missing'>('loading');
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setMessage("Payment reference not found.");
      setStatus('missing');
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) {
          setMessage("You are not logged in.");
          setStatus('unauthorized');
          return;
        }

        const response = await fetch(
          "http://localhost:3001/api/order/confirmPayment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              reference,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Payment verification failed.");
          setStatus('error');
          return;
        }

        setMessage("Payment successful!");
        setStatus('success');

        setTimeout(() => {
          router.push("/order");
        }, 2500);
      } catch (error) {
        console.error("Payment verification error:", error);
        setMessage("Something went wrong while verifying payment.");
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-6 transition-opacity duration-500">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-[#8B6F47]/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[#183C32] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">Verifying your payment</h1>
              <p className="text-[#8B6F47] text-sm md:text-base leading-relaxed">
                Please wait while we confirm your transaction securely.
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center space-y-6 transition-opacity duration-500">
            <div className="w-16 h-16 bg-[#183C32]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#183C32]" />
            </div>
            <div className="w-full">
              <h1 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">Payment Successful</h1>
              <p className="text-[#8B6F47] text-sm md:text-base leading-relaxed mb-6">
                Thank you for your purchase. You will be redirected to your orders shortly.
              </p>
              <div className="w-full bg-[#8B6F47]/10 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#183C32]"
                  style={{ width: '100%', animation: 'shrink 2.5s linear forwards' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center space-y-6 transition-opacity duration-500">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">Payment Verification Failed</h1>
              <p className="text-[#8B6F47] text-sm md:text-base leading-relaxed mb-6">
                {message}
              </p>
              <button
                onClick={() => router.push("/order")}
                className="inline-flex items-center justify-center space-x-2 bg-[#183C32] text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-300 rounded-sm w-full sm:w-auto"
              >
                <span>Return to Orders</span>
              </button>
            </div>
          </div>
        )}

        {/* Missing Reference State */}
        {status === 'missing' && (
          <div className="flex flex-col items-center space-y-6 transition-opacity duration-500">
            <div className="w-16 h-16 bg-[#8B6F47]/10 border border-[#8B6F47]/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[#8B6F47]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">Payment Reference Not Found</h1>
              <p className="text-[#8B6F47] text-sm md:text-base leading-relaxed mb-6">
                We couldn't locate the transaction details. Please check your orders or try again.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/order")}
                  className="inline-flex items-center justify-center space-x-2 bg-[#183C32] text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-300 rounded-sm w-full sm:w-auto"
                >
                  <span>View Orders</span>
                </button>
                <button
                  onClick={() => router.push("/products")}
                  className="inline-flex items-center justify-center space-x-2 border border-[#8B6F47]/30 text-[#1C1C1C] px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#8B6F47]/5 transition-colors duration-300 rounded-sm w-full sm:w-auto"
                >
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unauthorized State */}
        {status === 'unauthorized' && (
          <div className="flex flex-col items-center space-y-6 transition-opacity duration-500">
            <div className="w-16 h-16 bg-[#8B6F47]/10 border border-[#8B6F47]/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#8B6F47]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">Authentication Required</h1>
              <p className="text-[#8B6F47] text-sm md:text-base leading-relaxed mb-6">
                Please log in to verify your payment and view your orders.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center justify-center space-x-2 bg-[#183C32] text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-300 rounded-sm w-full sm:w-auto"
              >
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}