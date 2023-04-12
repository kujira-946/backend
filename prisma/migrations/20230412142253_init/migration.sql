/*
  Warnings:

  - You are about to drop the column `totalSpent` on the `Logbook` table. All the data in the column will be lost.
  - You are about to drop the column `spent` on the `LogbookEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Logbook" DROP COLUMN "totalSpent";

-- AlterTable
ALTER TABLE "LogbookEntry" DROP COLUMN "spent",
ADD COLUMN     "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;
