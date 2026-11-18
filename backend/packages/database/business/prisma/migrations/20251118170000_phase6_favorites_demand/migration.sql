CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Favorite_subjectId_offerId_key" ON "Favorite"("subjectId", "offerId");
CREATE INDEX "Favorite_subjectId_createdAt_idx" ON "Favorite"("subjectId", "createdAt" DESC);

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "DemandRequestStatus" AS ENUM ('PENDING', 'REVIEWED', 'CLOSED', 'REJECTED');

CREATE TABLE "DemandRequest" (
    "id" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "categoryId" TEXT NOT NULL,
    "relatedOfferId" UUID,
    "description" TEXT NOT NULL,
    "budgetAmount" DECIMAL(18,2),
    "budgetCurrency" TEXT DEFAULT 'IRR',
    "consentGivenAt" TIMESTAMP(3) NOT NULL,
    "status" "DemandRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DemandRequest_status_createdAt_idx" ON "DemandRequest"("status", "createdAt" DESC);
CREATE INDEX "DemandRequest_subjectId_createdAt_idx" ON "DemandRequest"("subjectId", "createdAt" DESC);

ALTER TABLE "DemandRequest" ADD CONSTRAINT "DemandRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;