/*
  Warnings:

  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'confirmed');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'pending';

-- DropEnum
DROP TYPE "Status";
