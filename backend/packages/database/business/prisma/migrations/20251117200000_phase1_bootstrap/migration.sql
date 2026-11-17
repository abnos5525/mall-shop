-- CreateTable
CREATE TABLE "SchemaBootstrap" (
    "id" TEXT NOT NULL DEFAULT 'bootstrap',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemaBootstrap_pkey" PRIMARY KEY ("id")
);