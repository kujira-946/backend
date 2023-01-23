-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'active');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'pending';
