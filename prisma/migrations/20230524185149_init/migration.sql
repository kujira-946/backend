/*
  Warnings:

  - You are about to drop the column `userId` on the `BugReport` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `BugReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BugReport" DROP CONSTRAINT "BugReport_userId_fkey";

-- AlterTable
ALTER TABLE "BugReport" DROP COLUMN "userId",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
