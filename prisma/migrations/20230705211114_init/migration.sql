/*
  Warnings:

  - You are about to drop the column `body` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `logbookEntryId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `overviewGroupId` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `LogbookEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OverviewGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `issue` to the `BugReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Made the column `placement` on table `Purchase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BugReport" DROP CONSTRAINT "BugReport_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "LogbookEntry" DROP CONSTRAINT "LogbookEntry_logbookId_fkey";

-- DropForeignKey
ALTER TABLE "OverviewGroup" DROP CONSTRAINT "OverviewGroup_overviewId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_logbookEntryId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_overviewGroupId_fkey";

-- AlterTable
ALTER TABLE "BugReport" DROP COLUMN "body",
DROP COLUMN "title",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "issue" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "logbookEntryId",
DROP COLUMN "overviewGroupId",
ADD COLUMN     "entryId" INTEGER NOT NULL,
ALTER COLUMN "placement" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthday",
DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- DropTable
DROP TABLE "LogbookEntry";

-- DropTable
DROP TABLE "OverviewGroup";

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthday" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "overviewId" INTEGER,
    "logbookId" INTEGER,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_ownerId_key" ON "Profile"("ownerId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_overviewId_fkey" FOREIGN KEY ("overviewId") REFERENCES "Overview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "Logbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
