import Link from "next/link";
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";


/**
 * LuxHome — About page
 * Route: app/about/page.tsx
 * Sits between the existing <Navbar /> and <Footer />. No client state is
 * needed here, so this stays a server component.
 *
 * Team members and categories are kept as flat arrays so names, roles,
 * images and links can be swapped without touching the markup.
 */

const PRINCIPLES = [
  {
    number: "01",
    title: "Intentional",
    description: "Every piece should have a reason to be there.",
  },
  {
    number: "02",
    title: "Timeless",
    description: "We favor designs that remain beautiful beyond passing trends.",
  },
  {
    number: "03",
    title: "Considered",
    description: "Materials, proportions, textures, and finishes matter.",
  },
  {
    number: "04",
    title: "Personal",
    description: "Your home should reflect your taste, not someone else's.",
  },
];

const REASONS = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    description:
      "Thoughtfully selected pieces built to complement your home for years to come.",
  },
  {
    icon: Layers,
    title: "Curated Selection",
    description:
      "Instead of overwhelming you with endless choices, we focus on pieces that belong together.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Shop confidently through secure, trusted payment options.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description:
      "Your order is packaged with care and tracked from checkout to your door.",
  },
];

const CATEGORIES = [
  {
    name: "Furniture",
    href: "/products?category=furniture",
    image:
      "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Textiles",
    href: "/products?category=textiles",
    image:
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Lighting",
    href: "/products?category=lighting",
    image:
      "https://images.unsplash.com/photo-1524634126442-357e0eac3c14?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home Decor",
    href: "/products?category=decor",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
  },
];

// Placeholder team data — swap names, roles and images when ready.
const TEAM = [
  
  {
    name: "Okeke Kachi Felix",
    role: "Developer",
    description: "Kachi built this whole home decor app from scratch, including the front-end and back-end.",
    image:
      "https://my-portfolio-taupe-mu-36.vercel.app/_next/image?url=%2Fimages%2Fprofile%2Fhero.png&w=640&q=75",
  },
  
];

export default function AboutPage() {
  return (
    <main className="bg-[#F7F3ED]">
      <Hero />
      <OurStory />
      <Philosophy />
      <WhyLuxHome />
      <OurCollection />
      <OurTeam />
      <BrandStatement />
      <FinalCTA />
    </main>
  );
}

// ---------------------------------------------------------------------------
// 1. Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 lg:pr-4">
            <span className="text-xs font-medium tracking-[0.14em] text-[#8B6F47]">
              About LuxHome
            </span>
            <h1 className="mt-4 font-serif text-[#1C1C1C] text-5xl sm:text-6xl leading-[1.08] tracking-tight">
              We believe your home should feel like you.
            </h1>
            <p className="mt-6 text-[#1C1C1C]/70 text-lg leading-relaxed max-w-md">
              LuxHome exists to help you build a home that feels considered
              in every corner — through furniture, lighting and decor
              selected for the way you actually live.
            </p>
            <Link
              href="/products"
              className="mt-9 inline-flex items-center gap-2 text-[#183C32] text-sm font-medium tracking-wide border-b border-[#C9A66B] pb-1 hover:gap-3 transition-all duration-200"
            >
              Explore Our Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="aspect-[4/3] lg:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80"
                alt="A warm, editorial-styled living room"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Our Story
// ---------------------------------------------------------------------------

function OurStory() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="lg:order-2 aspect-[4/5] lg:aspect-[5/6]">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=80"
            alt="A carefully styled corner of a home"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:order-1 lg:pr-6">
          <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl leading-[1.15]">
            A home is more than a space.
          </h2>
          <div className="mt-6 space-y-4 text-[#1C1C1C]/70 text-base leading-relaxed max-w-md">
            <p>
              LuxHome began with a simple frustration: building a beautiful
              home shouldn't mean fifteen browser tabs, inconsistent
              quality, and pieces that never quite belong together once
              they arrive.
            </p>
            <p>
              We wanted a single place where furniture, lighting and decor
              were chosen with the same eye — so a room could come together
              the way it looks in your head, not just the way it looks in
              separate listings.
            </p>
            <p>
              That idea shaped everything that followed: a collection built
              around how people actually live at home — mornings before
              anyone else is awake, guests arriving without much notice,
              a Sunday with nowhere to be — rather than what simply
              photographs well.
            </p>
            <p>
              LuxHome is still guided by that same instinct today: fewer,
              better pieces, chosen with intention.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Our Philosophy
