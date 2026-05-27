/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `banned` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('agent', 'client', 'owner');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('agricultural', 'nonagricultural', 'hotel', 'tenament', 'flat', 'plot');

-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('sqfoot', 'acer', 'bigha', 'guntha');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('rent', 'rented', 'sell', 'soldout', 'buy', 'hold', 'draft');

-- CreateEnum
CREATE TYPE "PropertyDocumentType" AS ENUM ('preview', 'document', 'agreement');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('month', 'year');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('active', 'complete', 'expired', 'terminated', 'pending', 'hold');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('active', 'completed', 'terminated');

-- CreateEnum
CREATE TYPE "UserDocumentType" AS ENUM ('aadhar_card', 'pan_card', 'election_card', 'other');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'user',
ALTER COLUMN "banned" SET NOT NULL;

-- CreateTable
CREATE TABLE "user_role_mapping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleType" "UserType" NOT NULL,

    CONSTRAINT "user_role_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "address" TEXT NOT NULL,
    "measurementValue" DECIMAL(10,2),
    "measurementType" "MeasurementType",
    "coordinates" JSONB,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "location" TEXT NOT NULL,
    "status" "RequirementStatus" NOT NULL DEFAULT 'active',
    "measurementType" "MeasurementType",
    "minMeasurement" DECIMAL(10,2),
    "maxMeasurement" DECIMAL(10,2),
    "minPrice" DECIMAL(15,2),
    "maxPrice" DECIMAL(15,2),
    "propertyForType" "PropertyStatus" NOT NULL,
    "clientId" TEXT,
    "agentId" TEXT,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_status_mapping" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL,
    "price" DECIMAL(15,2),
    "durationTypeId" "DurationType",

    CONSTRAINT "property_status_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_user_mapping" (
    "id" SERIAL NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" INTEGER NOT NULL,

    CONSTRAINT "property_user_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_document" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(500) NOT NULL,
    "extension" VARCHAR(45) NOT NULL,
    "relativePath" VARCHAR(500) NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agreementId" INTEGER,
    "documentType" "PropertyDocumentType" NOT NULL,
    "orderId" INTEGER NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_agreement" (
    "id" SERIAL NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'pending',
    "date" DATE NOT NULL,
    "validTill" DATE,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "property_agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_agreement_payment" (
    "id" SERIAL NOT NULL,
    "agreementId" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paidDate" DATE NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "property_agreement_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_shared_link" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(500),
    "propertyId" TEXT NOT NULL,
    "expiry" TIMESTAMP(3),
    "detail" JSONB NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_shared_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "documentRelativePath" VARCHAR(500) NOT NULL,
    "documentType" "UserDocumentType" NOT NULL,
    "orderId" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_createdBy_idx" ON "property"("createdBy");

-- CreateIndex
CREATE INDEX "property_propertyType_idx" ON "property"("propertyType");

-- CreateIndex
CREATE INDEX "requirement_createdBy_idx" ON "requirement"("createdBy");

-- CreateIndex
CREATE INDEX "requirement_clientId_idx" ON "requirement"("clientId");

-- CreateIndex
CREATE INDEX "requirement_agentId_idx" ON "requirement"("agentId");

-- CreateIndex
CREATE INDEX "property_status_mapping_propertyId_idx" ON "property_status_mapping"("propertyId");

-- CreateIndex
CREATE INDEX "property_user_mapping_propertyId_idx" ON "property_user_mapping"("propertyId");

-- CreateIndex
CREATE INDEX "property_user_mapping_userId_idx" ON "property_user_mapping"("userId");

-- CreateIndex
CREATE INDEX "property_document_propertyId_idx" ON "property_document"("propertyId");

-- CreateIndex
CREATE INDEX "property_document_agreementId_idx" ON "property_document"("agreementId");

-- CreateIndex
CREATE INDEX "property_agreement_propertyId_idx" ON "property_agreement"("propertyId");

-- CreateIndex
CREATE INDEX "property_agreement_ownerId_idx" ON "property_agreement"("ownerId");

-- CreateIndex
CREATE INDEX "property_agreement_clientId_idx" ON "property_agreement"("clientId");

-- CreateIndex
CREATE INDEX "property_shared_link_propertyId_idx" ON "property_shared_link"("propertyId");

-- CreateIndex
CREATE INDEX "property_shared_link_sharedBy_idx" ON "property_shared_link"("sharedBy");

-- CreateIndex
CREATE INDEX "user_document_userId_idx" ON "user_document"("userId");

-- CreateIndex
CREATE INDEX "user_document_createdBy_idx" ON "user_document"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_mapping" ADD CONSTRAINT "user_role_mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_status_mapping" ADD CONSTRAINT "property_status_mapping_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_user_mapping" ADD CONSTRAINT "property_user_mapping_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_user_mapping" ADD CONSTRAINT "property_user_mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_document" ADD CONSTRAINT "property_document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_document" ADD CONSTRAINT "property_document_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "property_agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement" ADD CONSTRAINT "property_agreement_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement" ADD CONSTRAINT "property_agreement_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement" ADD CONSTRAINT "property_agreement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement" ADD CONSTRAINT "property_agreement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement" ADD CONSTRAINT "property_agreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement_payment" ADD CONSTRAINT "property_agreement_payment_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "property_agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement_payment" ADD CONSTRAINT "property_agreement_payment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_agreement_payment" ADD CONSTRAINT "property_agreement_payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_shared_link" ADD CONSTRAINT "property_shared_link_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_shared_link" ADD CONSTRAINT "property_shared_link_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_document" ADD CONSTRAINT "user_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_document" ADD CONSTRAINT "user_document_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
