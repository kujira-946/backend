/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Overview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `overviewId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Overview" DROP CONSTRAINT "Overview_ownerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "overviewId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Overview_ownerId_key" ON "Overview"("ownerId");

-- AddForeignKey
ALTER TABLE "Overview" ADD CONSTRAINT "Overview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
