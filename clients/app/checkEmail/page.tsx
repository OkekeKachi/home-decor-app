import { Suspense } from "react";
import CheckEmailContent from "./CheckEmailContent";

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}