// ---------------------------------------------------------------------------

function Philosophy() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24 border-t border-[#8B6F47]/15">
      <div className="max-w-xl">
        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl leading-[1.15]">
          Designed for living. Chosen with intention.
        </h2>
        <p className="mt-4 text-[#1C1C1C]/65 text-base leading-relaxed">
          We focus on pieces that balance beauty, function, quality and
          character — because you're not simply buying objects. You're
          choosing what shapes how your home feels.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        {PRINCIPLES.map((principle) => (
          <div key={principle.number}>
            <span className="font-serif text-2xl text-[#C9A66B]">
              {principle.number}
            </span>
            <h3 className="mt-3 text-[#1C1C1C] text-base font-medium">
              {principle.title}
            </h3>
            <p className="mt-2 text-[#1C1C1C]/60 text-sm leading-relaxed">
              {principle.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. Why LuxHome
// ---------------------------------------------------------------------------

function WhyLuxHome() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl text-center">
        Why LuxHome
      </h2>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="text-center px-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center border border-[#C9A66B]/40">
              <Icon className="w-5 h-5 text-[#C9A66B]" strokeWidth={1.75} />
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

// ---------------------------------------------------------------------------
// 5. Our Collection
// ---------------------------------------------------------------------------

function OurCollection() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24 border-t border-[#8B6F47]/15">
      <div className="max-w-xl">
        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl leading-[1.15]">
          Pieces for every corner of home.
        </h2>
        <p className="mt-3 text-[#1C1C1C]/65 text-base leading-relaxed">
          From the room where you unwind to the one where you rest, LuxHome
          brings together pieces that make each space feel like part of the
          same home.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.name}
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
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. Our Team
// ---------------------------------------------------------------------------

function OurTeam() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-24">
      <div className="max-w-xl">
        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl leading-[1.15]">
          The Man behind LuxHome
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-8">
        {TEAM.map((member) => (
          <div key={member.name}>
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="mt-4 text-[#1C1C1C] text-base font-medium">
              {member.name}
            </h3>
            <p className="text-[#8B6F47] text-xs tracking-wide mt-0.5">
              {member.role}
            </p>
            <p className="mt-2 text-[#1C1C1C]/60 text-sm leading-relaxed">
              {member.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 7. Brand Statement
// ---------------------------------------------------------------------------

function BrandStatement() {
  return (
    <section className="relative">
      <div className="relative h-[420px] lg:h-[480px]">
        <img
          src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1800&q=80"
          alt="A quiet, thoughtfully furnished interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1C1C1C]/45" />
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <p className="font-serif text-white text-3xl sm:text-4xl lg:text-5xl text-center max-w-2xl leading-[1.2]">
            The best spaces aren&apos;t simply decorated. They&apos;re
            lived in.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. Final CTA
// ---------------------------------------------------------------------------

function FinalCTA() {
  return (
    <section className="container mx-auto px-8 py-20 lg:py-28">
      <div className="relative overflow-hidden bg-[#F0E9DC] px-8 py-16 lg:py-20 text-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#183C32] via-[#C9A66B] to-[#183C32]" />
        <h2 className="font-serif text-[#1C1C1C] text-3xl sm:text-4xl max-w-lg mx-auto leading-[1.15]">
          Make space for something beautiful.
        </h2>
        <p className="mt-4 text-[#1C1C1C]/65 text-base max-w-md mx-auto">
          Discover furniture, lighting and decor selected to bring
          character to your home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-[#183C32] text-white px-9 py-3.5 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-200"
          >
            Shop the Collection
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium tracking-wide text-[#183C32] border-b border-[#C9A66B] pb-1 hover:gap-3 transition-all duration-200"
          >
            Get to Know Us
          </Link>
        </div>
      </div>
    </section>
  );
}