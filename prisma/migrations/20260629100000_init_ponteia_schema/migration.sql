-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProjectAxis" AS ENUM ('AMBIENTAL', 'CULTURAL', 'SOCIAL');

-- CreateEnum
CREATE TYPE "DonationAsset" AS ENUM ('USDGLO', 'XLM', 'USDC', 'BRZ', 'PIX');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('REPORT', 'INVOICE_PHOTO', 'CLASS_PHOTO', 'TESTIMONIAL', 'IMPACT_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('NOT_REQUESTED', 'PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PROJECT_CREATED', 'PROJECT_APPROVED', 'PROJECT_REJECTED', 'PROJECT_FEATURED', 'PROJECT_UNFEATURED', 'EVIDENCE_CREATED', 'DONATION_CONFIRMED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "walletAddress" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "responsibleEmail" TEXT NOT NULL,
    "walletAddress" TEXT,
    "pixKey" TEXT,
    "pixQrCodeUrl" TEXT,
    "goalAmount" DECIMAL(18,6) NOT NULL,
    "goalAsset" "DonationAsset" NOT NULL DEFAULT 'USDGLO',
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "axes" "ProjectAxis"[],
    "payoutProvider" TEXT,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "bankAccountLast4" TEXT,
    "payoutReference" TEXT,
    "offRampEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "donorWallet" TEXT,
    "amount" DECIMAL(18,6) NOT NULL,
    "asset" "DonationAsset" NOT NULL,
    "network" TEXT NOT NULL,
    "txHash" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "destinationAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "action" "AuditAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_txHash_key" ON "Donation"("txHash");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
