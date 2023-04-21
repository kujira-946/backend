-- DropForeignKey
ALTER TABLE "Overview" DROP CONSTRAINT "Overview_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Overview" ADD CONSTRAINT "Overview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
