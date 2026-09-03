import { Suspense } from "react";
import PaymentCallbackContent from "./PaymentCallbackContent.tsx";


export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Processing payment...</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}