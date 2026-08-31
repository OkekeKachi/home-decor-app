"use client";

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#171613] text-white">
      <div className="container mx-auto px-6">

        {/* Main Footer */}
        <div className="py-16 lg:py-20">

          {/* Top Brand Section */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-14 border-b border-white/10">

            <div className="max-w-xl">
              <p className="text-[#56B490] text-xs font-semibold tracking-[0.25em] uppercase mb-5">
                Curated Living
              </p>

              <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
                Make your space
                <br />
                <span className="italic text-white/70">
                  feel like home.
                </span>
              </h2>
            </div>

            <p className="text-white/50 max-w-sm text-sm leading-6">
              Thoughtfully selected furniture and decor
              designed to bring warmth, character and beauty
              into everyday spaces.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-14">

            {/* Brand */}
            <div>
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight"
              >
                Home<span className="text-[#56B490]">Decor.</span>
              </Link>

              <p className="text-white/40 text-sm leading-6 mt-5 max-w-xs">
                Furniture, lighting and decor for spaces
                worth coming home to.
              </p>

              <div className="flex gap-3 mt-7">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#56B490] hover:bg-[#2D6A4F] transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#56B490] hover:bg-[#2D6A4F] transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#56B490] hover:bg-[#2D6A4F] transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-6">
                Shop
              </h3>

              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="/products"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    All Products
                  </Link>
                </li>

                <li>
                  <Link
                    href="/products?category=furniture"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    Furniture
                  </Link>
                </li>

                <li>
                  <Link
                    href="/products?category=decor"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    Home Decor
                  </Link>
                </li>

                <li>
                  <Link
                    href="/products?category=lighting"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    Lighting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer */}
            <div>
              <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-6">
                Customer Care
              </h3>

              <ul className="space-y-4 text-sm">
                <li>
                  <Link
                    href="/orders"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    My Orders
                  </Link>
                </li>

                <li>
                  <Link
                    href="/terms"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>

                <li>
                  <Link
                    href="/privacy"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <a
                    href="mailto:support@homedecor.com"
                    className="text-white/70 hover:text-[#56B490] transition-colors"
                  >
                    Help & Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-6">
                Contact
              </h3>

              <div className="space-y-5 text-sm">

                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-[#56B490] mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">
                    Abuja, Nigeria
                  </span>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-4 h-4 text-[#56B490] mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">
                    +234 800 000 0000
                  </span>
                </div>

                <div className="flex gap-3">
                  <Mail className="w-4 h-4 text-[#56B490] mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">
                    support@homedecor.com
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-white/10 pt-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#56B490] mb-2">
                  Stay inspired
                </p>

                <h3 className="text-xl font-medium">
                  Get new arrivals & design inspiration.
                </h3>
              </div>

              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full md:w-72 bg-white/5 border border-white/10 px-5 py-3.5 text-sm text-white placeholder-white/30 rounded-l-full focus:outline-none focus:border-[#56B490] transition-colors"
                />

                <button
                  type="button"
                  className="px-5 bg-[#2D6A4F] text-white rounded-r-full hover:bg-[#40916C] transition-colors"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} HomeDecor. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/terms"
              className="text-white/30 hover:text-[#56B490] transition-colors"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="text-white/30 hover:text-[#56B490] transition-colors"
            >
              Privacy
            </Link>

            <span className="text-white/20">
              Crafted for beautiful spaces.
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}