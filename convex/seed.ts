import { mutation } from "./_generated/server";
import { nowIso, requireAdmin } from "./lib";

const starterCategories = [
  { slug: "books", name: "Books", type: "department", sort_order: 10 },
  { slug: "clothing", name: "Clothing", type: "department", sort_order: 11 },
  { slug: "children", name: "Extras", type: "department", sort_order: 12 },
  { slug: "aqeedah", name: "Aqeedah", type: "book_subject", parent_slug: "books", sort_order: 20 },
  { slug: "arabic", name: "Arabic", type: "book_subject", parent_slug: "books", sort_order: 30 },
  { slug: "quran", name: "Qur'an", type: "book_subject", parent_slug: "books", sort_order: 40 },
  { slug: "fiqh", name: "Fiqh", type: "book_subject", parent_slug: "books", sort_order: 50 },
  { slug: "hadith", name: "Hadith", type: "book_subject", parent_slug: "books", sort_order: 60 },
  {
    slug: "purification",
    name: "Purification",
    type: "book_subject",
    parent_slug: "books",
    sort_order: 70,
  },
  { slug: "seerah", name: "Seerah", type: "book_subject", parent_slug: "books", sort_order: 80 },
  { slug: "tafsir", name: "Tafsir", type: "book_subject", parent_slug: "books", sort_order: 90 },
  { slug: "urdu", name: "Urdu", type: "book_subject", parent_slug: "books", sort_order: 100 },
  {
    slug: "character-development",
    name: "Character Development",
    type: "book_subject",
    parent_slug: "books",
    sort_order: 110,
  },
  {
    slug: "womens-issues",
    name: "Women's Issues",
    type: "book_subject",
    parent_slug: "books",
    sort_order: 120,
  },
  {
    slug: "islamic-history",
    name: "Islamic History",
    type: "book_subject",
    parent_slug: "books",
    sort_order: 130,
  },
  {
    slug: "family-marriage",
    name: "Family & Marriage",
    type: "book_subject",
    parent_slug: "books",
    sort_order: 140,
  },
];

const starterSettings = [
  { key: "store_name", value: "Maktabah al-Muhammadiyyah" },
  { key: "checkout_mode", value: "whatsapp" },
  { key: "currency", value: "USD" },
  { key: "whatsapp_channel_url", value: "https://whatsapp.com/channel/0029VbB3VMzCBtx88CK0Hm3Y" },
  { key: "instagram_url", value: "https://www.instagram.com/maktabamuhammadiya.__/" },
];

export const seedStarterStore = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const timestamp = nowIso();
    let categoriesInserted = 0;
    let settingsUpserted = 0;

    for (const category of starterCategories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("categories", {
          ...category,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp,
        });
        categoriesInserted += 1;
      }
    }

    for (const setting of starterSettings) {
      const existing = await ctx.db
        .query("store_settings")
        .withIndex("by_key", (q) => q.eq("key", setting.key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value: setting.value, updated_at: timestamp });
      } else {
        await ctx.db.insert("store_settings", {
          key: setting.key,
          value: setting.value,
          updated_at: timestamp,
        });
      }
      settingsUpserted += 1;
    }

    return { categoriesInserted, settingsUpserted, productsInserted: 0 };
  },
});
