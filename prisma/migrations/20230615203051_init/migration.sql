/*
  Warnings:

  - You are about to drop the column `signedVerificationCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "signedVerificationCode";

-- CreateTable
CREATE TABLE "Verification" (
    "id" SERIAL NOT NULL,
    "signedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verification_ownerId_key" ON "Verification"("ownerId");

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
