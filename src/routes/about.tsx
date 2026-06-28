import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, MessageCircle } from "lucide-react";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...seo({
      title: "About Maktabah Muhammadiya",
      description:
        "Learn about Maktabah Muhammadiya, a curated Islamic bookshop with organized subjects, clear product details and personal order support.",
      path: "/about",
    }),
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-prose text-background">
            <h1 className="font-display text-4xl md:text-6xl max-w-2xl">
              Books selected with care.
            </h1>
          </div>
        </div>
      </section>

      <section className="container-prose py-14 max-w-3xl">
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Maktabah Muhammadiya is built for readers looking for reliable Islamic books, clear
          product details and simple order support. Browse the catalog, send an order request, and
          admin will confirm availability, payment and shipping details directly.
        </p>
      </section>

      <section className="container-prose pb-16 grid md:grid-cols-3 gap-5">
        {[
          {
            i: BookOpen,
            t: "Curated catalog",
            d: "Books are organized by subject so customers can browse quickly.",
          },
          {
            i: MessageCircle,
            t: "Personal order support",
            d: "Every order request is followed up before payment.",
          },
          {
            i: Heart,
            t: "Reader-first",
            d: "Product details, editions and availability can be confirmed before purchase.",
          },
        ].map(({ i: Icon, t, d }) => (
          <div key={t} className="border rounded-lg p-6">
            <Icon className="h-6 w-6 text-accent mb-3" />
            <h3 className="font-display text-xl">{t}</h3>
            <p className="text-sm text-muted-foreground mt-2">{d}</p>
          </div>
        ))}
      </section>

      <section className="container-prose pb-20 text-center">
        <Link
          to="/shop"
          className="inline-flex bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold"
        >
          Shop the collection
        </Link>
      </section>
    </div>
  );
}
