import { Prisma } from "@prisma/client";

const purchaseRelationsValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  include: {
    overviewRecurringPurchases: true,
    overviewIncomingPurchases: true,
    logbookDay: true,
    logbookReviewNeeds: true,
    logbookReviewPlannedWants: true,
    logbookReviewImpulsiveWants: true,
    logbookReviewRegrets: true,
  },
});
export type PurchaseRelationsValidator = Prisma.PurchaseGetPayload<
  typeof purchaseRelationsValidator
>;
