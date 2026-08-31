"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof typeof INITIAL_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (!form.subject.trim()) return "Please enter a subject.";
    if (!form.message.trim()) return "Please enter a message.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send message");
      }

      toast.success("Message sent — we'll be in touch soon.");
      setForm(INITIAL_FORM);
      setSubmitted(true);
    } catch (err) {
      toast.error("We couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#F7F3ED]">
      {/* Hero + Contact Info */}
      <section className="container mx-auto px-8 pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-7">
            <span className="text-xs font-medium tracking-[0.14em] text-[#8B6F47]">
              Get In Touch
            </span>
            <h1 className="mt-4 font-serif text-[#1C1C1C] text-5xl sm:text-6xl leading-[1.08] tracking-tight">
              Let&apos;s talk about your space.
            </h1>
            <p className="mt-6 text-[#1C1C1C]/70 text-lg leading-relaxed max-w-md">
              Questions about a product, an order, or delivery? Send us a
              message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pl-6">
            <div className="lg:border-l lg:border-[#8B6F47]/20 lg:pl-10 space-y-6">
              <p className="text-xs font-medium tracking-[0.14em] text-[#8B6F47]">
                Contact Information
              </p>

              <a
                href="mailto:okekefelix51@gmail.com"
                className="flex items-center gap-3 text-[#1C1C1C] hover:text-[#183C32] transition-colors duration-200 group"
              >
                <span className="w-10 h-10 flex items-center justify-center border border-[#8B6F47]/30 shrink-0">
                  <Mail className="w-4 h-4 text-[#8B6F47]" strokeWidth={1.75} />
                </span>
                <span className="text-sm">okekefelix51@gmail.com</span>
              </a>

              <a
                href="tel:+2347039233521"
                className="flex items-center gap-3 text-[#1C1C1C] hover:text-[#183C32] transition-colors duration-200 group"
              >
                <span className="w-10 h-10 flex items-center justify-center border border-[#8B6F47]/30 shrink-0">
                  <Phone className="w-4 h-4 text-[#8B6F47]" strokeWidth={1.75} />
                </span>
                <span className="text-sm">+234 703 923 3521</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24 border-t border-[#8B6F47]/15">
        {submitted ? (
          <SuccessPanel onReset={() => setSubmitted(false)} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-8">

              <Field
                id="name"
                label="Name"
                value={form.name}
                onChange={handleChange("name")}
                required
                disabled={submitting}
              />

              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
                disabled={submitting}
              />

              <div className="md:col-span-2">
                <Field
                  id="subject"
                  label="Subject"
                  value={form.subject}
                  onChange={handleChange("subject")}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="message"
                  className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-2"
                >
                  Message <span className="text-[#8B6F47]">*</span>
                </label>

                <textarea
                  id="message"
                  rows={7}
                  required
                  disabled={submitting}
                  value={form.message}
                  onChange={handleChange("message")}
                  className="w-full px-0 py-2 bg-transparent border-b border-[#8B6F47]/30 focus:border-[#183C32] outline-none text-sm text-[#1C1C1C] resize-none transition-colors duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-start md:justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-[#183C32] text-white px-9 py-3.5 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-8 pb-20 lg:pb-28 border-t border-[#8B6F47]/15 pt-16">
        <div className="max-w-xl">
          <h2 className="font-serif text-[#1C1C1C] text-2xl sm:text-3xl">
            We&apos;re here to help.
          </h2>
          <p className="mt-3 text-[#1C1C1C]/65 text-sm leading-relaxed">
            Reach out about product questions, an order you&apos;ve placed,
            delivery, returns, or anything else on your mind — we&apos;re
            happy to help.
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-2"
      >
        {label} {required && <span className="text-[#8B6F47]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="w-full px-0 py-2 bg-transparent border-b border-[#8B6F47]/30 focus:border-[#183C32] outline-none text-sm text-[#1C1C1C] transition-colors duration-200 disabled:opacity-60"
      />
    </div>
  );
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="max-w-lg py-8">
      <div className="w-12 h-12 flex items-center justify-center border border-[#C9A66B]/40 mb-6">
        <CheckCircle2 className="w-5 h-5 text-[#183C32]" strokeWidth={1.75} />
      </div>
      <h2 className="font-serif text-[#1C1C1C] text-3xl leading-[1.15]">
        Message received.
      </h2>
      <p className="mt-4 text-[#1C1C1C]/65 text-base leading-relaxed">
        Thank you for reaching out to LuxHome. We&apos;ll get back to you
        as soon as possible.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-sm font-medium tracking-wide text-[#183C32] border-b border-[#C9A66B] pb-1 hover:gap-3 transition-all duration-200"
      >
        Send another message
      </button>
    </div>
  );
}