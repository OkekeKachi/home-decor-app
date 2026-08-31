import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Recipient — the LuxHome inbox that receives contact form messages.
const CONTACT_RECEIVING_EMAIL = "okekefelix51@gmail.com";

// Sender — isolated here so it's easy to swap once a verified Resend
// sending domain is set up. Until then, Resend's shared onboarding
// address works for testing but has deliverability limits.
const FROM_EMAIL = "LuxHome <onboarding@resend.dev>";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = isNonEmptyString(body?.name) ? body.name.trim() : "";
  const email = isNonEmptyString(body?.email) ? body.email.trim() : "";
  const subject = isNonEmptyString(body?.subject) ? body.subject.trim() : "";
  const message = isNonEmptyString(body?.message) ? body.message.trim() : "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Never expose the missing-key detail to the client — log it for
    // whoever's operating the app instead.
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again later." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_RECEIVING_EMAIL,
      replyTo: email,
      subject: `LuxHome contact form: ${subject}`,
      html: `
        <div style="font-family: sans-serif; color: #1C1C1C; line-height: 1.6;">
          <h2 style="color: #183C32; margin-bottom: 16px;">New message from the LuxHome contact form</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error sending contact email:", err);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again." },
      { status: 500 }
    );
  }
}

// Minimal HTML escaping for values interpolated into the email body.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}