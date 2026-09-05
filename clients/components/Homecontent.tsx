"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Sparkles,
  RotateCcw,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import api from "@/utils/axios";
import axios from "axios";


interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
}

interface ProductsResponse {
  data: Product[];
}

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  error: string;
}

const CATEGORIES = [
  {
    id: "furniture",
    name: "Furniture",
    href: "/products?category=furniture",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "textiles",
    name: "Textiles",
    href: "/products?category=textiles",
    image:
      "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "lighting",
    name: "Lighting",
    href: "/products?category=lighting",
    image:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "home-decor",
    name: "Home Decor",
    href: "/products?category=home-decor",
    image:
      "https://images.unsplash.com/photo-1616627988026-4f5e5e7f6a6a?auto=format&fit=crop&w=900&q=80",
  },
];

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Thoughtfully selected pieces built to last.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Enjoy free shipping on every order.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Shop confidently with secure payment options.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Guarantee",
    description: "Love your purchase or send it back.",
  },
];

export default function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get<ProductsResponse>("/api/products", {
          params: {
            page: 1,
            limit: 8,
          },
        });

        setProducts(res.data.data);
      } catch (err: unknown) {
        if (axios.isAxiosError<{ message?: string }>(err)) {
          setError(
            err.response?.data?.message || "Failed to load products"
          );
        } else {
          setError("Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="bg-[#F7F3ED]">
      <Hero />
      <CategorySection />
      <FeaturedProducts
        products={products}
        loading={loading}
        error={error}
      />
      <EditorialSection />
      <BenefitsSection />
      <VisualBreak />
      <FinalCTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 lg:pr-4">
            <h1 className="font-serif text-[#1C1C1C] text-5xl sm:text-6xl leading-[1.08] tracking-tight">
              Transform your space
            </h1>

            <p className="mt-6 text-[#1C1C1C]/70 text-lg leading-relaxed max-w-md">
              Discover timeless pieces designed to bring comfort, character,
              and elegance into every room.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-[#183C32] text-white px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-200"
              >
                Shop Collection
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-[#183C32] text-[#183C32] px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-[#183C32]/5 transition-colors duration-200"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                alt="A sunlit living room styled with warm, natural furniture"
                className="w-full h-full object-cover"
              />

              <div className="absolute -bottom-6 -left-6 hidden sm:block bg-white px-6 py-4 shadow-[0_8px_30px_rgba(28,28,28,0.08)] border border-[#8B6F47]/15">
                <p className="font-serif text-2xl text-[#183C32]">
                  1,200+
                </p>

                <p className="text-xs text-[#1C1C1C]/60 tracking-wide mt-0.5">
                  Pieces curated by our design team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <div className="max-w-xl">
        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl">
          Shop by Category
        </h2>

        <p className="mt-3 text-[#1C1C1C]/65 text-base leading-relaxed">
          Find pieces that make every room feel like home.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative block aspect-[3/4] overflow-hidden"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/55 via-[#1C1C1C]/0 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-serif text-white text-xl">
                {category.name}
              </p>

              <span className="mt-1 inline-flex items-center gap-1.5 text-[#F7F3ED]/85 text-xs tracking-wide translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts({
  products,
  loading,
  error,
}: FeaturedProductsProps) {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <div className="max-w-xl">
        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl">
          Curated For Your Home
        </h2>

        <p className="mt-3 text-[#1C1C1C]/65 text-base leading-relaxed">
          Thoughtfully selected pieces to elevate your everyday spaces.
        </p>
      </div>

      {loading && (
        <p className="mt-12 text-center text-[#1C1C1C]/60">
          Loading products...
        </p>
      )}

      {!loading && error && (
        <p className="mt-12 text-center text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="mt-12 text-center text-[#1C1C1C]/60">
          No products available.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white border border-[#8B6F47]/12">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product._id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white transition-colors duration-200"
        >
          <Heart className="w-4 h-4 text-[#1C1C1C]" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-[#C9A66B]">
          <Star className="w-3.5 h-3.5 fill-[#C9A66B]" />

          <span className="text-xs text-[#1C1C1C]/60">
            {product.rating ?? "New"}
          </span>
        </div>

        <h3 className="mt-1.5 text-[#1C1C1C] text-sm font-medium leading-snug">
          {product.name}
        </h3>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-serif text-[#183C32] text-lg">
            ₦{product.price.toLocaleString()}
          </span>

          <button
            type="button"
            className="text-xs font-medium tracking-wide text-white bg-[#183C32] px-3.5 py-2 hover:bg-[#183C32]/90 transition-colors duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorialSection() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="aspect-[4/5] lg:aspect-[5/6]">
          <img
            src="https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1100&q=80"
            alt="A warm, textured interior styled with natural materials"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:pl-6">
          <span className="text-xs font-medium tracking-[0.14em] text-[#8B6F47]">
            The LuxHome Collection
          </span>

          <h2 className="mt-4 font-serif text-[#1C1C1C] text-3xl sm:text-4xl leading-[1.15]">
            Beautiful spaces begin with beautiful pieces.
          </h2>

          <p className="mt-5 text-[#1C1C1C]/70 text-base leading-relaxed max-w-md">
            At LuxHome, we believe your home should reflect who you are.
            From timeless furniture to carefully selected accents, every
            piece is chosen to help you create a space that feels uniquely
            yours.
          </p>

          <Link
            href="/about"
            className="mt-8 inline-flex items-center justify-center border border-[#183C32] text-[#183C32] px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-[#183C32]/5 transition-colors duration-200"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl text-center">
        Why Choose LuxHome?
      </h2>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="text-center px-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center border border-[#C9A66B]/40">
              <Icon
                className="w-5 h-5 text-[#C9A66B]"
                strokeWidth={1.75}
              />
            </div>

            <h3 className="mt-5 text-[#1C1C1C] text-base font-medium">
              {title}
            </h3>

            <p className="mt-2 text-[#1C1C1C]/60 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VisualBreak() {
  return (
    <section className="relative">
      <div className="relative h-[420px] lg:h-[480px]">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80"
          alt="A minimalist room bathed in afternoon light"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-[#1C1C1C]/35" />

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8">
            <div className="max-w-md">
              <h2 className="font-serif text-white text-3xl sm:text-4xl leading-[1.15]">
                Designed for the way you live.
              </h2>

              <p className="mt-4 text-white/85 text-base leading-relaxed">
                Pieces that turn ordinary rooms into spaces worth coming
                home to.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-white text-sm font-medium tracking-wide border-b border-[#C9A66B] pb-1 hover:gap-3 transition-all duration-200"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-28">
      <div className="relative overflow-hidden bg-[#F0E9DC] px-8 py-16 lg:py-20 text-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#183C32] via-[#C9A66B] to-[#183C32]" />

        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl max-w-lg mx-auto leading-[1.15]">
          Make your space feel like home
        </h2>

        <p className="mt-4 text-[#1C1C1C]/65 text-base">
          Discover pieces you&apos;ll love living with.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-flex items-center justify-center bg-[#183C32] text-white px-9 py-3.5 text-sm font-medium tracking-wide hover:bg-[#183C3‍2]/90 transition-colors duration-200"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}