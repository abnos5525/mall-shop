-- Phase 4: categories and offers

CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

DROP TABLE IF EXISTS "SchemaBootstrap";

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

CREATE TABLE "Offer" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "merchantName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "priceCurrent" DECIMAL(18,2) NOT NULL,
    "priceReference" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "validUntil" TIMESTAMP(3),
    "terms" TEXT,
    "disclosureLabel" TEXT,
    "destinationUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "checkedAt" TIMESTAMP(3),
    "createdByAdminId" UUID,
    "updatedByAdminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Offer_slug_key" ON "Offer"("slug");
CREATE INDEX "Offer_status_publishedAt_idx" ON "Offer"("status", "publishedAt" DESC);
CREATE INDEX "Offer_categoryId_status_idx" ON "Offer"("categoryId", "status");

ALTER TABLE "Offer" ADD CONSTRAINT "Offer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Category" ("id", "nameFa", "nameEn", "description", "sortOrder", "isActive", "updatedAt") VALUES
  ('tech', 'فناوری', 'Tech', 'ابزار و گجت‌های فناوری', 0, true, CURRENT_TIMESTAMP),
  ('business-tools', 'ابزار کسب‌وکار', 'Business tools', 'نرم‌افزار و سرویس‌های کسب‌وکار', 1, true, CURRENT_TIMESTAMP);