/*
  Warnings:

  - The `currency` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD');

-- AlterEnum
ALTER TYPE "Theme" ADD VALUE 'auto';

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_ownerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signedVerificationCode" TEXT,
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';

-- DropTable
DROP TABLE "Verification";
