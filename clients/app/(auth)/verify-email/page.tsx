import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}