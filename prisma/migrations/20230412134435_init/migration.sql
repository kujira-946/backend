/*
  Warnings:

  - You are about to drop the column `totalCost` on the `OverviewGroup` table. All the data in the column will be lost.
  - Made the column `description` on table `Purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Logbook" ADD COLUMN     "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OverviewGroup" DROP COLUMN "totalCost",
ADD COLUMN     "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "description" SET NOT NULL;
