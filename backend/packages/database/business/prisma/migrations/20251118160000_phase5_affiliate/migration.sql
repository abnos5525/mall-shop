CREATE TYPE "OutboundDestinationKind" AS ENUM ('AFFILIATE', 'DIRECT');

CREATE TABLE "AffiliatePartner" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliatePartner_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Offer" ADD COLUMN "partnerId" TEXT;
CREATE INDEX "Offer_partnerId_idx" ON "Offer"("partnerId");
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "AffiliatePartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "OutboundClick" (
    "id" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "offerSlug" TEXT NOT NULL,
    "destinationKind" "OutboundDestinationKind" NOT NULL,
    "redirectHost" TEXT NOT NULL,
    "visitorHash" TEXT,
    "subjectId" UUID,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboundClick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OutboundClick_idempotencyKey_key" ON "OutboundClick"("idempotencyKey");
CREATE INDEX "OutboundClick_offerId_createdAt_idx" ON "OutboundClick"("offerId", "createdAt" DESC);
CREATE INDEX "OutboundClick_createdAt_idx" ON "OutboundClick"("createdAt");

ALTER TABLE "OutboundClick" ADD CONSTRAINT "OutboundClick_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;