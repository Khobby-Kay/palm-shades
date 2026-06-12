import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories } from "../src/lib/data/categories";
import { products } from "../src/lib/data/products";
import { services } from "../src/lib/data/services";
import { media } from "../src/lib/media";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories…");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, description: c.description },
      update: { name: c.name, description: c.description },
    });
  }

  console.log("Seeding products…");
  for (const p of products) {
    const category = await prisma.category.findUnique({
      where: { slug: p.categorySlug },
    });
    const productCode = `MOT-${p.id.replace(/^p-/, "").toUpperCase()}`;
    const imagePath = `/images/${p.slug}.jpg`;
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        productCode,
        slug: p.slug,
        name: p.name,
        shortDesc: p.shortDesc,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        currency: p.currency,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        ingredients: p.ingredients,
        usage: p.usage,
        isFeatured: !!p.isFeatured,
        isNew: !!p.isNew,
        isBestSeller: !!p.isBestSeller,
        categoryId: category?.id,
        images: {
          create: [{ url: imagePath, alt: p.name, position: 0 }],
        },
      },
      update: {
        productCode,
        name: p.name,
        shortDesc: p.shortDesc,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        currency: p.currency,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        ingredients: p.ingredients,
        usage: p.usage,
        isFeatured: !!p.isFeatured,
        isNew: !!p.isNew,
        isBestSeller: !!p.isBestSeller,
        categoryId: category?.id,
      },
    });
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: row.id },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: row.id, url: imagePath, alt: p.name, position: 0 },
      });
    }
  }

  console.log("Seeding services…");
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        description: s.description,
        shortDesc: s.shortDesc,
        durationMin: s.durationMin,
        price: s.price,
        currency: s.currency,
        ageRange: s.ageRange,
        preparation: s.preparation,
        isFeatured: !!s.isFeatured,
      },
      update: {
        name: s.name,
        description: s.description,
        shortDesc: s.shortDesc,
        durationMin: s.durationMin,
        price: s.price,
        currency: s.currency,
        ageRange: s.ageRange,
        preparation: s.preparation,
        isFeatured: !!s.isFeatured,
      },
    });
  }

  console.log("Seeding admin user…");
  const adminHash = await bcrypt.hash("Palm Shades2024!", 10);
  await prisma.user.upsert({
    where: { email: "admin@palmshades.com" },
    create: {
      email: "admin@palmshades.com",
      name: "Palm Shades Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
    update: { passwordHash: adminHash, role: "ADMIN", name: "Palm Shades Admin" },
  });

  console.log("Seeding gallery…");
  const gallerySeeds = [
    { title: "Inside Palm Shades", span: "row-span-2 col-span-1", variant: "rose" },
    { title: "Sleek bob", span: "col-span-2 row-span-1", variant: "ivory" },
    { title: "Signature braids", span: "col-span-1", variant: "blush" },
    { title: "Natural hair joy", span: "col-span-1", variant: "gold" },
    { title: "Occasion glam", span: "col-span-1", variant: "rose" },
    { title: "Makeup in session", span: "col-span-1", variant: "ivory" },
    { title: "Salon braiding", span: "col-span-1", variant: "blush" },
    { title: "Creative colour", span: "col-span-1", variant: "gold" },
    { title: "Artistic styling", span: "col-span-1", variant: "charcoal" },
    { title: "Wash & finish", span: "col-span-1", variant: "blush" },
    { title: "Studio finish", span: "col-span-1", variant: "rose" },
    { title: "Hair cuffs", span: "col-span-1", variant: "ivory" },
    { title: "High ponytail braids", span: "col-span-2 row-span-1", variant: "blush" },
    { title: "Creative beauty", span: "col-span-1", variant: "gold" },
    { title: "Salon mirror", span: "col-span-1", variant: "charcoal" },
    { title: "Mirror moment", span: "col-span-1", variant: "rose" },
  ];
  const galleryImages = [...media.gallery];
  const existingGallery = await prisma.galleryItem.findMany({
    orderBy: { position: "asc" },
  });
  for (let i = 0; i < gallerySeeds.length; i++) {
    const g = gallerySeeds[i];
    const imageUrl = galleryImages[i] ?? galleryImages[0];
    const existing = existingGallery[i];
    if (existing) {
      await prisma.galleryItem.update({
        where: { id: existing.id },
        data: { ...g, imageUrl, position: i, alt: g.title, isActive: true },
      });
    } else {
      await prisma.galleryItem.create({
        data: { ...g, imageUrl, position: i, alt: g.title },
      });
    }
  }
  await prisma.galleryItem.updateMany({
    where: { position: { gte: gallerySeeds.length } },
    data: { isActive: false },
  });

  console.log("Seeding sample reviews…");
  const sampleReviews = [
    {
      authorName: "Akosua Mensah",
      rating: 5,
      title: "Premium experience, every visit",
      body: "Palm Shades feels like a true beauty house — calm, polished, and the styling is consistently flawless. My new go-to in Accra.",
    },
    {
      authorName: "Maame Adjoa",
      rating: 5,
      title: "Worth every cedi",
      body: "Nails, hair and makeup all in one place — and done at a really premium standard. The atmosphere alone is worth the visit.",
    },
  ];
  for (const r of sampleReviews) {
    const exists = await prisma.review.findFirst({
      where: { authorName: r.authorName, body: r.body },
    });
    if (!exists) {
      await prisma.review.create({ data: r });
    }
  }

  console.log("Done.");
  console.log("Admin login: admin@palmshades.com / Palm Shades2024!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
