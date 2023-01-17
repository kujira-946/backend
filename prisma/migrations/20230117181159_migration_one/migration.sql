-- CreateEnum
CREATE TYPE "Category" AS ENUM ('NEED', 'WANT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" VARCHAR(16) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "mobileNumber" TEXT,
    "totalMoneySavedToDate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Overview" (
    "id" SERIAL NOT NULL,
    "income" DOUBLE PRECISION,
    "savings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Overview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverviewCostItem" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "overviewRecurringCostId" INTEGER,
    "overviewIncomingCostId" INTEGER,

    CONSTRAINT "OverviewCostItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logbook" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Logbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogGroup" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logbookId" INTEGER NOT NULL,

    CONSTRAINT "LogGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogGroupPurchaseItem" (
    "id" SERIAL NOT NULL,
    "placement" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logGroupId" INTEGER NOT NULL,
    "logbookReviewNeedsId" INTEGER,
    "logbookReviewPlannedWantsId" INTEGER,
    "logbookReviewImpulsiveWantsId" INTEGER,
    "logbookReviewRegretsId" INTEGER,

    CONSTRAINT "LogGroupPurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogbookReview" (
    "id" SERIAL NOT NULL,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "LogbookReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Overview_ownerId_key" ON "Overview"("ownerId");

-- AddForeignKey
ALTER TABLE "Overview" ADD CONSTRAINT "Overview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewCostItem" ADD CONSTRAINT "OverviewCostItem_overviewRecurringCostId_fkey" FOREIGN KEY ("overviewRecurringCostId") REFERENCES "Overview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewCostItem" ADD CONSTRAINT "OverviewCostItem_overviewIncomingCostId_fkey" FOREIGN KEY ("overviewIncomingCostId") REFERENCES "Overview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logbook" ADD CONSTRAINT "Logbook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogGroup" ADD CONSTRAINT "LogGroup_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "Logbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogGroupPurchaseItem" ADD CONSTRAINT "LogGroupPurchaseItem_logGroupId_fkey" FOREIGN KEY ("logGroupId") REFERENCES "LogGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogGroupPurchaseItem" ADD CONSTRAINT "LogGroupPurchaseItem_logbookReviewNeedsId_fkey" FOREIGN KEY ("logbookReviewNeedsId") REFERENCES "LogbookReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogGroupPurchaseItem" ADD CONSTRAINT "LogGroupPurchaseItem_logbookReviewPlannedWantsId_fkey" FOREIGN KEY ("logbookReviewPlannedWantsId") REFERENCES "LogbookReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogGroupPurchaseItem" ADD CONSTRAINT "LogGroupPurchaseItem_logbookReviewImpulsiveWantsId_fkey" FOREIGN KEY ("logbookReviewImpulsiveWantsId") REFERENCES "LogbookReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogGroupPurchaseItem" ADD CONSTRAINT "LogGroupPurchaseItem_logbookReviewRegretsId_fkey" FOREIGN KEY ("logbookReviewRegretsId") REFERENCES "LogbookReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogbookReview" ADD CONSTRAINT "LogbookReview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
