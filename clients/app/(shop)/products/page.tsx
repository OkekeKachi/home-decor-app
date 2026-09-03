import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED]">
          <p className="text-[#1C1C1C]/60 text-sm">
            Loading products...
          </p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}