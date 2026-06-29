import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Instagram, MessageCircle, Send } from "lucide-react";
import { seo } from "@/lib/seo";

const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbB3VMzCBtx88CK0Hm3Y";
const INSTAGRAM_URL = "https://www.instagram.com/maktabamuhammadiya.__/";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Add the books you want to your bag, complete checkout, and send the prepared order message. Admin will confirm availability and payment details.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. Shipping cost and delivery options are confirmed after the order request is received.",
  },
  {
    q: "When is payment collected?",
    a: "Payment is arranged after admin confirms the books are available and the shipping details are clear.",
  },
  {
    q: "Can I ask about a book before ordering?",
    a: "Yes. Send a message or use Instagram to ask about editions, availability, photos or recommendations.",
  },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...seo({
      title: "Contact Maktabah Muhammadiya",
      description:
        "Contact Maktabah Muhammadiya for book availability, shipping support and customer questions.",
      path: "/contact",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Contact,
});


function Contact() {
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);

  return (
    <div className="container-prose py-10 md:py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl">Contact us</h1>
        <p className="text-muted-foreground mt-2">
          Ask about availability, shipping, payment or recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          {
            i: MessageCircle,
            t: "Order support",
            d: "Send your order request from checkout",
            href: WHATSAPP_CHANNEL,
          },
          {
            i: Send,
            t: "Updates channel",
            d: "Announcements and new books",
            href: WHATSAPP_CHANNEL,
          },
          { i: Instagram, t: "Instagram", d: "@maktabamuhammadiya.__", href: INSTAGRAM_URL },
        ].map(({ i: Icon, t, d, href }) => (
          <a
            key={t}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="border rounded-lg p-5 hover:bg-muted/40 transition-colors"
          >
            <Icon className="h-5 w-5 text-accent mb-3" />
            <div className="font-medium">{t}</div>
            <div className="text-sm text-muted-foreground">{d}</div>
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10 mt-14">
        <div>
          <h2 className="font-display text-2xl mb-4">Send a message</h2>
          {sent ? (
            <p className="text-success">Thanks. Open the message link to send your request.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-3"
            >
              <input
                required
                placeholder="Your name"
                className="w-full border rounded-md px-3 py-3 text-sm bg-background"
              />
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full border rounded-md px-3 py-3 text-sm bg-background"
              />
              <input
                placeholder="Order number (optional)"
                className="w-full border rounded-md px-3 py-3 text-sm bg-background"
              />
              <textarea
                required
                placeholder="How can we help?"
                rows={5}
                className="w-full border rounded-md px-3 py-3 text-sm bg-background"
              />
              <button className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold">
                Prepare message
              </button>
            </form>
          )}
          {sent && (
            <a
              href={WHATSAPP_CHANNEL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold"
            >
              Open message link
            </a>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4">FAQ</h2>
          <div className="border-y">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b last:border-0">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left py-4 flex items-center justify-between gap-3"
                >
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && <p className="pb-4 text-sm text-muted-foreground">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
